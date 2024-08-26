import * as React from "react";

interface OtpEmailTemplateProps {
  firstName: string;
  otpCode: string;
}

export const OtpEmailTemplate: React.FC<Readonly<OtpEmailTemplateProps>> = ({
  firstName,
  otpCode,
}) => (
  <div>
    <h1>Hello, {firstName}!</h1>
    <p>
      Your One-Time Password (OTP) is: <strong>{otpCode}</strong>
    </p>
    <p>Please use this code to complete your authentication process.</p>
  </div>
);
