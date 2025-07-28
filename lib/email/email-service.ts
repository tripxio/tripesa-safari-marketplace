// Email service - Server-side only
// This file should only be imported in API routes, not in client components

import * as SibApiV3Sdk from "@getbrevo/brevo";

// Initialize Brevo only on server-side
const getBrevoApi = () => {
  // Check if we're on the server-side
  if (typeof window !== "undefined") {
    throw new Error("Email service is only available on the server-side");
  }

  // Server-side: initialize with API key
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY environment variable is required");
  }

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    apiKey
  );

  return apiInstance;
};

// Email validation function (can be used client-side)
export const validateEmail = (email: string): boolean => {
  // Comprehensive email regex pattern
  const emailPattern =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Basic checks
  if (!email || typeof email !== "string") {
    return false;
  }

  // Check length (RFC 5321 limits)
  if (email.length > 254) {
    return false;
  }

  // Check for @ symbol
  if (!email.includes("@")) {
    return false;
  }

  // Split email into local and domain parts
  const [localPart, domain] = email.split("@");

  // Validate local part
  if (!localPart || localPart.length > 64) {
    return false;
  }

  // Validate domain
  if (!domain || domain.length > 253) {
    return false;
  }

  // Check for valid domain structure
  if (!domain.includes(".")) {
    return false;
  }

  // Use regex to validate overall format
  return emailPattern.test(email);
};

// Email templates
const emailTemplates = {
  accountCreated: (
    name: string,
    email: string,
    password: string,
    loginUrl: string
  ) => ({
    subject: "Welcome to Tripesa Safari Admin - Your Account Has Been Created",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Tripesa Safari</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Admin Dashboard Access</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${name},</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Your admin account has been successfully created for Tripesa Safari. You now have access to the admin dashboard where you can manage the website's content, themes, and configurations.
          </p>
          
          <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Your Login Credentials</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code></p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0;">⚠️ Important Security Steps</h4>
            <ol style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Log in to your account using the credentials above</li>
              <li>Change your password immediately after first login</li>
              <li>Set up two-factor authentication (2FA) for enhanced security</li>
              <li>Never share your credentials with anyone</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Access Admin Dashboard
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              If you have any questions or need assistance, please contact the system administrator.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  passwordChanged: (
    name: string,
    email: string,
    loginUrl: string,
    _unused?: string
  ) => ({
    subject: "Tripesa Safari Admin - Password Changed Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Password Updated</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Tripesa Safari Admin</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${name},</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Your password has been successfully changed for your Tripesa Safari admin account.
          </p>
          
          <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #065f46; margin: 0 0 10px 0;">✅ Password Change Confirmed</h4>
            <p style="color: #065f46; margin: 0;">
              Your account password was updated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.
            </p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0;">🔒 Security Reminder</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>If you didn't make this change, contact an administrator immediately</li>
              <li>Use a strong, unique password for your account</li>
              <li>Enable two-factor authentication for additional security</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Access Admin Dashboard
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              If you have any questions or need assistance, please contact the system administrator.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  passwordReset: (
    name: string,
    email: string,
    resetUrl: string,
    _unused?: string
  ) => ({
    subject: "Tripesa Safari Admin - Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Tripesa Safari Admin</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${name},</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Tripesa Safari admin account. Click the button below to create a new password.
          </p>
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0;">🔐 Reset Your Password</h4>
            <p style="color: #1e40af; margin: 0;">
              This link will expire in 1 hour for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0;">⚠️ Security Notice</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>If you didn't request this password reset, ignore this email</li>
              <li>This link is valid for 1 hour only</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              If you have any questions or need assistance, please contact the system administrator.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `,
  }),
};

// Generate secure password
export const generateSecurePassword = (): string => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  // Ensure at least one character from each category
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Special character

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

// Send email using Brevo (server-side only)
export const sendEmail = async (
  to: string,
  template: "accountCreated" | "passwordChanged" | "passwordReset",
  data: {
    name: string;
    email: string;
    password?: string;
    loginUrl?: string;
    resetUrl?: string;
  }
): Promise<void> => {
  try {
    const apiInstance = getBrevoApi();

    const emailTemplate = emailTemplates[template];

    let emailData: any;

    switch (template) {
      case "accountCreated":
        emailData = emailTemplate(
          data.name,
          data.email,
          data.password!,
          data.loginUrl!
        );
        break;
      case "passwordChanged":
        emailData = emailTemplate(data.name, data.email, data.loginUrl!, "");
        break;
      case "passwordReset":
        emailData = emailTemplate(data.name, data.email, data.resetUrl!, "");
        break;
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = emailData.subject;
    sendSmtpEmail.htmlContent = emailData.html;
    sendSmtpEmail.sender = {
      name: "Tripesa Safari Admin",
      email: process.env.BREVO_FROM_EMAIL || "noreply@tripesa.co",
    };
    sendSmtpEmail.to = [{ email: to, name: data.name }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email notification");
  }
};

// Send account creation email (server-side only)
export const sendAccountCreationEmail = async (
  email: string,
  name: string,
  password: string
): Promise<void> => {
  const loginUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/admin/login`;

  await sendEmail(email, "accountCreated", {
    name,
    email,
    password,
    loginUrl,
  });
};

// Send password change email (server-side only)
export const sendPasswordChangeEmail = async (
  email: string,
  name: string
): Promise<void> => {
  const loginUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/admin/login`;

  await sendEmail(email, "passwordChanged", {
    name,
    email,
    loginUrl,
  });
};

// Send password reset email (server-side only)
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/admin/reset-password?token=${resetToken}`;

  await sendEmail(email, "passwordReset", {
    name,
    email,
    resetUrl,
  });
};
