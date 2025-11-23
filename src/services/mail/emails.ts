// src/services/mail/emails.ts
import dotenv from "dotenv";
dotenv.config();

const mailjet = require('node-mailjet');

import {
  VERIFICATION_EMAIL_TEMPLATE,
  RESET_PASSWORD_REQUEST_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_SUCCESS_TEMPLATE,
} from "./email.templates";

const MJ_APIKEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC;
const MJ_APIKEY_PRIVATE = process.env.MJ_APIKEY_PRIVATE;
const MJ_SENDER = process.env.MJ_SENDER || process.env.GMAIL_USER || "no-reply@example.com";

if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
  console.warn("Mailjet API keys are not set. Emails will fail until configured.");
}

const client = (MJ_APIKEY_PUBLIC && MJ_APIKEY_PRIVATE)
  ? mailjet.connect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE)
  : null;

async function sendMail(to: string, subject: string, html: string) {
  if (!client) {
    console.error("Cannot send mail: Mailjet client not configured.");
    return;
  }

  const requestBody = {
    Messages: [
      {
        From: {
          Email: MJ_SENDER,
          Name: "Crop Manager",
        },
        To: [
          {
            Email: to,
          },
        ],
        Subject: subject,
        HTMLPart: html,
      },
    ],
  };

  try {
    const res = await client.post("send", { version: "v3.1" }).request(requestBody);
    // Mailjet returns response with Status and message id; log for debugging
    console.log("Mailjet send status:", res.body && res.body.Messages && res.body.Messages[0] && res.body.Messages[0].Status);
  } catch (err: any) {
    console.error("Mailjet error sending email:", err?.message || err);
    if (err?.response?.body) {
      console.error("Mailjet response body:", err.response.body);
    }
  }
}

export const sendVerificationEmail = async (email: string, verificationToken: string) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken);
  await sendMail(email, "Verify your email", html);
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const html = VERIFICATION_EMAIL_SUCCESS_TEMPLATE.replace("{{user_name}}", name);
  await sendMail(email, "Welcome to Crop Manager App!", html);
};

export const sendPasswordResetEmail = async (email: string, resetPasswordToken: string) => {
  const html = RESET_PASSWORD_REQUEST_EMAIL_TEMPLATE.replace("{resetPasswordToken}", resetPasswordToken);
  await sendMail(email, "Reset your password", html);
};

export const sendResetSuccessEmail = async (email: string) => {
  const html = PASSWORD_RESET_SUCCESS_TEMPLATE;
  await sendMail(email, "Password Reset Successful", html);
};
