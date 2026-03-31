// Email service layer — Avery + Riley, Sprint 75
// Uses Resend for transactional email. Falls back to console.log in dev.
// Install: npm install resend

import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "HopTrack <hello@hoptrack.beer>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{ success: boolean; id?: string }> {
  const resend = getResend();

  if (!resend) {
    // Dev/stub mode — log what would be sent
    console.info(`[email] (dev mode) Would send email:`);
    console.info(`  To: ${to}`);
    console.info(`  Subject: ${subject}`);
    console.info(`  Body: ${text || html.substring(0, 200)}...`);
    return { success: true, id: "dev-mode" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[email] Send failed:", error);
      return { success: false };
    }

    console.info(`[email] Sent "${subject}" to ${to} (id: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[email] Send error:", err.message);
    return { success: false };
  }
}
