// server/src/utils/sendMail.ts
import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, text: string) {
  try {
    // 1SMTP 연결 설정 (환경 변수 사용)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 실제 메일 내용 구성
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
    };

    // 메일 발송 시도
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
