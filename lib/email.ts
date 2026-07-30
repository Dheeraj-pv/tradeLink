// lib/email.ts
// Install: npm install nodemailer
// Install types: npm install -D @types/nodemailer

import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) {
    throw new Error("SMTP_HOST is not set");
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true only for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await getTransporter().sendMail({
    from: `"TradeLink" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to,
    subject: "Reset your TradeLink password",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f0ece4;border-radius:12px;">
        <h2 style="font-family:Georgia,serif;color:#1a2540;margin-bottom:8px;">Reset your password</h2>
        <p style="color:#7a7060;font-size:14px;margin-bottom:24px;">
          We received a request to reset the password for your TradeLink account.
          Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:14px 28px;background:#1a2540;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">
          Reset Password
        </a>
        <p style="color:#b0a898;font-size:12px;margin-top:24px;">
          If you didn't request this, you can safely ignore this email.<br/>
          This link will expire in 1 hour.
        </p>
        <hr style="border:none;border-top:1px solid #e2ddd8;margin:24px 0;"/>
        <p style="color:#b0a898;font-size:12px;margin:0;">© 2024 TradeLink</p>
      </div>
    `,
  });
}
