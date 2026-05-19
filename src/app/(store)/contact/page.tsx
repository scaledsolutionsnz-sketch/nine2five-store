"use client";

import { useState } from "react";
import { ArrowUpRight, MapPin, Mail } from "lucide-react";
import Image from "next/image";

const inputClass =
  "w-full h-12 px-4 rounded-xl bg-[#192d1e] border border-white/[0.1] text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#3a7722]/50 transition-colors";

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
    <div className="bg-[#112016] min-h-screen">

      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-white/[0.06]" style={{ height: "42vh", minHeight: "320px" }}>
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80"
          alt="Athletic training"
          fill
          className="object-cover object-center"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/40" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 30% 100%, rgba(58,119,34,0.1) 0%, transparent 55%)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 pb-12 px-4 sm:px-8 md:px-16 lg:px-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#3a7722] mb-3">
            Get In Touch
          </p>
          <h1 className="font-display font-black text-white leading-none"
            style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
            CONTACT US
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 md:px-16 lg:px-20 pt-20 pb-20">
        <div className="grid md:grid-cols-[1fr_1.6fr] gap-16 md:gap-24">

          {/* Left — info */}
          <div className="space-y-10">
            <div>
              <h2 className="font-display font-black text-2xl md:text-3xl text-white mb-4 leading-tight">
                Let&apos;s Talk
              </h2>
              <p className="text-white/45 leading-relaxed text-sm md:text-base">
                Whether you&apos;re after teamwear, custom orders, a stockist inquiry, or just want to say kia ora — we&apos;d love to hear from you.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-[#192d1e] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-[#3a7722]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Location</p>
                  <p className="text-white text-sm font-medium">Masterton, New Zealand</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-[#192d1e] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-[#3a7722]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Email</p>
                  <a
                    href="mailto:nine2five.co.nz@gmail.com"
                    className="text-white text-sm font-medium hover:text-[#3a7722] transition-colors"
                  >
                    nine2five.co.nz@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-[#192d1e] border border-white/[0.08] flex items-center justify-center shrink-0 text-[#3a7722]">
                  <span className="text-[10px] font-black">IG</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Instagram</p>
                  <a
                    href="https://instagram.com/nine2five.nz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-sm font-medium hover:text-[#3a7722] transition-colors flex items-center gap-1"
                  >
                    @nine2five.nz <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Teamwear callout */}
            <div className="p-7 rounded-2xl bg-[#112016] border border-white/[0.08]"
              style={{ background: "linear-gradient(135deg, rgba(58,119,34,0.04) 0%, rgba(0,0,0,0) 60%)" }}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3a7722] mb-3">
                Teamwear &amp; Bulk Orders
              </p>
              <p className="text-white/45 text-sm leading-relaxed">
                Kitting out your whole squad? We do custom team orders. Reach out with your team size and we&apos;ll sort it out.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div>
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-24">
                <div className="h-20 w-20 rounded-full bg-[#3a7722]/10 border border-[#3a7722]/30 flex items-center justify-center mb-6">
                  <span className="text-[#3a7722] text-3xl font-black">✓</span>
                </div>
                <h3 className="font-display font-black text-3xl text-white mb-3">Message Sent</h3>
                <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                  Ngā mihi! We&apos;ll get back to you as soon as we can.
                </p>
              </div>
            ) : (
              <div className="p-8 md:p-10 rounded-2xl bg-[#112016] border border-white/[0.08]">
                <h3 className="font-display font-black text-xl text-white mb-8">Send a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 block">
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
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 block">
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
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 block">
                      Subject
                    </label>
                    <select name="subject" required className={`${inputClass} appearance-none cursor-pointer`}>
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
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 block">
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
                    className="w-full bg-[#3a7722] text-white font-bold text-sm uppercase tracking-widest py-4 rounded-full hover:bg-[#4d9e2e] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
