"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Web3AuthLoginDialog() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleEmailLogin = async () => {
    setIsLoading(true);
    try {
      // Simulating login process
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowMFA(true);
    } catch (error) {
      console.error("Error during email login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASubmit = async () => {
    setIsLoading(true);
    try {
      // Simulating MFA verification process
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Logged in successfully with email and MFA");
      setIsOpen(false);
    } catch (error) {
      console.error("Error during MFA verification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      // Simulating social login process
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Logged in successfully with ${provider}`);
      setIsOpen(false);
    } catch (error) {
      console.error(`Error during ${provider} login:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#D8B4FE] text-black ml-4">Connect Wallet</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" title="Web3Auth Login">
        <DialogHeader>
          <DialogDescription>
            Connect your wallet using Web3Auth. Choose between email login or
            social login.
          </DialogDescription>
        </DialogHeader>
        {!showMFA ? (
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>Email Login</CardTitle>
                  <CardDescription>
                    Login using your email and password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-white text-text dark:bg-secondaryBlack dark:text-darkText"
                    onClick={handleEmailLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Login with Email
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>Social Login</CardTitle>
                  <CardDescription>
                    Login using your social media accounts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full bg-white text-text dark:bg-secondaryBlack dark:text-darkText"
                    onClick={() => handleSocialLogin("google")}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Login with Google
                  </Button>
                  <Button
                    className="w-full bg-white text-text dark:bg-secondaryBlack dark:text-darkText"
                    onClick={() => handleSocialLogin("facebook")}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Login with Facebook
                  </Button>
                  <Button
                    className="w-full bg-white text-text dark:bg-secondaryBlack dark:text-darkText"
                    onClick={() => handleSocialLogin("twitter")}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Login with Twitter
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>MFA Verification</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to your email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="otp">MFA Code</Label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
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
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-white text-text dark:bg-secondaryBlack dark:text-darkText"
                onClick={handleMFASubmit}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Verify MFA
              </Button>
            </CardFooter>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
