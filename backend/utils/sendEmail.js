import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    // ❌ กัน to พัง
    if (!to) {
      throw new Error("Recipient email is missing");
    }
    // 🔥 DEBUG ดูค่าจริง
    console.log("📨 Sending email to:", to);
    console.log("📧 SENDER:", process.env.SENDER_EMAIL);
    console.log("👤 SMTP USER:", process.env.SMTP_USER);
    console.log("🔐 SMTP PASS:", process.env.SMTP_PASS ? "✅ OK" : "❌ MISSING");

    // 🔥 CREATE TRANSPORT
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 2525,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Foodpanda" <${process.env.SENDER_EMAIL}>`,
      to, // 🔥 ต้องมีค่า
      subject,
      html,
    });

    console.log("📩 Email sent:", info.messageId);

    return true;
  } catch (error) {
    console.error("EMAIL ERROR 💥:", error);

    // 🔥 throw กลับไป controller
    throw new Error(error.message || "Email failed");
  }
};

export default sendEmail;