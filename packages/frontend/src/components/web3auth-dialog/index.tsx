import React, { useState, useEffect, ReactEventHandler } from "react";
import { Button } from "@/components/ui/button";
import { Info, Loader2, ShoppingCart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { Avatar } from "react95";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import REGEXP_ONLY_DIGITS from "input-otp";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Button as Button95,
  GroupBox,
  Window,
  Frame,
  Counter,
  WindowContent,
} from "react95";
import { generateOtp, sendOtpToEmail, verifyOtp } from "@/lib/otp-utils";
import { MFARenderContent } from "./MFARenderContent";

interface UserInfo {
  email: string;
  name: string;
  picture: string;
}

type MfaStep = "initial" | "otpVerification" | "setupComplete";

export default function Web3AuthDialog() {
  const {
    isLoggedIn,
    login,
    logout,
    getUserInfo,
    rpc,
    enableMFA,
    verifyMFA,
    coreKitInstance,
  } = useWeb3Auth();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);
  const [mfaStep, setMfaStep] = useState<MfaStep>("initial");
  const [factorKey, setFactorKey] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string>("");
  const [mfaError, setMfaError] = useState<string>("");
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn]);

  const fetchUserData = async () => {
    try {
      const user = await getUserInfo();
      setUserInfo(user);

      if (rpc) {
        const accounts = await rpc.getAccounts();
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          const userBalance = await rpc.getBalance();
          setBalance(userBalance);
        } else {
          setAddress(null);
          setBalance("0");
        }
      }

      if (coreKitInstance) {
        const keyDetails = await coreKitInstance.getKeyDetails();
        setMfaEnabled(keyDetails.totalFactors > 1);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setUserInfo(null);
      setAddress(null);
      setBalance(null);
      setMfaStep("initial");
      setMfaEnabled(false);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (value: string) => {
    setOtpCode(value);
  };

  const handleSetupMFA = async () => {
    setIsLoading(true);
    try {
      const email = userInfo?.email ?? "";
      const otp = generateOtp(); // Generate a new OTP
      await sendOtpToEmail(email, userInfo?.name || "User", otp); // Send OTP via email
      setMfaStep("otpVerification"); // Move to the next step
    } catch (error) {
      console.error("Failed to initiate MFA setup:", error);
      setMfaError("Failed to initiate MFA setup. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    setIsLoading(true);
    try {
      const email = userInfo?.email ?? "";
      const generatedFactorKey = await enableMFA(email, otpCode);
      setFactorKey(generatedFactorKey as any);
      setMfaStep("setupComplete");
    } catch (error) {
      console.error("MFA setup failed:", error);
      setMfaError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMFAContent = () => {
    switch (mfaStep) {
      case "initial":
        return (
          <Button
            onClick={handleSetupMFA}
            disabled={mfaEnabled}
            className="w-full"
          >
            {mfaEnabled ? "MFA Enabled" : "Set up MFA"}
          </Button>
        );
      case "otpVerification":
        return (
          <div className="space-y-4">
            <Label htmlFor="otpCode">Enter OTP Code</Label>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS as any}
              onChange={handleOTPChange}
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
                onClick={() =>
                  factorKey && navigator.clipboard.writeText(factorKey)
                }
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

  const handleBuyAvatar = () => {
    console.log("Buying avatar...");
  };

  const handleCarouselSelect = (
    event: React.SyntheticEvent,
    index: number | null
  ) => {
    setCurrentSlide(index as number);
  };

  const handleSelectAvatar = () => {
    console.log(`Selected avatar ${currentSlide + 1} as game avatar`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#D8B4FE] text-black ml-4">
          {isLoggedIn ? "My Wallet" : "Connect Wallet"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Web3Auth MPC Login</DialogTitle>
          <DialogDescription>
            {isLoggedIn
              ? "Welcome! Manage your wallet and game assets here."
              : "Connect your wallet using Web3Auth MPC. Choose a social login method."}
          </DialogDescription>
        </DialogHeader>
        {!isLoggedIn ? (
          <Card>
            <CardHeader>
              <CardTitle>Social Login</CardTitle>
              <CardDescription>
                Login using your Google account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full bg-white text-text dark:bg-secondaryBlack dark:text-darkText"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Login with Google
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mt-4 mb-6">
                <div className="flex items-center space-x-4">
                  <Avatar
                    src={userInfo?.picture}
                    alt="Profile"
                    className="w-12 h-12"
                  />
                  <div>
                    <p className="font-bold">{userInfo?.name}</p>
                    <p className="text-sm">
                      Address:{" "}
                      {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                    </p>
                    <p className="text-sm">Balance: {balance} ETH</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mb-2 flex items-center cursor-help">
                          Multi-factor Authentication (MFA)
                          <Info size={16} className="ml-2" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          MFA is a two-factor authentication method to recover
                          your blockchain non-custodial account.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {renderMFAContent()}
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 space-y-6">
                  <GroupBox label="Buy Avatar">
                    <CardContent>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="mb-4 flex items-center cursor-help">
                              Purchase a new ERC6551 Avatar
                              <Info size={16} className="ml-2" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Each avatar is an ERC6551 item. Your game assets
                              are stored in this NFT. If you sell or transfer
                              this NFT, your entire inventory will be
                              transferred as well.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button95 onClick={handleBuyAvatar} className="w-full">
                        <ShoppingCart size={16} className="mr-2" />
                        Buy
                      </Button95>
                    </CardContent>
                  </GroupBox>
                  <GroupBox label="My Cats, Memes & Dog's Coins ($CMD)">
                    <CardContent>
                      <Frame variant="field" className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Counter value={142424} minLength={6} size="lg" />
                        </div>
                      </Frame>
                    </CardContent>
                  </GroupBox>
                </div>
                <div className="flex-1">
                  <GroupBox label="GAME AVATAR ERC6551">
                    <Window>
                      <WindowContent>
                        <Carousel onSelect={handleCarouselSelect as any}>
                          <CarouselContent>
                            {Array.from({ length: 5 }).map((_, index) => (
                              <CarouselItem key={index}>
                                <div className="p-1">
                                  <Card>
                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                      <span className="text-3xl font-base">
                                        {index + 1}
                                      </span>
                                    </CardContent>
                                  </Card>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                        <div className="mt-4">
                          <Button95
                            onClick={handleSelectAvatar}
                            className="w-full"
                          >
                            Select Avatar {currentSlide + 1}
                          </Button95>
                        </div>
                      </WindowContent>
                    </Window>
                  </GroupBox>
                </div>
              </div>
              <Separator className="my-4" />
              <Button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Logout
              </Button>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
