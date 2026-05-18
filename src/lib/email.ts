import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

export const FROM_EMAIL = "Nine2Five <orders@mail.nine2five.nz>";
export const REPLY_TO = "nine2five.co.nz@gmail.com";
