import Link from "next/link";

export const metadata = {
  title: "Returns & Refunds — Nine2Five",
  description: "Nine2Five returns and refund policy.",
};

export default function ReturnsPage() {
  return (
    <div className="bg-[#112016] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-24">
        <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest">
          ← Back to Nine2Five
        </Link>

        <h1 className="font-display font-black text-3xl text-white mt-8 mb-2">Returns & Refunds</h1>
        <p className="text-sm text-white/30 mb-12">Last updated: May 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed text-sm">

          <section>
            <h2 className="text-white font-bold text-base mb-3">7-day return window</h2>
            <p>
              You may return any item within <strong className="text-white">7 days</strong> of receiving your order,
              provided the item is unworn, unwashed, and in its original packaging with tags attached.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">How to return</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Email{" "}
                <a href="mailto:nine2five.co.nz@gmail.com" className="text-[#4ade80] hover:underline">nine2five.co.nz@gmail.com</a>{" "}
                with your order number and reason for return.
              </li>
              <li>We'll confirm the return and provide a return address within 1–2 business days.</li>
              <li>Pack the item securely and send it back at your own cost (unless the item is faulty).</li>
              <li>Once we receive and inspect the item, we'll process your refund or exchange within 3 business days.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">Refunds</h2>
            <p>
              Approved refunds are returned to your original payment method. Please allow up to{" "}
              <strong className="text-white">5 business days</strong> for the refund to appear, depending on your bank.
            </p>
            <p className="mt-2">
              Shipping costs are non-refundable unless the return is due to a fault on our part.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">Exchanges</h2>
            <p>
              We're happy to exchange for a different size or colour where stock is available.
              Email us before returning so we can hold the item for you.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">Faulty or incorrect items</h2>
            <p>
              If you receive a faulty or incorrect item, email us at{" "}
              <a href="mailto:nine2five.co.nz@gmail.com" className="text-[#4ade80] hover:underline">nine2five.co.nz@gmail.com</a>{" "}
              with a photo and your order number. We'll cover return shipping and send a replacement or
              issue a full refund — your choice.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">Non-returnable items</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Items returned after 7 days of delivery</li>
              <li>Items that have been worn, washed, or are not in original condition</li>
              <li>Items without original tags or packaging</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">Consumer Guarantees Act 1993</h2>
            <p>
              Nothing in this policy limits your rights under the{" "}
              <strong className="text-white">Consumer Guarantees Act 1993</strong>. If a product has a
              manufacturing defect or does not meet the guarantees set out in that Act, you are entitled to
              a repair, replacement, or refund regardless of our returns window.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">Contact</h2>
            <p>
              Questions about a return or refund? Email{" "}
              <a href="mailto:nine2five.co.nz@gmail.com" className="text-[#4ade80] hover:underline">nine2five.co.nz@gmail.com</a>{" "}
              and we'll get back to you within 1 business day.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.08]">
          <p className="text-xs text-white/20">
            Nine2Five Limited · Masterton, New Zealand ·{" "}
            <a href="mailto:nine2five.co.nz@gmail.com" className="hover:text-white/40 transition-colors">nine2five.co.nz@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
