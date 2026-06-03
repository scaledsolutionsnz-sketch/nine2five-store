export const dynamic = "force-dynamic";

import { ShippingSettingsClient } from "./shipping-settings-client";

export default function SettingsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#06150C", color: "#f8f8f2", padding: "32px 28px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>Settings</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 6, fontSize: 14 }}>
          Shipping rates, store configuration, and integrations.
        </p>
      </div>
      <ShippingSettingsClient />
    </div>
  );
}
