// src/components/web3auth-dialog/MFARenderContent.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface MFARenderContentProps {
  mfaStep: string;
  mfaEnabled: boolean;
  factorKey: string | null;
  otpCode: string;
  mfaError: string;
  handleSetupMFA: () => void;
  handleOTPChange: (value: string) => void;
  handleOTPVerification: () => void;
}

export const MFARenderContent: React.FC<MFARenderContentProps> = ({
  mfaStep,
  mfaEnabled,
  factorKey,
  otpCode,
  mfaError,
  handleSetupMFA,
  handleOTPChange,
  handleOTPVerification,
}) => {
  switch (mfaStep) {
    case "initial":
      return (
        <Button onClick={handleSetupMFA} disabled={mfaEnabled}>
          {mfaEnabled ? "MFA Enabled" : "Set up MFA"}
        </Button>
      );
    case "otpVerification":
      return (
        <div className="space-y-4">
          <Label htmlFor="otpCode">Enter OTP Code</Label>
          <InputOTP maxLength={6} onChange={handleOTPChange} value={otpCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button onClick={handleOTPVerification} className="w-full">
            Verify OTP and Enable MFA
          </Button>
          {mfaError && <p className="text-red-500">{mfaError}</p>}
        </div>
      );
    case "setupComplete":
      return (
        <div className="space-y-4">
          <Alert>
            <AlertTitle>MFA Setup Complete</AlertTitle>
            <AlertDescription>
              Your MFA setup is complete. Please save the following factor key
              securely:
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="factorKey">Factor Key</Label>
            <Input
              id="factorKey"
              value={factorKey || ""}
              readOnly
              className="cursor-pointer"
              onClick={() => navigator.clipboard.writeText(factorKey || "")}
            />
            <p className="text-sm text-gray-500">
              Click on the key to copy it to your clipboard.
            </p>
          </div>
        </div>
      );
    default:
      return null;
  }
};
