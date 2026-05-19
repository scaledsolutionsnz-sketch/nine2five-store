import Link from "next/link";

export const metadata = {
  title: "Shipping — Nine2Five",
  description: "Shipping rates and delivery times for Nine2Five orders to New Zealand and Australia.",
};

const NZ_RATES = [
  { pairs: "1–2 pairs", price: "$6.68", service: "NZPost Courier Pack" },
  { pairs: "3 pairs",   price: "$7.71", service: "NZPost Courier Pack" },
  { pairs: "4–6 pairs", price: "$9.75", service: "NZPost Courier Pack" },
  { pairs: "7–12 pairs", price: "$10.30", service: "NZPost Courier Pack" },
];

const AU_RATES = [
  { pairs: "1–2 pairs",  price: "$15.00", service: "International Standard" },
  { pairs: "3–4 pairs",  price: "$16.00", service: "International Standard" },
  { pairs: "5–6 pairs",  price: "$20.00", service: "International Standard" },
  { pairs: "7–12 pairs", price: "$30.00", service: "International Standard" },
];

export default function ShippingPage() {
  return (
    <div className="bg-[#112016] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-24">
        <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest">
          ← Back to Nine2Five
        </Link>

        <h1 className="font-display font-black text-3xl text-white mt-8 mb-2">Shipping</h1>
        <p className="text-sm text-white/30 mb-12">All orders are dispatched from Masterton, New Zealand.</p>

        <div className="space-y-10 text-sm text-white/70">

          {/* NZ */}
          <section>
            <h2 className="text-white font-bold text-base mb-1">New Zealand</h2>
            <p className="text-white/40 mb-4">Estimated delivery: <strong className="text-white/60">2–4 business days</strong></p>
            <div className="border border-white/[0.08] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/30">Order size</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/30">Service</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/30">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {NZ_RATES.map((row, i) => (
                    <tr key={i} className={i < NZ_RATES.length - 1 ? "border-b border-white/[0.04]" : ""}>
                      <td className="px-4 py-3 text-white/70">{row.pairs}</td>
                      <td className="px-4 py-3 text-white/40">{row.service}</td>
                      <td className="px-4 py-3 text-right text-white font-semibold">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-white/40 text-xs">
              Free shipping on orders over $75 NZD.
            </p>
          </section>

          {/* Australia */}
          <section>
            <h2 className="text-white font-bold text-base mb-1">Australia</h2>
            <p className="text-white/40 mb-4">Estimated delivery: <strong className="text-white/60">5–10 business days</strong></p>
            <div className="border border-white/[0.08] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/30">Order size</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/30">Service</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/30">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {AU_RATES.map((row, i) => (
                    <tr key={i} className={i < AU_RATES.length - 1 ? "border-b border-white/[0.04]" : ""}>
                      <td className="px-4 py-3 text-white/70">{row.pairs}</td>
                      <td className="px-4 py-3 text-white/40">{row.service}</td>
                      <td className="px-4 py-3 text-right text-white font-semibold">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bulk */}
          <section>
            <h2 className="text-white font-bold text-base mb-2">Orders over 12 pairs</h2>
            <p className="text-white/50 leading-relaxed">
              For bulk orders of more than 12 pairs, please contact us directly for a shipping quote.
              Email{" "}
              <a href="mailto:nine2five.co.nz@gmail.com" className="text-[#4ade80] hover:underline">
                nine2five.co.nz@gmail.com
              </a>
              {" "}with your order details.
            </p>
          </section>

          {/* Tracking */}
          <section>
            <h2 className="text-white font-bold text-base mb-2">Tracking</h2>
            <p className="text-white/50 leading-relaxed">
              You'll receive a tracking number by email once your order has been dispatched.
              NZ orders are tracked via NZPost. Australian orders may transfer to Australia Post for final delivery.
            </p>
          </section>

          {/* Processing */}
          <section>
            <h2 className="text-white font-bold text-base mb-2">Processing time</h2>
            <p className="text-white/50 leading-relaxed">
              Orders are typically processed and dispatched within <strong className="text-white/70">1–2 business days</strong>.
              Orders placed on weekends or public holidays are processed the next business day.
            </p>
          </section>

          {/* Questions */}
          <section>
            <h2 className="text-white font-bold text-base mb-2">Questions?</h2>
            <p className="text-white/50 leading-relaxed">
              Email us at{" "}
              <a href="mailto:nine2five.co.nz@gmail.com" className="text-[#4ade80] hover:underline">
                nine2five.co.nz@gmail.com
              </a>
              {" "}and we'll get back to you within one business day.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.08]">
          <p className="text-xs text-white/20">
            Nine2Five Limited · Masterton, New Zealand
          </p>
        </div>
      </div>
    </div>
  );
}
