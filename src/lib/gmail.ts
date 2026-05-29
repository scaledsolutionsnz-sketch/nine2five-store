import { google } from "googleapis";
import { createServiceClient } from "@/lib/supabase/server";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.modify",
];

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID!,
    process.env.GMAIL_CLIENT_SECRET!,
    process.env.GMAIL_REDIRECT_URI ?? "https://nine2five.nz/api/admin/gmail/callback"
  );
}

export function getAuthUrl(): string {
  const oauth2 = getOAuth2Client();
  return oauth2.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

export async function getAuthedClient() {
  const supabase = await createServiceClient();
  const { data: creds } = await supabase
    .from("gmail_credentials")
    .select("*")
    .limit(1)
    .single();

  if (!creds) return null;

  const oauth2 = getOAuth2Client();
  oauth2.setCredentials({
    access_token: creds.access_token,
    refresh_token: creds.refresh_token,
    expiry_date: creds.token_expiry ? new Date(creds.token_expiry).getTime() : undefined,
  });

  // Auto-refresh if expired
  oauth2.on("tokens", async (tokens) => {
    const update: Record<string, unknown> = {};
    if (tokens.access_token) update.access_token = tokens.access_token;
    if (tokens.expiry_date) update.token_expiry = new Date(tokens.expiry_date).toISOString();
    await supabase.from("gmail_credentials").update(update).eq("id", creds.id);
  });

  return { oauth2, credentials: creds };
}

export function decodeBase64(encoded: string): string {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(b64, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

function extractBody(payload: {
  mimeType?: string;
  body?: { data?: string };
  parts?: Array<{ mimeType?: string; body?: { data?: string }; parts?: unknown[] }>;
}): { html: string; text: string } {
  let html = "";
  let text = "";

  function walk(part: typeof payload) {
    if (part.mimeType === "text/html" && part.body?.data) {
      html = decodeBase64(part.body.data);
    } else if (part.mimeType === "text/plain" && part.body?.data) {
      text = decodeBase64(part.body.data);
    }
    if (part.parts) {
      (part.parts as typeof payload[]).forEach(walk);
    }
  }
  walk(payload);

  return { html, text };
}

function getHeader(headers: Array<{ name?: string; value?: string }>, name: string): string {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export interface ParsedEmail {
  gmailMessageId: string;
  gmailThreadId: string;
  direction: "inbound" | "outbound";
  fromEmail: string;
  fromName: string;
  toEmails: string[];
  ccEmails: string[];
  subject: string;
  bodyHtml: string;
  bodyText: string;
  snippet: string;
  sentAt: string;
}

export function parseGmailMessage(
  msg: {
    id?: string | null;
    threadId?: string | null;
    snippet?: string | null;
    payload?: {
      headers?: Array<{ name?: string; value?: string }>;
      mimeType?: string;
      body?: { data?: string };
      parts?: Array<{ mimeType?: string; body?: { data?: string }; parts?: unknown[] }>;
    };
    internalDate?: string | null;
    labelIds?: string[] | null;
  },
  ourEmail: string
): ParsedEmail {
  const headers = msg.payload?.headers ?? [];
  const from = getHeader(headers, "from");
  const to = getHeader(headers, "to");
  const cc = getHeader(headers, "cc");
  const subject = getHeader(headers, "subject") || "(no subject)";
  const date = getHeader(headers, "date");

  const parseAddress = (addr: string) => {
    const match = addr.match(/^(.*?)\s*<(.+?)>$/);
    if (match) return { name: match[1].replace(/"/g, "").trim(), email: match[2].trim() };
    return { name: "", email: addr.trim() };
  };

  const fromParsed = parseAddress(from);
  const toList = to ? to.split(",").map((a) => parseAddress(a).email).filter(Boolean) : [];
  const ccList = cc ? cc.split(",").map((a) => parseAddress(a).email).filter(Boolean) : [];

  const direction: "inbound" | "outbound" =
    fromParsed.email.toLowerCase() === ourEmail.toLowerCase() ? "outbound" : "inbound";

  const { html, text } = extractBody(msg.payload ?? {});
  const sentAt = msg.internalDate
    ? new Date(parseInt(msg.internalDate)).toISOString()
    : date
    ? new Date(date).toISOString()
    : new Date().toISOString();

  return {
    gmailMessageId: msg.id ?? "",
    gmailThreadId: msg.threadId ?? "",
    direction,
    fromEmail: fromParsed.email,
    fromName: fromParsed.name,
    toEmails: toList,
    ccEmails: ccList,
    subject,
    bodyHtml: html,
    bodyText: text,
    snippet: msg.snippet ?? "",
    sentAt,
  };
}

export async function sendGmailReply(params: {
  oauth2: ReturnType<typeof getOAuth2Client>;
  to: string;
  cc: string[];
  bcc: string[];
  subject: string;
  bodyText: string;
  inReplyTo?: string;
  threadId?: string;
  fromEmail: string;
}) {
  const gmail = google.gmail({ version: "v1", auth: params.oauth2 });

  const headers = [
    `From: ${params.fromEmail}`,
    `To: ${params.to}`,
    params.cc.length ? `Cc: ${params.cc.join(", ")}` : "",
    params.bcc.length ? `Bcc: ${params.bcc.join(", ")}` : "",
    `Subject: ${params.subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    params.inReplyTo ? `In-Reply-To: ${params.inReplyTo}` : "",
    params.inReplyTo ? `References: ${params.inReplyTo}` : "",
  ]
    .filter(Boolean)
    .join("\r\n");

  const raw = Buffer.from(`${headers}\r\n\r\n${params.bodyText}`)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
      threadId: params.threadId,
    },
  });

  return res.data;
}
