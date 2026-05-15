const BASE = "https://nine2five.co.nz";

export function makeTrackingToken(campaignId: string, email: string): string {
  return Buffer.from(`${campaignId}:${email}`).toString("base64url");
}

export function parseTrackingToken(token: string): { campaignId: string; email: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const colonIdx = decoded.indexOf(":");
    if (colonIdx === -1) return null;
    return {
      campaignId: decoded.slice(0, colonIdx),
      email: decoded.slice(colonIdx + 1),
    };
  } catch {
    return null;
  }
}

export function openPixelUrl(campaignId: string, email: string): string {
  return `${BASE}/api/email/open/${makeTrackingToken(campaignId, email)}`;
}

export function trackedClickUrl(campaignId: string, email: string, destination: string): string {
  const token = makeTrackingToken(campaignId, email);
  return `${BASE}/api/email/click/${token}?url=${encodeURIComponent(destination)}`;
}

export function unsubscribeUrl(email: string): string {
  return `${BASE}/api/email/unsubscribe?e=${Buffer.from(email).toString("base64url")}`;
}
