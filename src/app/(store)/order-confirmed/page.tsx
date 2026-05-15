import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Suspense } from "react";
import { PurchaseEvent } from "@/components/analytics/purchase-event";

export default function OrderConfirmedPage() {
  return (
    <div className="pt-32 pb-24 px-6 text-center max-w-md mx-auto">
      <Suspense>
        <PurchaseEvent />
      </Suspense>
      <CheckCircle className="h-16 w-16 text-[#16a34a] mx-auto mb-6" />
      <h1 className="font-display font-black text-3xl mb-3">Order Confirmed!</h1>
      <p className="text-[#737373] leading-relaxed mb-8">
        Kia ora! Your Nine2Five grip socks are on their way. You&apos;ll receive an email confirmation shortly.
      </p>
      <Link href="/shop" className="btn-primary">Shop More</Link>
    </div>
  );
}
