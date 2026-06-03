"use client";

import { useState } from "react";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}`;
}

// ── base components ───────────────────────────────────────────────────────────

function Slider({
  label, min, max, value, onChange, format,
}: {
  label: string; min: number; max: number; value: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#4ade80", minWidth: 56, textAlign: "right" }}>
          {format ? format(value) : value}
        </span>
      </div>
      <div style={{ position: "relative", height: 8, borderRadius: 99, background: "rgba(255,255,255,0.12)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#2E8B28,#4ade80)", width: `${pct}%`, transition: "width 0.05s" }} />
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer", height: "100%", margin: 0 }}
        />
        <div style={{
          position: "absolute", top: "50%", transform: "translateY(-50%)",
          left: `calc(${pct}% - 11px)`,
          width: 22, height: 22, borderRadius: "50%",
          background: "#fff", border: "3px solid #2E8B28",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          pointerEvents: "none", transition: "left 0.05s",
        }} />
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button" onClick={() => onChange(!value)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "14px 18px", borderRadius: 14, cursor: "pointer",
        background: value ? "rgba(46,139,40,0.2)" : "rgba(255,255,255,0.05)",
        border: `1.5px solid ${value ? "rgba(74,222,128,0.5)" : "rgba(255,255,255,0.12)"}`,
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500, color: value ? "#fff" : "rgba(255,255,255,0.75)" }}>{label}</span>
      <div style={{
        width: 44, height: 24, borderRadius: 99, position: "relative",
        background: value ? "#2E8B28" : "rgba(255,255,255,0.18)", transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%",
          background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          left: value ? 23 : 3, transition: "left 0.2s",
        }} />
      </div>
    </button>
  );
}

function MultiChoice({ options, selected, onChange, multi = true }: {
  options: { value: string; label: string; icon?: string }[];
  selected: string[]; onChange: (v: string[]) => void; multi?: boolean;
}) {
  function toggle(val: string) {
    if (multi) {
      onChange(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val]);
    } else {
      onChange(selected.includes(val) ? [] : [val]);
    }
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => {
        const active = selected.includes(opt.value);
        return (
          <button key={opt.value} type="button" onClick={() => toggle(opt.value)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px", borderRadius: 99, cursor: "pointer",
            fontSize: 13, fontWeight: 600,
            background: active ? "#2E8B28" : "rgba(255,255,255,0.06)",
            border: `1.5px solid ${active ? "#4ade80" : "rgba(255,255,255,0.15)"}`,
            color: active ? "#fff" : "rgba(255,255,255,0.7)",
            transition: "all 0.12s",
          }}>
            {opt.icon && <span style={{ fontSize: 15 }}>{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldInput({ label, placeholder, value, onChange, type = "text", hint }: {
  label: string; placeholder?: string; value: string;
  onChange: (v: string) => void; type?: string; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{label}</label>
      {hint && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: -2 }}>{hint}</p>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", height: 48, padding: "0 16px", borderRadius: 12, fontSize: 14,
          background: "rgba(255,255,255,0.07)",
          border: `1.5px solid ${focused ? "#4ade80" : "rgba(255,255,255,0.15)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(74,222,128,0.15)" : "none",
          color: "#fff", outline: "none", transition: "all 0.15s",
        }}
      />
    </div>
  );
}

function FieldTextarea({ label, placeholder, value, onChange, hint }: {
  label: string; placeholder?: string; value: string; onChange: (v: string) => void; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{label}</label>
      {hint && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: -2 }}>{hint}</p>}
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={4}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 14, lineHeight: 1.6,
          background: "rgba(255,255,255,0.07)",
          border: `1.5px solid ${focused ? "#4ade80" : "rgba(255,255,255,0.15)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(74,222,128,0.15)" : "none",
          color: "#fff", outline: "none", resize: "vertical", transition: "all 0.15s",
        }}
      />
    </div>
  );
}

function Section({ step, title, subtitle, children }: {
  step: number; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      borderRadius: 18, padding: "28px 28px", border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", gap: 22,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", background: "#2E8B28",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0, marginTop: 2,
        }}>{step}</div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.2, fontFamily: "var(--font-outfit)" }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4, lineHeight: 1.5 }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {children}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>{children}</p>
  );
}

// ── data ──────────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "facebook", label: "Facebook", icon: "👥" },
  { value: "twitter", label: "Twitter / X", icon: "𝕏" },
  { value: "snapchat", label: "Snapchat", icon: "👻" },
  { value: "pinterest", label: "Pinterest", icon: "📌" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
];

const CONTENT_TYPES = [
  { value: "fashion", label: "Fashion", icon: "👕" },
  { value: "streetwear", label: "Streetwear", icon: "🧢" },
  { value: "lifestyle", label: "Lifestyle", icon: "✨" },
  { value: "fitness", label: "Fitness", icon: "💪" },
  { value: "sport", label: "Sport", icon: "🏆" },
  { value: "travel", label: "Travel", icon: "✈️" },
  { value: "music", label: "Music", icon: "🎧" },
  { value: "gaming", label: "Gaming", icon: "🎮" },
  { value: "art", label: "Art / Creative", icon: "🎨" },
  { value: "food", label: "Food", icon: "🍜" },
  { value: "cars", label: "Cars / Motorsport", icon: "🚗" },
  { value: "business", label: "Business", icon: "📈" },
];

const AUDIENCE_AGES = [
  { value: "13-17", label: "13–17" },
  { value: "18-24", label: "18–24" },
  { value: "25-34", label: "25–34" },
  { value: "35+", label: "35+" },
];

const SPORTS = [
  { value: "rugby", label: "Rugby", icon: "🏉" },
  { value: "football", label: "Football / Soccer", icon: "⚽" },
  { value: "basketball", label: "Basketball", icon: "🏀" },
  { value: "cricket", label: "Cricket", icon: "🏏" },
  { value: "athletics", label: "Athletics", icon: "🏃" },
  { value: "swimming", label: "Swimming", icon: "🏊" },
  { value: "tennis", label: "Tennis", icon: "🎾" },
  { value: "boxing", label: "Boxing / MMA", icon: "🥊" },
  { value: "surfing", label: "Surfing", icon: "🏄" },
  { value: "skateboard", label: "Skateboarding", icon: "🛹" },
  { value: "cycling", label: "Cycling", icon: "🚴" },
  { value: "golf", label: "Golf", icon: "⛳" },
  { value: "esports", label: "Esports", icon: "🎮" },
  { value: "other", label: "Other", icon: "🏅" },
];

const ATHLETE_LEVELS = [
  { value: "recreational", label: "Recreational" },
  { value: "club", label: "Club / Local" },
  { value: "regional", label: "Regional" },
  { value: "national", label: "National" },
  { value: "professional", label: "Professional" },
  { value: "international", label: "International / Olympic" },
];

const POSTING_FREQ = [
  { value: "daily", label: "Daily" },
  { value: "3-5pw", label: "3–5× / week" },
  { value: "1-2pw", label: "1–2× / week" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Few times / month" },
];

const SKILLS = [
  { value: "photography", label: "Photography", icon: "📷" },
  { value: "videography", label: "Videography", icon: "🎬" },
  { value: "editing", label: "Video Editing", icon: "✂️" },
  { value: "design", label: "Graphic Design", icon: "🎨" },
  { value: "styling", label: "Styling", icon: "👗" },
  { value: "modelling", label: "Modelling", icon: "💅" },
];

// ── main ──────────────────────────────────────────────────────────────────────

type PlatformData = { handle: string; followers: number; avgViews: number };

export default function AmbassadorForm() {
  const [name, setName] = useState("");
  const [age, setAge] = useState(21);
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [platforms, setPlatforms] = useState<string[]>([]);
  const [platformData, setPlatformData] = useState<Record<string, PlatformData>>({});

  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [postingFreq, setPostingFreq] = useState<string[]>([]);
  const [bestPostLink, setBestPostLink] = useState("");

  const [audienceAges, setAudienceAges] = useState<string[]>([]);
  const [genderSplit, setGenderSplit] = useState(50);
  const [audienceLocation, setAudienceLocation] = useState("");

  const [isAthlete, setIsAthlete] = useState(false);
  const [sports, setSports] = useState<string[]>([]);
  const [athleteLevel, setAthleteLevel] = useState<string[]>([]);
  const [highestAchievement, setHighestAchievement] = useState("");
  const [currentTeam, setCurrentTeam] = useState("");

  const [postsPerMonth, setPostsPerMonth] = useState(4);
  const [canAttendEvents, setCanAttendEvents] = useState(false);
  const [canDoVideo, setCanDoVideo] = useState(false);
  const [hasCameraSetup, setHasCameraSetup] = useState(false);
  const [extraSkills, setExtraSkills] = useState<string[]>([]);

  const [story, setStory] = useState("");
  const [whyN2F, setWhyN2F] = useState("");
  const [wornBefore, setWornBefore] = useState(false);
  const [currentBrands, setCurrentBrands] = useState("");
  const [anythingElse, setAnythingElse] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const platformPayload = platforms.map(p => {
        const pd = platformData[p] ?? { handle: "", followers: 1000, avgViews: 200 };
        return { platform: p, handle: pd.handle, followers: pd.followers, avgViews: pd.avgViews };
      });
      const res = await fetch("/api/ambassador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, city, age, story,
          platforms: platformPayload,
          contentTypes, postingFreq: postingFreq[0] ?? "", bestPostLink,
          audienceAges, genderSplit, audienceLocation,
          isAthlete, sports, athleteLevel: athleteLevel[0] ?? "", currentTeam, highestAchievement,
          postsPerMonth, canAttendEvents, canDoVideo, hasCameraSetup, extraSkills,
          whyN2F, wornBefore, currentBrands, anythingElse,
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Submission failed");
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function setPD(platform: string, key: keyof PlatformData, value: string | number) {
    setPlatformData(prev => ({
      ...prev,
      [platform]: { ...(prev[platform] ?? { handle: "", followers: 5000, avgViews: 1000 }), [key]: value },
    }));
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        padding: "40px 20px", background: "var(--background)",
      }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🤙</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", fontFamily: "var(--font-outfit)", marginBottom: 12 }}>
          Application Received
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", maxWidth: 380, lineHeight: 1.6 }}>
          We&apos;ll review your application and be in touch within 5–7 days. Keep doing your thing.
        </p>
        <p style={{ marginTop: 32, fontSize: 22, fontWeight: 900, letterSpacing: "0.18em", color: "#2E8B28", fontFamily: "var(--font-outfit)" }}>
          NINE2FIVE
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--background)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "64px 20px 80px",
    }}>
      {/* ── Header ── */}
      <div style={{ textAlign: "center", maxWidth: 720, width: "100%", marginBottom: 48 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase",
          color: "#4ade80", marginBottom: 16,
        }}>Nine2Five</p>
        <h1 style={{
          fontSize: "clamp(36px, 7vw, 62px)", fontWeight: 900, lineHeight: 1.05,
          color: "#fff", fontFamily: "var(--font-outfit)", marginBottom: 20,
        }}>
          AMBASSADOR<br />APPLICATION
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 480, margin: "0 auto" }}>
          We&apos;re looking for real people who live the culture. Fill this out and we&apos;ll be in touch.
        </p>
      </div>

      {/* ── Form card ── */}
      <div style={{ width: "100%", maxWidth: 980 }}>
        <form
          onSubmit={e => void handleSubmit(e)}
          style={{
            background: "rgba(8,32,20,0.82)",
            border: "1px solid rgba(70,190,70,0.22)",
            borderRadius: 24,
            padding: "clamp(22px, 5vw, 48px)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
            backdropFilter: "blur(14px)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >

          {/* 1 – About You */}
          <Section step={1} title="About You">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18 }}>
              <FieldInput label="Full Name *" placeholder="Your full name" value={name} onChange={setName} />
              <FieldInput label="Email *" placeholder="you@example.com" value={email} onChange={setEmail} type="email" />
              <FieldInput label="Phone" placeholder="+64 21 000 000" value={phone} onChange={setPhone} type="tel" />
              <FieldInput label="City / Region *" placeholder="Auckland, NZ" value={city} onChange={setCity} />
            </div>
            <Slider label="Your Age" min={14} max={45} value={age} onChange={setAge} />
            <FieldInput
              label="What's your story? *"
              placeholder="e.g. I'm a student-athlete, I work 9–5 in hospitality, I'm a full-time creator..."
              value={story}
              onChange={setStory}
              hint="One sentence — just a vibe check so we know who you are."
            />
          </Section>

          {/* 2 – Platforms */}
          <Section step={2} title="Your Platforms" subtitle="Select every platform you actively post on — we'll ask for your stats for each one.">
            <MultiChoice options={PLATFORMS} selected={platforms} onChange={setPlatforms} />

            {platforms.map(p => {
              const pd = platformData[p] ?? { handle: "", followers: 1000, avgViews: 200 };
              const pl = PLATFORMS.find(x => x.value === p)!;
              return (
                <div key={p} style={{
                  borderRadius: 14, padding: "20px 22px", border: "1px solid rgba(74,222,128,0.2)",
                  background: "rgba(46,139,40,0.08)", display: "flex", flexDirection: "column", gap: 16,
                }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{pl.icon}</span>{pl.label}
                  </p>
                  <FieldInput
                    label="Username / Handle"
                    placeholder="@yourhandle"
                    value={pd.handle}
                    onChange={v => setPD(p, "handle", v)}
                  />
                  <Slider
                    label="Followers"
                    min={100} max={100_000} value={pd.followers}
                    onChange={v => setPD(p, "followers", v)}
                    format={v => v >= 100_000 ? "100K+" : formatFollowers(v)}
                  />
                  <Slider
                    label="Average Views / Likes per Post"
                    min={10} max={50_000} value={pd.avgViews}
                    onChange={v => setPD(p, "avgViews", v)}
                    format={v => v >= 50_000 ? "50K+" : formatFollowers(v)}
                  />
                </div>
              );
            })}
          </Section>

          {/* 3 – Content */}
          <Section step={3} title="Your Content" subtitle="What kind of content do you make? Pick everything that applies.">
            <MultiChoice options={CONTENT_TYPES} selected={contentTypes} onChange={setContentTypes} />

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <FieldLabel>How often do you post?</FieldLabel>
              <MultiChoice options={POSTING_FREQ} selected={postingFreq} onChange={setPostingFreq} multi={false} />
            </div>

            <FieldInput
              label="Link to your best or most recent post"
              placeholder="https://instagram.com/p/..."
              value={bestPostLink}
              onChange={setBestPostLink}
            />
          </Section>

          {/* 4 – Audience */}
          <Section step={4} title="Your Audience" subtitle="Give us a picture of the people who follow and engage with you.">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <FieldLabel>Audience Age Range (select all that apply)</FieldLabel>
              <MultiChoice options={AUDIENCE_AGES} selected={audienceAges} onChange={setAudienceAges} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Audience Gender Split</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#4ade80" }}>
                  {genderSplit}% Male · {100 - genderSplit}% Female
                </span>
              </div>
              <div style={{ position: "relative", height: 8, borderRadius: 99, background: "rgba(255,255,255,0.12)" }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#2E8B28,#4ade80)", width: `${genderSplit}%` }} />
                <input type="range" min={0} max={100} value={genderSplit} onChange={e => setGenderSplit(Number(e.target.value))}
                  style={{ position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer", height: "100%", margin: 0 }} />
                <div style={{
                  position: "absolute", top: "50%", transform: "translateY(-50%)",
                  left: `calc(${genderSplit}% - 11px)`,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "#fff", border: "3px solid #2E8B28",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)", pointerEvents: "none",
                }} />
              </div>
            </div>

            <FieldInput
              label="Top audience locations"
              placeholder="e.g. New Zealand, Australia, USA"
              value={audienceLocation}
              onChange={setAudienceLocation}
            />
          </Section>

          {/* 5 – Athlete */}
          <Section step={5} title="Are You an Athlete?" subtitle="We actively support athletes at every level — from local clubs to international competitors.">
            <Toggle label="Yes, I compete in sport" value={isAthlete} onChange={setIsAthlete} />

            {isAthlete && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <FieldLabel>Your Sport(s)</FieldLabel>
                  <MultiChoice options={SPORTS} selected={sports} onChange={setSports} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <FieldLabel>Competitive Level</FieldLabel>
                  <MultiChoice options={ATHLETE_LEVELS} selected={athleteLevel} onChange={setAthleteLevel} multi={false} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18 }}>
                  <FieldInput
                    label="Current Team / Club"
                    placeholder="e.g. Auckland Blues Academy"
                    value={currentTeam}
                    onChange={setCurrentTeam}
                  />
                </div>

                <FieldTextarea
                  label="Highest Achievement"
                  placeholder="e.g. NZ U20 rep, National champion 2024, played 1st XV at Nationals, competed at World Juniors..."
                  value={highestAchievement}
                  onChange={setHighestAchievement}
                  hint="Tell us your proudest sporting moment — no achievement is too big or small."
                />
              </>
            )}
          </Section>

          {/* 6 – Commitment */}
          <Section step={6} title="Commitment" subtitle="Be honest — we'd rather know what's realistic for you.">
            <Slider
              label="Posts per month featuring Nine2Five"
              min={1} max={20} value={postsPerMonth}
              onChange={setPostsPerMonth}
              format={v => `${v} post${v !== 1 ? "s" : ""} / month`}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Toggle label="I can attend Nine2Five events and pop-ups" value={canAttendEvents} onChange={setCanAttendEvents} />
              <Toggle label="I'm comfortable making video content (Reels, TikToks)" value={canDoVideo} onChange={setCanDoVideo} />
              <Toggle label="I have a camera or professional setup" value={hasCameraSetup} onChange={setHasCameraSetup} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <FieldLabel>Special skills (select any that apply)</FieldLabel>
              <MultiChoice options={SKILLS} selected={extraSkills} onChange={setExtraSkills} />
            </div>
          </Section>

          {/* 7 – Brand Fit */}
          <Section step={7} title="Brand Fit" subtitle="This is where we get to know you beyond the numbers.">
            <FieldTextarea
              label="Why do you want to represent Nine2Five? *"
              placeholder="Tell us what Nine2Five means to you and how you'd bring it to life through your content..."
              value={whyN2F}
              onChange={setWhyN2F}
            />
            <Toggle label="I've worn or purchased Nine2Five before" value={wornBefore} onChange={setWornBefore} />
            <FieldInput
              label="Any current brand deals or sponsorships?"
              placeholder="e.g. Nike ambassador, local café sponsor — or leave blank if none"
              value={currentBrands}
              onChange={setCurrentBrands}
            />
            <FieldTextarea
              label="Anything else you want us to know?"
              placeholder="Open floor — tell us something that doesn't fit anywhere above."
              value={anythingElse}
              onChange={setAnythingElse}
            />
          </Section>

          {/* Submit */}
          {submitError && (
            <p style={{ textAlign: "center", fontSize: 13, color: "#f87171", padding: "8px 0" }}>
              {submitError} — please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%", padding: "18px 24px", borderRadius: 16,
              background: "linear-gradient(135deg,#2E8B28,#36A832)",
              color: "#fff", fontSize: 16, fontWeight: 900,
              letterSpacing: "0.12em", fontFamily: "var(--font-outfit)",
              border: "none", cursor: "pointer",
              boxShadow: "0 4px 24px rgba(46,139,40,0.4)",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(46,139,40,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(46,139,40,0.4)";
            }}
          >
            {submitting ? "SUBMITTING…" : "SUBMIT APPLICATION"}
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)", paddingBottom: 4 }}>
            We review all applications personally and respond within 5–7 days.
          </p>

        </form>
      </div>
    </div>
  );
}
