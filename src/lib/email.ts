import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

export const FROM_EMAIL = "Nine2Five <orders@nine2five.co.nz>";
export const REPLY_TO = "hello@nine2five.co.nz";
