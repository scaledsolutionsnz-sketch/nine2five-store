import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Suspense } from "react";
import { PurchaseEvent } from "@/components/analytics/purchase-event";

export default function OrderConfirmedPage() {
  return (
    <div className="bg-[#112016] min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <Suspense>
        <PurchaseEvent />
      </Suspense>
      <CheckCircle className="h-16 w-16 text-[#4ade80] mb-6" />
      <h1 className="font-display font-black text-4xl text-white mb-3">Order Confirmed!</h1>
      <p className="text-white/50 leading-relaxed mb-10 max-w-sm">
        Kia ora! Your Nine2Five grip socks are on their way. You&apos;ll receive an email confirmation shortly.
      </p>
      <Link
        href="/account/orders"
        className="bg-[#4ade80] text-black font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#86efac] transition-all duration-300 mb-4"
      >
        View My Orders
      </Link>
      <Link
        href="/shop"
        className="border border-white/20 text-white font-medium text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:border-white/50 hover:bg-white/5 transition-all"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
