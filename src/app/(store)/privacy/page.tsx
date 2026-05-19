import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Nine2Five",
  description: "How Nine2Five collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-[#112016] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-24">
        <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest">
          ← Back to Nine2Five
        </Link>

        <h1 className="font-display font-black text-3xl text-white mt-8 mb-2">Privacy Policy</h1>
        <p className="text-sm text-white/30 mb-12">Last updated: May 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-base mb-3">1. Who we are</h2>
            <p>
              Nine2Five Limited (<strong className="text-white">"Nine2Five", "we", "us"</strong>) operates nine2five.co.nz.
              We are registered in New Zealand and collect personal information in accordance with the{" "}
              <strong className="text-white">Privacy Act 2020</strong>.
            </p>
            <p className="mt-2">
              If you have any privacy questions, contact us at{" "}
              <a href="mailto:nine2five.co.nz@gmail.com" className="text-[#3a7722] hover:underline">nine2five.co.nz@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">2. What we collect</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Name, email address, and shipping address when you place an order</li>
              <li>Phone number (optional, for delivery queries)</li>
              <li>Payment details — processed securely by Stripe; we do not store card numbers</li>
              <li>Email address if you sign up for back-in-stock alerts or marketing emails</li>
              <li>Cart and browsing data to recover abandoned carts (with your consent)</li>
              <li>IP address and browser information for security and fraud prevention</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">3. How we use your information</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>To process and fulfil your order</li>
              <li>To send your order confirmation and tracking information</li>
              <li>To send marketing emails — only if you opt in at checkout or via your account settings</li>
              <li>To notify you when a product is back in stock (if you signed up for alerts)</li>
              <li>To improve our website and detect fraud</li>
              <li>To comply with our legal obligations as a GST-registered business</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">4. Marketing emails</h2>
            <p>
              We only send marketing emails to customers who have given explicit consent (opt-in checkbox at checkout,
              or via your account settings). Every marketing email includes an unsubscribe link. You can also
              unsubscribe at any time by emailing{" "}
              <a href="mailto:nine2five.co.nz@gmail.com" className="text-[#3a7722] hover:underline">nine2five.co.nz@gmail.com</a>.
            </p>
            <p className="mt-2">
              Order confirmation and transactional emails (receipts, shipping updates) are sent regardless of marketing
              preferences as they are necessary to fulfil your purchase.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">5. Who we share your information with</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong className="text-white">Stripe</strong> — payment processing (stripe.com/privacy)</li>
              <li><strong className="text-white">eShip / CourierPost</strong> — to arrange delivery of your order</li>
              <li><strong className="text-white">Resend</strong> — email delivery service</li>
              <li><strong className="text-white">Supabase</strong> — secure database hosting</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information to any third party.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">6. Data retention</h2>
            <p>
              We retain order records for 7 years as required by the Tax Administration Act 1994 and GST Act 1985.
              If you request deletion of your account, we will delete your personal data except where retention is
              required by law.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">7. Your rights</h2>
            <p>Under the Privacy Act 2020 you have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li>Request access to the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information (subject to legal retention obligations)</li>
              <li>Withdraw consent for marketing communications at any time</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, email{" "}
              <a href="mailto:nine2five.co.nz@gmail.com" className="text-[#3a7722] hover:underline">nine2five.co.nz@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">8. Cookies</h2>
            <p>
              We use essential cookies to maintain your cart session and remember affiliate referrals.
              We do not use third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">9. Security</h2>
            <p>
              All data is transmitted over HTTPS. Payment data is handled entirely by Stripe and never touches
              our servers. Customer data is stored in Supabase with row-level security enabled.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">10. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. The current version is always available at
              nine2five.co.nz/privacy. Continued use of the site after changes constitutes acceptance.
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
