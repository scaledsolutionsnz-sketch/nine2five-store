export const dynamic = "force-dynamic";

import { ShippingSettingsClient } from "./shipping-settings-client";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937]">Settings</h1>
          <p className="text-[14px] text-[#64748B] mt-1">Shipping rates, store configuration, and integrations.</p>
        </div>
      </div>
      <ShippingSettingsClient />
    </div>
  );
}
