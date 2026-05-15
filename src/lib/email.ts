import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

export const FROM_EMAIL = "Nine2Five <orders@nine2five.co.nz>";
export const REPLY_TO = "hello@nine2five.co.nz";
