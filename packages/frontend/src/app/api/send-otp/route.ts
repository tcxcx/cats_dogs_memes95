// app/api/send-otp/route.ts (for App Router)
import { NextRequest, NextResponse } from "next/server";
import { OtpEmailTemplate } from "@/lib/emails/otp"; // Import the email template
import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, recipientEmail, otpCode } = body;

    if (!firstName || !recipientEmail || !otpCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailContent = OtpEmailTemplate({ firstName, otpCode });

    const { data, error } = await resend.emails.send({
      from: "Cats, Memes & Dogs, etc. <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: "Your One-Time Password (OTP)",
      react: emailContent,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
