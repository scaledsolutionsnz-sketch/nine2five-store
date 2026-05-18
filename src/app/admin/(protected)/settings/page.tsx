export const dynamic = "force-dynamic";

import { ShippingSettingsClient } from "./shipping-settings-client";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-[20px] font-semibold text-[#1F2937]">Settings</h1>
      <ShippingSettingsClient />
    </div>
  );
}
