import nodemailer from "nodemailer";
export default async function sendMail(to: string, subject: string, text: string) {
    try {
        const transporter = nodemailer.createTransport({
            host: "process.env.SMTP_HOST",
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE ==="true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    const mailOptions = {
        from: process.env.MAIL_USER,
        to,
        subject,
        text,
    };
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.response);
    return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}
