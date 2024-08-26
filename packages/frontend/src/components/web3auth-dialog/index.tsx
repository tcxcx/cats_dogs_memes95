import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { Avatar, WindowContent } from "react95";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
import { Button as Button95, GroupBox, Window, Counter, Frame } from "react95";

export default function Web3AuthDialog() {
  const { isLoggedIn, login, logout, getUserInfo, rpc, setupMFA, verifyMFA } =
    useWeb3Auth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [mfaStep, setMfaStep] = useState<"initial" | "setup" | "verify">(
    "initial"
  );
  const [otpCode, setOtpCode] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchData = async () => {
        try {
          const user = await getUserInfo();
          setUserInfo(user);

          if (rpc) {
            const accounts = await rpc.getAccounts();
            setAddress(accounts[0]);

            const userBalance = await rpc.getBalance();
            setBalance(userBalance);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      };

      fetchData();
    }
  }, [isLoggedIn, getUserInfo, rpc]);

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
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupMFA = async () => {
    setIsLoading(true);
    try {
      await setupMFA();
      setMfaStep("setup");
    } catch (error) {
      console.error("MFA setup failed:", error);
      setMfaError("Failed to set up MFA. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    setIsLoading(true);
    try {
      await verifyMFA(otpCode);
      setMfaStep("initial");
      setMfaError("");
    } catch (error) {
      console.error("MFA verification failed:", error);
      setMfaError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyAvatar = async () => {
    console.log("Buying avatar...");
  };

  const handleCarouselSelect = useCallback((_, index: number) => {
    setCurrentSlide(index);
  }, []);

  const handleSelectAvatar = useCallback(() => {
    console.log(`Selected avatar ${currentSlide + 1} as game avatar`);
  }, [currentSlide]);

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
            {isLoggedIn && (
              <div className="flex items-center justify-between mt-4">
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
                          Set up Multi-factor Authentication (MFA)
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
                  <Button95
                    onClick={handleSetupMFA}
                    disabled={mfaStep !== "initial"}
                    fullWidth
                  >
                    Set up MFA
                  </Button95>
                </div>
              </div>
            )}
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
              <div className="flex space-x-4 pt-4">
                <div className="flex-1 space-y-12">
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
                      <Button95 onClick={handleBuyAvatar} fullWidth>
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
                        <Carousel onSelect={handleCarouselSelect}>
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
                          <Button95 onClick={handleSelectAvatar} fullWidth>
                            Select Avatar {currentSlide + 1}
                          </Button95>
                        </div>
                      </WindowContent>
                    </Window>
                  </GroupBox>
                </div>
              </div>
              <Separator className="my-4" />
              {mfaStep === "initial" && (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Logout
                  </Button>
                </div>
              )}
              {mfaStep === "setup" && (
                <div className="space-y-4">
                  <Alert>
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Setting up MFA gives you total custody of your account.
                      You can use this to recover access to your account.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter OTP"
                    />
                  </div>
                  <Button onClick={handleVerifyMFA} className="w-full">
                    Verify OTP
                  </Button>
                  {mfaError && <p className="text-red-500">{mfaError}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
