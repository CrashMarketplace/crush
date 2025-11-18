// server/src/utils/sendMail.ts
import { Resend } from "resend";

export async function sendMail(to: string, subject: string, html: string) {
  // ⬅️ Resend 인스턴스 생성 시점 이동 (중요)
  const resend = new Resend(process.env.RESEND_API_KEY!);

  try {
    const data = await resend.emails.send({
      from: process.env.MAIL_FROM!,
      to,
      subject,
      html,
    });

    console.log("📨 Email sent:", data);
    return data;
  } catch (error) {
    console.error("❌ Email send error:", error);
  }
}
