"use client";

import { useState } from "react";
import { ArrowUpRight, MapPin, Mail } from "lucide-react";

const inputClass =
  "w-full h-12 px-4 rounded-xl bg-[#111] border border-white/[0.1] text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#4ade80]/50 transition-colors";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await fetch("https://api.staticforms.xyz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: "sf_768da8d33927e7f4f241d0a6",
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
        }),
      });
      setSubmitted(true);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="bg-black min-h-screen">

      {/* Header */}
      <div className="pt-32 pb-16 px-8 md:px-16 max-w-screen-xl mx-auto border-b border-white/[0.06]">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#4ade80] mb-3">
          Get In Touch
        </p>
        <h1 className="font-display font-black text-5xl md:text-7xl text-white leading-none">
          CONTACT US
        </h1>
      </div>

      {/* Main content */}
      <div className="px-8 md:px-16 max-w-screen-xl mx-auto py-20">
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-16 md:gap-24">

          {/* Left — info */}
          <div className="space-y-12">
            <div>
              <h2 className="font-display font-black text-2xl text-white mb-4">
                Let&apos;s Talk
              </h2>
              <p className="text-white/50 leading-relaxed">
                Whether you&apos;re after teamwear, custom orders, a stockist inquiry, or just want to say kia ora — we&apos;d love to hear from you.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#111] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-[#4ade80]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Location</p>
                  <p className="text-white text-sm">Masterton, New Zealand</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#111] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-[#4ade80]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Email</p>
                  <a
                    href="mailto:nine2five.co.nz@gmail.com"
                    className="text-white text-sm hover:text-[#4ade80] transition-colors"
                  >
                    nine2five.co.nz@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#111] border border-white/[0.08] flex items-center justify-center shrink-0 text-[#4ade80] font-bold text-xs">
                  IG
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Instagram</p>
                  <a
                    href="https://instagram.com/nine2five.nz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-sm hover:text-[#4ade80] transition-colors flex items-center gap-1"
                  >
                    @nine2five.nz <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Teamwear callout */}
            <div className="p-6 rounded-2xl bg-[#111] border border-white/[0.08]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#4ade80] mb-2">Teamwear &amp; Bulk Orders</p>
              <p className="text-white/50 text-sm leading-relaxed">
                Kitting out your whole squad? We do custom team orders. Reach out with your team size and we&apos;ll sort it out.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div>
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="h-16 w-16 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center mb-6">
                  <span className="text-[#4ade80] text-2xl">✓</span>
                </div>
                <h3 className="font-display font-black text-2xl text-white mb-3">Message Sent</h3>
                <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                  Ngā mihi! We&apos;ll get back to you as soon as we can.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block">
                      Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block">
                    Subject
                  </label>
                  <select name="subject" required className={`${inputClass} appearance-none`}>
                    <option value="" disabled>Select a topic</option>
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Teamwear / Bulk Order">Teamwear / Bulk Order</option>
                    <option value="Stockist Inquiry">Stockist Inquiry</option>
                    <option value="Order Support">Order Support</option>
                    <option value="Collaboration">Collaboration</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    placeholder="Tell us what you need..."
                    className={`${inputClass} h-auto py-3 resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4ade80] text-black font-bold text-sm uppercase tracking-widest py-4 rounded-full hover:bg-[#86efac] transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
