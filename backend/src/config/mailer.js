import nodemailer from "nodemailer";

let cachedTransporter;

export const getMailer = async () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const hasSmtpConfig =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  cachedTransporter = hasSmtpConfig
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : nodemailer.createTransport({
        jsonTransport: true,
      });

  return cachedTransporter;
};

