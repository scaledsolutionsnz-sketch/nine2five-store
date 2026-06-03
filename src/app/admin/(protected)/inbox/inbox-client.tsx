"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Mail, RefreshCw, Search, ChevronDown, Loader2, Send,
  Sparkles, X, Clock, CheckCircle, AlertCircle, Archive,
  RotateCcw, Wifi, WifiOff, User, Phone, MapPin, DollarSign,
  Calendar, MessageSquare, ExternalLink, Trash2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ThreadStatus = "needs_reply" | "replied" | "waiting_on_client" | "follow_up_later" | "closed";

interface Thread {
  id: string;
  gmail_thread_id: string;
  participant_email: string;
  participant_name: string | null;
  subject: string;
  status: ThreadStatus;
  snippet: string | null;
  message_count: number;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  updated_at: string;
  customer_id: string | null;
  follow_up_date: string | null;
}

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  from_email: string;
  from_name: string | null;
  to_emails: string[];
  cc_emails: string[];
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  snippet: string | null;
  sent_at: string;
}

interface Draft {
  to_email: string | null;
  cc_emails: string[];
  bcc_emails: string[];
  subject: string | null;
  body_text: string | null;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  default_shipping_address: { city?: string; region?: string; country?: string } | null;
  lifetime_value_cents: number;
  created_at: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ThreadStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  needs_reply:       { label: "Needs Reply",       color: "#ef4444", bg: "rgba(239,68,68,0.12)",    icon: <AlertCircle style={{ width: 11, height: 11 }} /> },
  replied:           { label: "Replied",           color: "#2f9b2f", bg: "rgba(47,155,47,0.12)",    icon: <CheckCircle style={{ width: 11, height: 11 }} /> },
  waiting_on_client: { label: "Waiting on Client", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",   icon: <Clock style={{ width: 11, height: 11 }} /> },
  follow_up_later:   { label: "Follow Up Later",   color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",   icon: <Calendar style={{ width: 11, height: 11 }} /> },
  closed:            { label: "Closed",            color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.06)", icon: <Archive style={{ width: 11, height: 11 }} /> },
};

const FILTERS: Array<{ key: string; label: string }> = [
  { key: "needs_reply",       label: "Needs Reply" },
  { key: "all",               label: "All" },
  { key: "replied",           label: "Replied" },
  { key: "waiting_on_client", label: "Waiting" },
  { key: "follow_up_later",   label: "Follow Up" },
  { key: "closed",            label: "Closed" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
}

function initials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["#2f9b2f", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];
function avatarColor(email: string): string {
  let h = 0;
  for (let i = 0; i < email.length; i++) h += email.charCodeAt(i);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ThreadStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 999,
      background: c.bg, color: c.color,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
    }}>
      {c.icon} {c.label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  gmailConnected: boolean;
  gmailEmail: string | null;
  lastSyncAt: string | null;
  initialThreads: Thread[];
  needsReplyCount: number;
}

export function InboxClient({ gmailConnected, gmailEmail, lastSyncAt, initialThreads, needsReplyCount: initialCount }: Props) {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [activeFilter, setActiveFilter] = useState<string>("needs_reply");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [threadDetail, setThreadDetail] = useState<Thread | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [needsReplyCount, setNeedsReplyCount] = useState(initialCount);

  // Reply box state
  const [replyTo, setReplyTo] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyCc, setReplyCc] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [replyBcc, setReplyBcc] = useState("");
  const [sending, setSending] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // AI draft state
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiInstructions, setAiInstructions] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  // Follow-up modal
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Load threads ──────────────────────────────────────────────────────────

  const loadThreads = useCallback(async () => {
    const params = new URLSearchParams({ status: activeFilter });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/inbox/threads?${params}`);
    if (res.ok) {
      const data = await res.json();
      setThreads(data.threads);
      setNeedsReplyCount(data.needsReplyCount);
    }
  }, [activeFilter, search]);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  // ── Auto-scroll messages ─────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Select thread ────────────────────────────────────────────────────────

  async function selectThread(id: string) {
    setSelectedId(id);
    setLoadingThread(true);
    try {
      const res = await fetch(`/api/admin/inbox/threads/${id}`);
      if (res.ok) {
        const data = await res.json();
        setThreadDetail(data.thread);
        setMessages(data.messages);
        setCustomer(data.customer ?? null);
        // Populate reply box
        const t = data.thread as Thread;
        setReplyTo(t.participant_email);
        setReplySubject(t.subject.startsWith("Re:") ? t.subject : `Re: ${t.subject}`);
        if (data.draft) {
          setDraft(data.draft);
          setReplyBody(data.draft.body_text ?? "");
          setReplyCc((data.draft.cc_emails ?? []).join(", "));
          setReplyBcc((data.draft.bcc_emails ?? []).join(", "));
        } else {
          setDraft(null);
          setReplyBody("");
          setReplyCc("");
          setReplyBcc("");
        }
        setShowAiPanel(false);
        setAiInstructions("");
      }
    } finally {
      setLoadingThread(false);
    }
  }

  // ── Sync ─────────────────────────────────────────────────────────────────

  async function sync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/inbox/sync", { method: "POST" });
      if (res.ok) await loadThreads();
    } finally {
      setSyncing(false);
    }
  }

  // ── Send reply ───────────────────────────────────────────────────────────

  async function sendReply() {
    if (!selectedId || !replyBody.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/inbox/threads/${selectedId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: replyTo,
          cc: replyCc ? replyCc.split(",").map((s) => s.trim()).filter(Boolean) : [],
          bcc: replyBcc ? replyBcc.split(",").map((s) => s.trim()).filter(Boolean) : [],
          subject: replySubject,
          body: replyBody,
        }),
      });
      if (res.ok) {
        await selectThread(selectedId);
        await loadThreads();
      }
    } finally {
      setSending(false);
    }
  }

  // ── Save draft ───────────────────────────────────────────────────────────

  async function saveDraft() {
    if (!selectedId) return;
    setSavingDraft(true);
    try {
      await fetch(`/api/admin/inbox/threads/${selectedId}/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_email: replyTo,
          cc_emails: replyCc ? replyCc.split(",").map((s) => s.trim()).filter(Boolean) : [],
          bcc_emails: replyBcc ? replyBcc.split(",").map((s) => s.trim()).filter(Boolean) : [],
          subject: replySubject,
          body_text: replyBody,
        }),
      });
    } finally {
      setSavingDraft(false);
    }
  }

  // ── Discard draft ─────────────────────────────────────────────────────────

  async function discardDraft() {
    if (!selectedId) return;
    await fetch(`/api/admin/inbox/threads/${selectedId}/draft`, { method: "DELETE" });
    setReplyBody("");
    setDraft(null);
  }

  // ── Update status ─────────────────────────────────────────────────────────

  async function updateStatus(id: string, status: ThreadStatus, followUpDate?: string) {
    const body: Record<string, unknown> = { status };
    if (followUpDate) body.follow_up_date = followUpDate;
    const res = await fetch(`/api/admin/inbox/threads/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      await loadThreads();
      if (threadDetail?.id === id) {
        setThreadDetail((prev) => prev ? { ...prev, status } : prev);
      }
    }
    setShowFollowUp(false);
  }

  // ── AI draft ─────────────────────────────────────────────────────────────

  async function generateAiDraft() {
    if (!selectedId) return;
    setGeneratingAi(true);
    try {
      const res = await fetch("/api/admin/inbox/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: selectedId, extraInstructions: aiInstructions }),
      });
      if (res.ok) {
        const data = await res.json();
        setReplyBody(data.draft);
        setShowAiPanel(false);
      }
    } finally {
      setGeneratingAi(false);
    }
  }

  // ── Filtered threads ─────────────────────────────────────────────────────

  const filtered = threads.filter((t) => {
    if (activeFilter !== "all" && t.status !== activeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        t.participant_email.toLowerCase().includes(s) ||
        (t.participant_name ?? "").toLowerCase().includes(s) ||
        t.subject.toLowerCase().includes(s) ||
        (t.snippet ?? "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  // ── Not connected ─────────────────────────────────────────────────────────

  if (!gmailConnected) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{
          maxWidth: 480, textAlign: "center", padding: "48px 40px",
          background: "rgba(8,28,16,0.92)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20,
        }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(47,155,47,0.1)", border: "1px solid rgba(47,155,47,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Mail style={{ width: 28, height: 28, color: "#2f9b2f" }} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#ffffff", marginBottom: 12 }}>Connect Gmail</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
            Connect your Gmail account to start managing client emails directly from the CRM. You&apos;ll need to add your Gmail API credentials in Vercel first.
          </p>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "16px 20px", marginBottom: 28, textAlign: "left" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#2f9b2f", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>Setup Required</p>
            <ol style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 1.7, paddingLeft: 16, margin: 0 }}>
              <li>Create a Google Cloud project &amp; enable Gmail API</li>
              <li>Create OAuth 2.0 credentials</li>
              <li>Set redirect URI: <code style={{ color: "#2f9b2f", fontSize: 11 }}>https://nine2five.nz/api/admin/gmail/callback</code></li>
              <li>Add to Vercel: <code style={{ color: "#2f9b2f", fontSize: 11 }}>GMAIL_CLIENT_ID</code>, <code style={{ color: "#2f9b2f", fontSize: 11 }}>GMAIL_CLIENT_SECRET</code></li>
            </ol>
          </div>
          <a
            href="/api/admin/gmail/auth"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#2f9b2f", color: "#fff", padding: "12px 28px",
              borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: "none",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}
          >
            <Mail style={{ width: 14, height: 14 }} /> Connect Gmail Account
          </a>
        </div>
      </div>
    );
  }

  // ── Main inbox layout ────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden", gap: 0, margin: "-32px -32px 0" }}>

      {/* ── LEFT: Thread list ─────────────────────────────────────────────── */}
      <div style={{
        width: 300, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.09)",
        background: "rgba(8,28,16,0.92)", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 16px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Mail style={{ width: 15, height: 15, color: "#2f9b2f" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#ffffff" }}>Inbox</span>
              {needsReplyCount > 0 && (
                <span style={{ background: "#2f9b2f", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999 }}>
                  {needsReplyCount}
                </span>
              )}
            </div>
            <button
              onClick={sync}
              disabled={syncing}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
            >
              <RefreshCw style={{ width: 11, height: 11, animation: syncing ? "spin 1s linear infinite" : "none" }} />
              {syncing ? "Syncing…" : "Sync"}
            </button>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "rgba(255,255,255,0.35)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              style={{ width: "100%", height: 34, paddingLeft: 30, paddingRight: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 2, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                style={{
                  flexShrink: 0, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  background: activeFilter === key ? "#2f9b2f" : "transparent",
                  color: activeFilter === key ? "#fff" : "rgba(255,255,255,0.4)",
                  border: `1px solid ${activeFilter === key ? "#2f9b2f" : "rgba(255,255,255,0.09)"}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Thread list */}
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>No conversations</p>
            </div>
          ) : (
            filtered.map((t) => {
              const active = t.id === selectedId;
              const sc = STATUS_CONFIG[t.status];
              return (
                <button
                  key={t.id}
                  onClick={() => selectThread(t.id)}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: "12px 14px",
                    background: active ? "rgba(47,155,47,0.1)" : "transparent",
                    borderLeft: `${active ? "3px" : "2px"} solid ${active ? "#2f9b2f" : "transparent"}`,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                      background: avatarColor(t.participant_email),
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>
                        {initials(t.participant_name, t.participant_email)}
                      </span>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.participant_name || t.participant_email}
                        </span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", flexShrink: 0, marginLeft: 6 }}>
                          {timeAgo(t.updated_at)}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 5 }}>
                        {t.subject}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {t.snippet}
                        </p>
                        <span style={{ marginLeft: 6, display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", borderRadius: 999, background: sc.bg, color: sc.color, fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                          {sc.icon}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        {gmailEmail && (
          <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 6 }}>
            <Wifi style={{ width: 11, height: 11, color: "#2f9b2f" }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{gmailEmail}</span>
          </div>
        )}
      </div>

      {/* ── MIDDLE: Thread view ───────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#06150C" }}>
        {!selectedId ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <MessageSquare style={{ width: 40, height: 40, color: "rgba(255,255,255,0.1)", margin: "0 auto 16px" }} />
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Select a conversation</p>
            </div>
          </div>
        ) : loadingThread ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loader2 style={{ width: 24, height: 24, color: "#2f9b2f", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(8,28,16,0.92)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {threadDetail?.subject}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {threadDetail && <StatusBadge status={threadDetail.status} />}
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      {messages.length} message{messages.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                {/* Status actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {threadDetail?.status !== "replied" && (
                    <button onClick={() => updateStatus(selectedId, "replied")}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "rgba(47,155,47,0.1)", border: "1px solid rgba(47,155,47,0.2)", borderRadius: 7, color: "#2f9b2f", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      <CheckCircle style={{ width: 11, height: 11 }} /> Replied
                    </button>
                  )}
                  {threadDetail?.status !== "waiting_on_client" && (
                    <button onClick={() => updateStatus(selectedId, "waiting_on_client")}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 7, color: "#f59e0b", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      <Clock style={{ width: 11, height: 11 }} /> Waiting
                    </button>
                  )}
                  <button onClick={() => setShowFollowUp(true)}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 7, color: "#8b5cf6", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    <Calendar style={{ width: 11, height: 11 }} /> Follow Up
                  </button>
                  {threadDetail?.status !== "closed" && (
                    <button onClick={() => updateStatus(selectedId, "closed")}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 7, color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      <Archive style={{ width: 11, height: 11 }} /> Close
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", scrollbarWidth: "none" }}>
              {messages.map((msg, i) => {
                const isOut = msg.direction === "outbound";
                return (
                  <div key={msg.id} style={{ marginBottom: i < messages.length - 1 ? 16 : 8 }}>
                    {/* Message header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        background: isOut ? "#2f9b2f" : avatarColor(msg.from_email),
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>
                          {initials(msg.from_name, msg.from_email)}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff" }}>
                          {isOut ? "You" : (msg.from_name || msg.from_email)}
                        </span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: 8 }}>
                          {new Date(msg.sent_at).toLocaleString("en-NZ", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </div>
                      {isOut && (
                        <span style={{ marginLeft: "auto", fontSize: 9, color: "#2f9b2f", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sent</span>
                      )}
                    </div>
                    {/* Message body */}
                    <div style={{
                      marginLeft: 38,
                      padding: "14px 16px",
                      background: isOut ? "rgba(47,155,47,0.07)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isOut ? "rgba(47,155,47,0.15)" : "rgba(255,255,255,0.09)"}`,
                      borderRadius: 12,
                    }}>
                      {msg.body_html ? (
                        <div
                          style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.75)", wordBreak: "break-word" }}
                          dangerouslySetInnerHTML={{ __html: msg.body_html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") }}
                        />
                      ) : (
                        <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.75)", whiteSpace: "pre-wrap" }}>
                          {msg.body_text || msg.snippet}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply box */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(8,28,16,0.92)", flexShrink: 0 }}>
              {/* Reply fields */}
              <div style={{ padding: "12px 16px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {[
                  { label: "To", value: replyTo, onChange: setReplyTo },
                  { label: "Subject", value: replySubject, onChange: setReplySubject },
                ].map(({ label, value, onChange }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", width: 48, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>{label}</span>
                    <input
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      style={{ flex: 1, height: 28, background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 12, outline: "none" }}
                    />
                  </div>
                ))}
                {showCcBcc && (
                  <>
                    {[
                      { label: "CC", value: replyCc, onChange: setReplyCc },
                      { label: "BCC", value: replyBcc, onChange: setReplyBcc },
                    ].map(({ label, value, onChange }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", width: 48, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>{label}</span>
                        <input
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                          style={{ flex: 1, height: 28, background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 12, outline: "none" }}
                        />
                      </div>
                    ))}
                  </>
                )}
                <button onClick={() => setShowCcBcc((v) => !v)}
                  style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", marginBottom: 8, padding: 0, display: "flex", alignItems: "center", gap: 3 }}>
                  <ChevronDown style={{ width: 10, height: 10, transform: showCcBcc ? "rotate(180deg)" : "none" }} />
                  {showCcBcc ? "Hide CC/BCC" : "Add CC / BCC"}
                </button>
              </div>

              {/* Body */}
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write your reply…"
                rows={6}
                style={{
                  width: "100%", padding: "12px 16px", background: "transparent",
                  border: "none", color: "#fff", fontSize: 13, lineHeight: 1.6,
                  resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                }}
              />

              {/* AI panel */}
              {showAiPanel && (
                <div style={{ padding: "12px 16px", background: "rgba(139,92,246,0.06)", borderTop: "1px solid rgba(139,92,246,0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Sparkles style={{ width: 13, height: 13, color: "#8b5cf6" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#8b5cf6" }}>AI Draft Instructions (optional)</span>
                  </div>
                  <textarea
                    value={aiInstructions}
                    onChange={(e) => setAiInstructions(e.target.value)}
                    placeholder="e.g. Make it casual, mention we can deliver by Friday, ask if they want a demo…"
                    rows={2}
                    style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 12, resize: "none", outline: "none", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={generateAiDraft}
                      disabled={generatingAi}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#8b5cf6", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      {generatingAi ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> : <Sparkles style={{ width: 12, height: 12 }} />}
                      {generatingAi ? "Generating…" : "Generate Draft"}
                    </button>
                    <button onClick={() => setShowAiPanel(false)}
                      style={{ padding: "7px 12px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 12, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={sendReply}
                    disabled={sending || !replyBody.trim()}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 18px", background: replyBody.trim() ? "#2f9b2f" : "rgba(255,255,255,0.06)",
                      border: "none", borderRadius: 8, color: replyBody.trim() ? "#fff" : "rgba(255,255,255,0.35)",
                      fontSize: 12, fontWeight: 700, cursor: replyBody.trim() ? "pointer" : "not-allowed",
                    }}>
                    {sending ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> : <Send style={{ width: 12, height: 12 }} />}
                    {sending ? "Sending…" : "Send"}
                  </button>
                  <button
                    onClick={saveDraft}
                    disabled={savingDraft}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {savingDraft ? <Loader2 style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} /> : null}
                    Save Draft
                  </button>
                  {replyBody && (
                    <button onClick={discardDraft}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: "rgba(239,68,68,0.6)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      <Trash2 style={{ width: 11, height: 11 }} /> Discard
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowAiPanel((v) => !v)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: showAiPanel ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 8, color: "#8b5cf6", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  <Sparkles style={{ width: 11, height: 11 }} /> AI Draft
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT: Contact details ────────────────────────────────────────── */}
      {selectedId && threadDetail && (
        <div style={{
          width: 260, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.09)",
          background: "rgba(8,28,16,0.92)", overflowY: "auto", padding: "20px 16px", scrollbarWidth: "none",
        }}>
          {/* Avatar */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", margin: "0 auto 12px",
              background: avatarColor(threadDetail.participant_email),
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>
                {initials(threadDetail.participant_name, threadDetail.participant_email)}
              </span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>
              {threadDetail.participant_name || threadDetail.participant_email}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{threadDetail.participant_email}</p>
          </div>

          {/* Status */}
          <div style={{ marginBottom: 16, textAlign: "center" }}>
            <StatusBadge status={threadDetail.status} />
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.09)", marginBottom: 16 }} />

          {/* Customer details */}
          {customer ? (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Customer</p>
              {[
                { icon: <User style={{ width: 11, height: 11 }} />, label: `${customer.first_name} ${customer.last_name}` },
                { icon: <Mail style={{ width: 11, height: 11 }} />, label: customer.email },
                customer.phone ? { icon: <Phone style={{ width: 11, height: 11 }} />, label: customer.phone } : null,
                customer.default_shipping_address?.city ? { icon: <MapPin style={{ width: 11, height: 11 }} />, label: `${customer.default_shipping_address.city}, NZ` } : null,
                { icon: <DollarSign style={{ width: 11, height: 11 }} />, label: `$${((customer.lifetime_value_cents) / 100).toFixed(2)} spent` },
              ].filter(Boolean).map((item, i) => item && (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: "#2f9b2f", flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{item.label}</span>
                </div>
              ))}
              <a
                href={`/admin/customers?search=${customer.email}`}
                style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 11, color: "#2f9b2f", textDecoration: "none", fontWeight: 600 }}>
                <ExternalLink style={{ width: 11, height: 11 }} /> View in CRM
              </a>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>Contact</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail style={{ width: 11, height: 11, color: "#2f9b2f" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{threadDetail.participant_email}</span>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>Not in CRM yet</p>
            </div>
          )}

          <div style={{ height: 1, background: "rgba(255,255,255,0.09)", marginBottom: 16 }} />

          {/* Email activity */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Email Activity</p>
            {[
              { label: "Last received", value: threadDetail.last_inbound_at ? timeAgo(threadDetail.last_inbound_at) : "—" },
              { label: "Last sent", value: threadDetail.last_outbound_at ? timeAgo(threadDetail.last_outbound_at) : "—" },
              { label: "Messages", value: String(threadDetail.message_count) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Quick status actions */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.09)", margin: "16px 0" }} />
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>Quick Actions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(["needs_reply", "replied", "waiting_on_client", "closed"] as ThreadStatus[])
              .filter((s) => s !== threadDetail.status)
              .map((s) => {
                const sc = STATUS_CONFIG[s];
                return (
                  <button key={s} onClick={() => updateStatus(selectedId, s)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: sc.bg, border: `1px solid ${sc.color}22`, borderRadius: 8, color: sc.color, fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                    {sc.icon} Mark as {sc.label}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Follow-up modal ───────────────────────────────────────────────── */}
      {showFollowUp && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowFollowUp(false)}>
          <div style={{ background: "rgba(8,28,16,0.92)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: 28, width: 320 }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>Follow Up Later</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>This conversation will return to your inbox on the selected date.</p>
            <input
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              style={{ width: "100%", height: 40, padding: "0 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13, marginBottom: 16, outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => selectedId && followUpDate && updateStatus(selectedId, "follow_up_later", new Date(followUpDate).toISOString())}
                disabled={!followUpDate}
                style={{ flex: 1, height: 38, background: followUpDate ? "#8b5cf6" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, color: followUpDate ? "#fff" : "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 700, cursor: followUpDate ? "pointer" : "not-allowed" }}>
                Set Reminder
              </button>
              <button onClick={() => setShowFollowUp(false)}
                style={{ height: 38, padding: "0 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 12, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
