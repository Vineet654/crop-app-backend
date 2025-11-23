import dotenv from "dotenv";
dotenv.config();

import Mailjet from "node-mailjet";

import {
  VERIFICATION_EMAIL_TEMPLATE,
  RESET_PASSWORD_REQUEST_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_SUCCESS_TEMPLATE,
} from "./email.templates";

const MJ_APIKEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC!;
const MJ_APIKEY_PRIVATE = process.env.MJ_APIKEY_PRIVATE!;
const MJ_SENDER = process.env.MJ_SENDER || "no-reply@yourapp.com";

// FIX: Use apiConnect instead of connect
const mailjetClient = Mailjet.apiConnect(
  MJ_APIKEY_PUBLIC,
  MJ_APIKEY_PRIVATE
);

async function sendMail(to: string, subject: string, html: string) {
  try {
    const response = await mailjetClient
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: MJ_SENDER,
              Name: "Crop Manager App",
            },
            To: [{ Email: to }],
            Subject: subject,
            HTMLPart: html,
          },
        ],
      });

    // Cast response.body to any to access the specific Mailjet structure
    const result = response.body as any;
    console.log("Mailjet send status:", result.Messages[0].Status);
    
  } catch (err: any) {
    console.error("Mailjet error:", err.message || err);
    // improved error logging for debugging
    if (err.statusCode) {
        console.error("Status Code:", err.statusCode);
    }
    if (err.response?.body) {
        console.error("API Response:", JSON.stringify(err.response.body, null, 2));
    }
  }
}

export const sendVerificationEmail = async (email: string, verificationToken: string) => {
  // Note: ensure your template uses exactly {verificationCode}
  const html = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken);
  await sendMail(email, "Verify your email", html);
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  // Note: ensure your template uses exactly {{user_name}}
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