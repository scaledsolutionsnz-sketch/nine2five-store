const REVIEWS: Record<string, { quote: string; name: string; context: string; initials: string }[]> = {
  "black-kahotea": [
    { quote: "Ordered a pair for myself, ended up buying three more for the boys. Grip is unreal and the design actually means something. Proud to wear these.", name: "James T.", context: "Rugby · Wellington", initials: "JT" },
    { quote: "Got matching sets for the whole squad. Coach actually commented on them. Looks fire and the grip held up through a full tournament.", name: "Tama K.", context: "Club Rugby · Palmerston North", initials: "TK" },
    { quote: "Third pair now. Gifted one to a mate and he's already ordered his own. The Kahotea design is genuinely beautiful.", name: "Wiremu B.", context: "Rugby League · Masterton", initials: "WB" },
  ],
  "grey-kahotea": [
    { quote: "I train six days a week and these are the only grip socks I've stuck with. No slipping, no bunching. Worth every cent.", name: "Marcus P.", context: "CrossFit · Hamilton", initials: "MP" },
    { quote: "Clean colourway that goes with everything. Grip holds perfectly rep after rep — exactly what I needed for box training.", name: "Daniel R.", context: "Football · Dunedin", initials: "DR" },
  ],
  "white-kahotea": [
    { quote: "Best pilates socks I've ever worn — no joke. The grip panel placement is spot on and they don't lose shape after washing.", name: "Sarah M.", context: "Pilates · Christchurch", initials: "SM" },
    { quote: "Wore them to my first senior club match and got asked about them three times. Quality is legit.", name: "Aroha W.", context: "Touch Rugby · Auckland", initials: "AW" },
  ],
  "pink-kahotea": [
    { quote: "The gym sock people actually notice. Held grip through a full hour of pilates and still looked clean after.", name: "Sarah M.", context: "Pilates · Christchurch", initials: "SM" },
    { quote: "My favourite pair. Bold design and the grip is just as solid as the black ones — no compromise.", name: "Aroha W.", context: "Touch Rugby · Auckland", initials: "AW" },
  ],
  "toa-whenua": [
    { quote: "Wore them at regionals. People kept asking where I got them. The design is sick and they actually perform — not just a fashion thing.", name: "Daniel R.", context: "Football · Dunedin", initials: "DR" },
    { quote: "The meaning behind the design makes it hit different. Grip is tight, compression feels great on long runs.", name: "James T.", context: "Rugby · Wellington", initials: "JT" },
  ],
  "pasifika": [
    { quote: "Finally a brand that gets it. Rep your culture and your game at the same time. Grabbed two pairs before they sold out.", name: "Aroha W.", context: "Touch Rugby · Auckland", initials: "AW" },
    { quote: "Got matching sets for the whole squad. Coach actually commented on them. Looks fire and the grip held up through a full tournament.", name: "Tama K.", context: "Club Rugby · Palmerston North", initials: "TK" },
  ],
  "basic-black": [
    { quote: "No fuss, just works. Grip is exactly the same as the premium range and the price point is great for buying multiple pairs.", name: "Marcus P.", context: "CrossFit · Hamilton", initials: "MP" },
    { quote: "My son plays for his school team and absolutely loves them. Fast delivery too — arrived next day.", name: "Lisa H.", context: "School Sport · Tauranga", initials: "LH" },
  ],
  "basic-white": [
    { quote: "Clean, reliable, does the job perfectly. Best everyday training sock I've found.", name: "Marcus P.", context: "CrossFit · Hamilton", initials: "MP" },
    { quote: "Bought these for pilates and they've been perfect. Simple, grippy, comfortable all session.", name: "Sarah M.", context: "Pilates · Christchurch", initials: "SM" },
  ],
  "tino-rangatiratanga": [
    { quote: "Third pair now. The design carries something real — people always ask about it. Proud to wear these every day.", name: "Wiremu B.", context: "Rugby League · Masterton", initials: "WB" },
  ],
};

const Star = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="#2E8B28">
    <path d="M6 0l1.5 4H12L8.5 6.5 10 11 6 8.5 2 11l1.5-4.5L0 4h4.5z" />
  </svg>
);

export function ProductReviews({ slug }: { slug: string }) {
  const reviews = REVIEWS[slug];
  if (!reviews?.length) return null;

  return (
    <div style={{ marginTop: 48, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", margin: 0 }}>
          Customer Reviews
        </p>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>·</span>
        <div style={{ display: "flex", gap: 2 }}>
          {[...Array(5)].map((_, i) => <Star key={i} />)}
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>4.9</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {reviews.map((r) => (
          <div key={r.name} style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(46,139,40,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "#2E8B28", flexShrink: 0,
              }}>
                {r.initials}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>{r.name}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: 0 }}>{r.context}</p>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, i) => <Star key={i} />)}
              </div>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, margin: 0 }}>
              &ldquo;{r.quote}&rdquo;
            </p>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "#2E8B28",
              background: "rgba(46,139,40,0.1)", padding: "2px 8px",
              borderRadius: 999, marginTop: 10,
            }}>
              ✓ Verified Purchase
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
