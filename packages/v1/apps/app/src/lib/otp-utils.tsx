import { Resend } from "resend";

// Interface to store OTP and its expiration time
interface OtpEntry {
  otp: string;
  expiresAt: Date;
}

// In-memory storage for OTPs (this is not suitable for production, consider using a database)
const otpStorage: Map<string, OtpEntry> = new Map();


/**
 * Generate a 6-digit OTP.
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send the OTP to the user's email.
 */
export async function sendOtpToEmail(email: string, name: string, otp: string) {
  const response = await fetch("/api/send-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: name,
      recipientEmail: email,
      otpCode: otp,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send OTP email");
  }

  // Store the OTP with an expiration time (e.g., 5 minutes)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP valid for 5 minutes

  otpStorage.set(email, { otp, expiresAt });
}

/**
 * Verify the OTP provided by the user.
 */
export function verifyOtp(email: string, inputOtp: string): boolean {
  const entry = otpStorage.get(email);

  if (!entry) {
    return false; // No OTP found for this email
  }

  const { otp, expiresAt } = entry;

  // Check if the OTP is correct and has not expired
  if (otp === inputOtp && new Date() <= expiresAt) {
    otpStorage.delete(email); // OTP can only be used once
    return true;
  }

  return false;
}
