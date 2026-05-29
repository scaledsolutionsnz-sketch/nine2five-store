"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, RefreshCw, Send, Clock, ImageIcon, CheckSquare, Square, Upload, X } from "lucide-react";
import { toast } from "sonner";

const BG = "#06150C";
const SURFACE = "#0e1f14";
const BORDER = "rgba(255,255,255,0.08)";
const ACCENT = "#2f9b2f";
const MUTED = "rgba(255,255,255,0.4)";
const DIM = "rgba(255,255,255,0.12)";

const PRESETS = [
  { label: "Product flat lay", prompt: "Nine2Five Maori-inspired grip socks product flat lay on a clean white surface, professional product photography, soft natural lighting, high detail" },
  { label: "Lifestyle yoga", prompt: "Person wearing Nine2Five Maori grip socks during a yoga or pilates class, warm lifestyle photography, wooden floor, natural light through window" },
  { label: "Detail shot", prompt: "Close-up detail of Nine2Five grip socks showing intricate Maori koru pattern stitching, macro photography, dark background, dramatic lighting" },
  { label: "Pair standing", prompt: "Two feet wearing Nine2Five Maori grip socks standing on a yoga mat, top-down view, clean minimal aesthetic, soft background" },
  { label: "Packaging hero", prompt: "Nine2Five grip socks with branded packaging, lifestyle product photo, earthy tones, styled on natural textures, premium brand feel" },
  { label: "Action shot", prompt: "Person mid-movement wearing Nine2Five grip socks doing pilates reformer exercise, energetic lifestyle photo, studio lighting" },
];

interface Channel {
  id: string;
  service: string;
  displayName: string;
  avatar: string;
}

const SERVICE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X (Twitter)",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

export default function SocialPage() {
  const [imageMode, setImageMode] = useState<"generate" | "upload">("generate");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [channelError, setChannelError] = useState<string | null>(null);

  const [caption, setCaption] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/social/channels")
      .then(async (r) => {
        let data: unknown;
        try { data = await r.json(); } catch { throw new Error("Invalid response from server"); }
        if (!r.ok) throw new Error((data as { error?: string })?.error ?? "Failed to load channels");
        if (Array.isArray(data) && data.length > 0) {
          setChannels(data as Channel[]);
          setSelectedChannels((data as Channel[]).map((c) => c.id));
        }
      })
      .catch((e: unknown) => setChannelError(e instanceof Error ? e.message : "Could not load Buffer channels"))
      .finally(() => setLoadingChannels(false));
  }, []);

  async function generate() {
    if (!prompt.trim()) { toast.error("Enter a prompt first"); return; }
    setGenerating(true);
    setImageUrl(null);
    setRevisedPrompt(null);
    try {
      const res = await fetch("/api/admin/social/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setImageUrl(data.url);
      setRevisedPrompt(data.revised_prompt);
      toast.success("Image generated");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function post() {
    if (!imageUrl) { toast.error("Generate an image first"); return; }
    if (!caption.trim()) { toast.error("Add a caption"); return; }
    if (!selectedChannels.length) { toast.error("Select at least one channel"); return; }
    if (scheduleMode === "later" && !scheduledAt) { toast.error("Pick a schedule time"); return; }

    setPosting(true);
    try {
      const res = await fetch("/api/admin/social/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_ids: selectedChannels,
          text: caption,
          image_url: imageUrl,
          scheduled_at: scheduleMode === "later" ? scheduledAt : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Post failed");
      toast.success(scheduleMode === "later" ? "Post scheduled in Buffer" : "Posted to Buffer");
      setCaption("");
      setImageUrl(null);
      setRevisedPrompt(null);
      setPrompt("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Post failed");
    } finally {
      setPosting(false);
    }
  }

  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    setUploading(true);
    setImageUrl(null);
    setRevisedPrompt(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/social/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImageUrl(data.url);
      toast.success("Image uploaded");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  function toggleChannel(id: string) {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  const captionLen = caption.length;
  const captionOver = captionLen > 2200;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#f8f8f2", padding: "32px 28px" }}>
      <style>{`
        @media (max-width: 900px) { .social-grid { grid-template-columns: 1fr !important; } }
        textarea:focus, input:focus { outline: none; border-color: ${ACCENT} !important; }
        .preset-btn:hover { border-color: rgba(47,155,47,0.4) !important; background: rgba(47,155,47,0.06) !important; }
        .channel-row:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1.1 }}>Social Content</h1>
        <p style={{ color: MUTED, marginTop: 6, fontSize: 14 }}>Generate images with DALL-E 3 and post to Buffer.</p>
      </div>

      <div className="social-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>

        {/* Left: Image source */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Mode tabs */}
          <div style={{ background: SURFACE, borderRadius: 16, padding: "6px", border: `1px solid ${BORDER}`, display: "flex", gap: 4 }}>
            {(["generate", "upload"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => { setImageMode(mode); setImageUrl(null); setRevisedPrompt(null); }}
                style={{ flex: 1, height: 38, borderRadius: 12, border: "none", background: imageMode === mode ? "rgba(47,155,47,0.15)" : "transparent", color: imageMode === mode ? "#4ade80" : MUTED, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all 0.15s" }}
              >
                {mode === "generate" ? <><Sparkles style={{ width: 14, height: 14 }} /> Generate</> : <><Upload style={{ width: 14, height: 14 }} /> Upload</>}
              </button>
            ))}
          </div>

          {imageMode === "generate" ? (
            <>
              {/* Presets */}
              <div style={{ background: SURFACE, borderRadius: 16, padding: "20px 22px", border: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: 14 }}>Quick presets</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      className="preset-btn"
                      onClick={() => setPrompt(p.prompt)}
                      style={{ padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: prompt === p.prompt ? "rgba(47,155,47,0.12)" : "transparent", border: `1px solid ${prompt === p.prompt ? "rgba(47,155,47,0.5)" : DIM}`, color: prompt === p.prompt ? "#4ade80" : "rgba(255,255,255,0.6)", cursor: "pointer", transition: "all 0.15s" }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt input */}
              <div style={{ background: SURFACE, borderRadius: 16, padding: "20px 22px", border: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: 12 }}>Prompt</p>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  rows={4}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 14, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box", transition: "border-color 0.2s" }}
                />
                <button
                  onClick={generate}
                  disabled={generating || !prompt.trim()}
                  style={{ marginTop: 12, width: "100%", height: 48, borderRadius: 999, border: "none", background: generating || !prompt.trim() ? "rgba(47,155,47,0.3)" : ACCENT, color: "#fff", fontSize: 13, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", cursor: generating || !prompt.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}
                >
                  {generating
                    ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Generating</>
                    : <><Sparkles style={{ width: 16, height: 16 }} /> Generate Image</>}
                </button>
              </div>
            </>
          ) : (
            /* Upload drop zone */
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ background: dragOver ? "rgba(47,155,47,0.08)" : SURFACE, borderRadius: 16, border: `2px dashed ${dragOver ? "rgba(47,155,47,0.6)" : "rgba(255,255,255,0.15)"}`, padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", transition: "all 0.2s", minHeight: 220 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={handleFilePick}
              />
              {uploading ? (
                <>
                  <Loader2 style={{ width: 32, height: 32, color: ACCENT }} className="animate-spin" />
                  <p style={{ fontSize: 13, color: MUTED }}>Uploading...</p>
                </>
              ) : (
                <>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(47,155,47,0.1)", border: `1px solid rgba(47,155,47,0.2)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Upload style={{ width: 22, height: 22, color: ACCENT }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Drop your image here</p>
                    <p style={{ fontSize: 12, color: MUTED }}>or click to browse — JPEG, PNG, WebP, GIF · Max 10 MB</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Image preview */}
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            {(generating || uploading) && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <Loader2 style={{ width: 32, height: 32, color: ACCENT }} className="animate-spin" />
                <p style={{ fontSize: 13, color: MUTED }}>{generating ? "Generating with DALL-E 3..." : "Uploading image..."}</p>
              </div>
            )}
            {!generating && !uploading && !imageUrl && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <ImageIcon style={{ width: 40, height: 40, color: DIM }} strokeWidth={1} />
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>Your image will appear here</p>
              </div>
            )}
            {imageUrl && !generating && !uploading && (
              <>
                <img src={imageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8 }}>
                  {imageMode === "generate" && (
                    <button
                      onClick={generate}
                      style={{ height: 36, padding: "0 14px", borderRadius: 999, background: "rgba(0,0,0,0.6)", border: `1px solid ${BORDER}`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, backdropFilter: "blur(8px)" }}
                    >
                      <RefreshCw style={{ width: 13, height: 13 }} /> Regenerate
                    </button>
                  )}
                  <button
                    onClick={() => { setImageUrl(null); setRevisedPrompt(null); }}
                    style={{ height: 36, width: 36, borderRadius: 999, background: "rgba(0,0,0,0.6)", border: `1px solid ${BORDER}`, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}
                  >
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </>
            )}
          </div>

          {revisedPrompt && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.5, padding: "0 4px" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>DALL-E revised:</span> {revisedPrompt}
            </p>
          )}
        </div>

        {/* Right: Post composer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Caption */}
          <div style={{ background: SURFACE, borderRadius: 16, padding: "20px 22px", border: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>Caption</p>
              <span style={{ fontSize: 11, color: captionOver ? "#f87171" : MUTED }}>{captionLen}/2200</span>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your caption..."
              rows={6}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${captionOver ? "rgba(248,113,113,0.5)" : BORDER}`, borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 14, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box", transition: "border-color 0.2s" }}
            />
          </div>

          {/* Channels */}
          <div style={{ background: SURFACE, borderRadius: 16, padding: "20px 22px", border: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: 14 }}>Channels</p>
            {loadingChannels && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED, fontSize: 13 }}>
                <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> Loading...
              </div>
            )}
            {!loadingChannels && channelError && (
              <p style={{ fontSize: 12, color: "#f87171", lineHeight: 1.5 }}>{channelError}</p>
            )}
            {!loadingChannels && !channelError && channels.length === 0 && (
              <p style={{ fontSize: 13, color: MUTED }}>No Buffer channels found.</p>
            )}
            {channels.map((ch) => {
              const selected = selectedChannels.includes(ch.id);
              return (
                <div
                  key={ch.id}
                  className="channel-row"
                  onClick={() => toggleChannel(ch.id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer", transition: "background 0.15s", marginBottom: 4 }}
                >
                  {selected
                    ? <CheckSquare style={{ width: 16, height: 16, color: ACCENT, flexShrink: 0 }} />
                    : <Square style={{ width: 16, height: 16, color: DIM, flexShrink: 0 }} />}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: selected ? "#fff" : "rgba(255,255,255,0.5)" }}>
                      {SERVICE_LABELS[ch.service] ?? ch.service}
                    </p>
                    <p style={{ fontSize: 11, color: MUTED }}>{ch.displayName}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Schedule */}
          <div style={{ background: SURFACE, borderRadius: 16, padding: "20px 22px", border: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: 14 }}>Timing</p>
            <div style={{ display: "flex", gap: 8, marginBottom: scheduleMode === "later" ? 14 : 0 }}>
              {(["now", "later"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setScheduleMode(mode)}
                  style={{ flex: 1, height: 38, borderRadius: 10, border: `1px solid ${scheduleMode === mode ? "rgba(47,155,47,0.5)" : DIM}`, background: scheduleMode === mode ? "rgba(47,155,47,0.1)" : "transparent", color: scheduleMode === mode ? "#4ade80" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}
                >
                  {mode === "now" ? <><Send style={{ width: 12, height: 12 }} /> Post now</> : <><Clock style={{ width: 12, height: 12 }} /> Schedule</>}
                </button>
              ))}
            </div>
            {scheduleMode === "later" && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                style={{ width: "100%", height: 42, background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "0 14px", color: "#fff", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", colorScheme: "dark", transition: "border-color 0.2s" }}
              />
            )}
          </div>

          {/* Post button */}
          <button
            onClick={post}
            disabled={posting || uploading || !imageUrl || !caption.trim() || !selectedChannels.length || captionOver}
            style={{ width: "100%", height: 52, borderRadius: 999, border: "none", background: posting || !imageUrl || !caption.trim() || !selectedChannels.length || captionOver ? "rgba(47,155,47,0.3)" : ACCENT, color: "#fff", fontSize: 14, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", cursor: posting || !imageUrl || !caption.trim() || !selectedChannels.length || captionOver ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}
          >
            {posting
              ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Posting...</>
              : scheduleMode === "later"
                ? <><Clock style={{ width: 16, height: 16 }} /> Schedule Post</>
                : <><Send style={{ width: 16, height: 16 }} /> Post to Buffer</>}
          </button>

          {!imageUrl && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>Generate an image first</p>
          )}
        </div>
      </div>
    </div>
  );
}
