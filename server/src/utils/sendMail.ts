import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(to: string, subject: string, text: string) {
  try {
    await resend.emails.send({
      from: process.env.MAIL_FROM!,
      to,
      subject,
      text,
    });

    console.log("Email sent!");
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}
