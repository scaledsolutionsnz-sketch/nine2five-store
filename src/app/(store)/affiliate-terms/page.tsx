import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Affiliate Terms & Conditions — Nine2Five",
  description: "Nine2Five Ambassador Programme terms and conditions.",
};

const BG = "#06150C";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(255,255,255,0.45)";
const ACCENT = "#2f9b2f";

const EFFECTIVE_DATE = "2 June 2026";

export default function AffiliateTermsPage() {
  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", color: "#ffffff" }}>

      {/* Nav */}
      <header style={{ borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 50, background: "rgba(6,21,12,0.88)", backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" className="font-display font-black" style={{ fontSize: 20, letterSpacing: "-0.03em", color: "#ffffff", textDecoration: "none" }}>
            NINE<span style={{ color: ACCENT }}>2</span>FIVE
          </Link>
          <Link href="/join" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>
            ← Back to Apply
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "56px 32px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: ACCENT, marginBottom: 14 }}>
            Ambassador Programme
          </p>
          <h1 className="font-display font-bold" style={{ fontSize: 36, letterSpacing: "-0.02em", color: "#ffffff", marginBottom: 12 }}>
            Affiliate Terms & Conditions
          </h1>
          <p style={{ fontSize: 14, color: MUTED }}>
            Effective date: {EFFECTIVE_DATE} · Applies to all Nine2Five ambassadors
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>

          <Section title="1. Overview">
            <P>These terms govern your participation in the Nine2Five Ambassador Programme ("Programme"). By applying and ticking the acceptance checkbox, you agree to be bound by these terms. Nine2Five is operated by Scaled Solutions NZ, Christchurch, New Zealand.</P>
            <P>We may update these terms at any time. Continued participation after any change constitutes acceptance of the updated terms. Material changes will be communicated by email.</P>
          </Section>

          <Section title="2. Eligibility">
            <P>You must be 18 years or older to participate. You must have a genuine audience or promotional channel (social media, website, newsletter, etc.). We reserve the right to decline or revoke any application at our discretion, including if we determine your promotional methods are misleading, spam-based, or inconsistent with our brand.</P>
          </Section>

          <Section title="3. How It Works">
            <P>When approved, you receive a unique referral link (<code style={{ fontFamily: "monospace", color: ACCENT }}>nine2five.nz?ref=yourcode</code>). When a customer clicks your link and places an order within 30 days, the sale is attributed to you using last-click attribution.</P>
            <P>You earn a commission on each qualifying order. Your current commission rate is shown in your dashboard. Commission is calculated on the product subtotal minus any discount codes — shipping costs are excluded.</P>
          </Section>

          <Section title="4. Commission & Payouts">
            <P>Commission is paid monthly via NZ bank transfer, typically within the first 5 business days of the following month. You must add your bank account details in your dashboard settings to receive payment.</P>
            <P>There is no minimum payout threshold. Commissions are held as pending until paid out. Commission may be reversed if the corresponding order is refunded or a chargeback is successfully raised by the customer.</P>
            <P>You are responsible for declaring commission income to Inland Revenue (IRD) as business income. Nine2Five does not deduct PAYE — you are treated as an independent contractor, not an employee.</P>
          </Section>

          <Section title="5. Disclosure Requirements">
            <P><strong style={{ color: "#ffffff" }}>You must clearly disclose the commercial relationship</strong> whenever you promote Nine2Five products using your referral link. This is required under the New Zealand Fair Trading Act 1986 and standard advertising ethics.</P>
            <P>Acceptable disclosures include: #ad, #sponsored, #affiliate, "I earn a commission if you buy through this link", or equivalent plain-language disclosure. The disclosure must be prominent — not buried in hashtags or small print.</P>
            <P>Failure to disclose is grounds for immediate suspension and forfeiture of unpaid commissions.</P>
          </Section>

          <Section title="6. Prohibited Conduct">
            <P>You may not:</P>
            <ul style={{ margin: "8px 0 0 20px", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Purchase products through your own referral link (self-referral) — this is detected automatically and your account may be terminated",
                "Place orders on behalf of others using your own link",
                "Use cookie stuffing, forced clicks, or any automated traffic generation",
                "Bid on branded keywords (Nine2Five, nine2five.nz) in paid search advertising",
                "Make false or misleading claims about our products",
                "Offer unauthorised discounts, cashback, or incentives",
                "Spam email lists, DMs, or comment sections with your referral link",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="7. Suspension & Termination">
            <P>We may suspend or terminate your account immediately for breach of these terms, fraudulent activity, or conduct damaging to Nine2Five's reputation. Upon termination, earned commissions for validated orders remain payable; commissions for any orders suspected of fraud will be forfeited.</P>
            <P>You may close your account at any time by emailing <a href="mailto:info@nine2five.nz" style={{ color: MUTED }}>info@nine2five.nz</a>. Any pending commissions owed at that point will be paid in the next monthly cycle.</P>
          </Section>

          <Section title="8. Intellectual Property">
            <P>Nine2Five grants you a limited, non-exclusive licence to use our brand name, logo, and product images solely for the purpose of promoting the Programme. You may not alter our branding, use it in a way that implies endorsement of other products, or register domain names containing our brand.</P>
          </Section>

          <Section title="9. No Employment Relationship">
            <P>You are an independent contractor. Nothing in these terms creates an employment, partnership, agency, or franchise relationship. You have no authority to bind Nine2Five contractually.</P>
          </Section>

          <Section title="10. Privacy">
            <P>We collect your name, email address, and bank account details to operate the Programme. We do not sell or share this data with third parties except as required to process payouts. Your data is held in accordance with the New Zealand Privacy Act 2020.</P>
            <P>We track clicks and conversions via a first-party cookie (<code style={{ fontFamily: "monospace", color: ACCENT }}>n2f_ref</code>) placed on your referred visitors' browsers, expiring after 30 days. No personal customer data is shared with you.</P>
          </Section>

          <Section title="11. Limitation of Liability">
            <P>Nine2Five's liability to you under this Programme is limited to the amount of unpaid commission owed at the time of any claim. We are not liable for indirect, incidental, or consequential losses. The Programme is provided as-is and may be modified or discontinued at any time with reasonable notice.</P>
          </Section>

          <Section title="12. Governing Law">
            <P>These terms are governed by the laws of New Zealand. Any disputes shall be resolved in the courts of New Zealand.</P>
          </Section>

          <Section title="13. Contact">
            <P>Questions about the Programme or these terms: <a href="mailto:info@nine2five.nz" style={{ color: MUTED, textDecoration: "underline" }}>info@nine2five.nz</a></P>
          </Section>

        </div>

        <div style={{ marginTop: 48, padding: "20px 24px", borderRadius: 14, background: "rgba(47,155,47,0.06)", border: "1px solid rgba(47,155,47,0.15)" }}>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, margin: 0 }}>
            By ticking the acceptance checkbox on the application form, you confirm you have read and agree to these terms.{" "}
            <Link href="/join" style={{ color: "#ffffff", textDecoration: "underline" }}>Apply now →</Link>
          </p>
        </div>

      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", marginBottom: 12, letterSpacing: "-0.01em" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: 0 }}>
      {children}
    </p>
  );
}
