// server/src/utils/sendMail.ts
import { Resend } from "resend";

export async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  // ⬅️ Resend 인스턴스 생성 시점 이동 (중요)
  const resend = new Resend(process.env.RESEND_API_KEY!);

  try {
    const result = await resend.emails.send({
      from: process.env.MAIL_FROM!,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error("❌ Email send error:", result.error);
      return false;
    }

    console.log("📨 Email sent successfully:", { id: result.data?.id, to });
    return true;
  } catch (error) {
    console.error("❌ Email send exception:", error);
    return false;
  }
}
