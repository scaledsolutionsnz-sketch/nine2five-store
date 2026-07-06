// Matariki Sale announcement bar. Shown site-wide (top of every storefront page).
// To end the sale, remove <MatarikiBanner /> from the store layout (and revert prices).
export function MatarikiBanner() {
  return (
    <div style={{
      background: "linear-gradient(90deg, #0a2a12, #123d1c, #0a2a12)",
      borderBottom: "1px solid rgba(46,139,40,0.35)",
      padding: "10px 16px",
      textAlign: "center",
    }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#ffffff", letterSpacing: "0.01em" }}>
        <span style={{ color: "#4ade80" }}>✦ Matariki Sale</span>
        {" · "}All Grip Socks $20{" · "}
        <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>Celebrate the Māori New Year with us</span>
      </p>
    </div>
  );
}
