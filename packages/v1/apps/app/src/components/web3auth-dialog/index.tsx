import React, { useState, useEffect, ReactEventHandler } from "react";
import { Button } from "@v1/ui/button";
import { Info, Loader2, ShoppingCart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@v1/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@v1/ui/dialog";
import Link from "next/link";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { Avatar } from "react95";
import { Input } from "@v1/ui/input";
import { Label } from "@v1/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@v1/ui/alert";
import { Separator } from "@v1/ui/separator";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@v1/ui/input-otp";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@v1/ui/tooltip";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@v1/ui/carousel";
import {
  Button as Button95,
  GroupBox,
  Window,
  Frame,
  Counter,
  WindowContent,
} from "react95";
import { useUserStore } from "@/lib/context/web3auth/user";
import { generateOtp, sendOtpToEmail, verifyOtp } from "@/lib/otp-utils";
import { useHasPlayer } from "@/lib/hooks/useHasPlayer";
import { useCreatePlayer } from "@/lib/hooks/useCreatePlayer";

interface UserInfo {
  email: string;
  name: string;
  picture: string;
}

const avatarURIs = {
  1: "https://bafkreicschxbrjxonakuojkhafe55qux7humwwtqraxzrj2hzsarmtgngm.ipfs.web3approved.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaWQiOiJiYWZrcmVpY3NjaHhicmp4b25ha3VvamtoYWZlNTVxdXg3aHVtd3d0cXJheHpyajJoenNhcm10Z25nbSIsInByb2plY3RfdXVpZCI6Ijc2YTA4NzgxLTViMDctNGRhMy1iZDNhLTBiNDc2ZjRhY2YyMiIsImlhdCI6MTcyNTQ4NzU2Niwic3ViIjoiSVBGUy10b2tlbiJ9.PAMcuLRqg5vqfotYJ6mE_YmX6udo7rAi8cgYmPq164M",
  2: "https://bafkreienvbbsasyy3afsegjc4lz6p6lffzezvi7el2yvfhxvhsy3ewg7gm.ipfs.web3approved.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaWQiOiJiYWZrcmVpZW52YmJzYXN5eTNhZnNlZ2pjNGx6NnA2bGZmemV6dmk3ZWwyeXZmaHh2aHN5M2V3ZzdnbSIsInByb2plY3RfdXVpZCI6Ijc2YTA4NzgxLTViMDctNGRhMy1iZDNhLTBiNDc2ZjRhY2YyMiIsImlhdCI6MTcyNTQ4NzU2Niwic3ViIjoiSVBGUy10b2tlbiJ9.oXj49IfN-IRhQM26r7VB1YGfInKkn6W1__Th0D-Dq4w",
  3: "https://bafkreici3hwu7zsp74hndcwktfwkqgsjk4bvffg7a47mw27vl7t5fzqoim.ipfs.web3approved.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaWQiOiJiYWZrcmVpY2kzaHd1N3pzcDc0aG5kY3drdGZ3a3Fnc2prNGJ2ZmZnN2E0N213Mjd2bDd0NWZ6cW9pbSIsInByb2plY3RfdXVpZCI6Ijc2YTA4NzgxLTViMDctNGRhMy1iZDNhLTBiNDc2ZjRhY2YyMiIsImlhdCI6MTcyNTQ4NzU2Niwic3ViIjoiSVBGUy10b2tlbiJ9.5M7smcE2cdUVT2ieXB1UVSW5lrgXF2ElGtWE-oVBdXs",
  4: "https://bafkreibi2kkfcmecgiuzqdcz3xpyr2zga6dkwkw37wu2776drivgjr4d6e.ipfs.web3approved.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaWQiOiJiYWZrcmVpYmkya2tmY21lY2dpdXpxZGN6M3hweXIyemdhNmRrd2t3Mzd3dTI3NzZkcml2Z2pyNGQ2ZSIsInByb2plY3RfdXVpZCI6Ijc2YTA4NzgxLTViMDctNGRhMy1iZDNhLTBiNDc2ZjRhY2YyMiIsImlhdCI6MTcyNTQ4NzU2Niwic3ViIjoiSVBGUy10b2tlbiJ9.2TRMNNZxn2OJVHKd9CxropTzfaq04-jfLz3QBLpdC0k",
};

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

  const {
    addressContext,
    nameContext,
    setAddressContext,
    setNameContext,
    reset: resetUserStore,
  } = useUserStore();

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
  const { hasPlayer, avatarImage } = useHasPlayer();
  const { createPlayer, isCreating, error, avatarId, avatarAddress } =
    useCreatePlayer();

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn]);

  const fetchUserData = async () => {
    try {
      const user = await getUserInfo();
      setUserInfo(user);
      setNameContext(user?.name || null);

      if (rpc) {
        const accounts = await rpc.getAccounts();
        if (accounts.length > 0) {
          setAddress(accounts[0] || null);
          setAddressContext(accounts[0] || null);
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
      resetUserStore();
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
            className="w-full font-departure"
          >
            {mfaEnabled ? "MFA Enabled" : "Set up MFA"}
          </Button>
        );
      case "otpVerification":
        return (
          <div className="space-y-4">
            <Label htmlFor="otpCode" className="font-departure">
              Enter OTP Code
            </Label>
            <InputOTP maxLength={6} onChange={handleOTPChange}>
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
            <Button
              onClick={handleOTPVerification}
              className="w-full font-departure"
            >
              Verify OTP and Enable MFA
            </Button>
            {mfaError && (
              <p className="text-red-500 font-departure">{mfaError}</p>
            )}
          </div>
        );
      case "setupComplete":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertTitle className="font-departure">
                MFA Setup Complete
              </AlertTitle>
              <AlertDescription className="font-departure">
                Your MFA setup is complete. Please save the following factor key
                securely:
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="factorKey" className="font-departure">
                Factor Key
              </Label>
              <Input
                id="factorKey"
                value={factorKey || ""}
                readOnly
                className="cursor-pointer font-departure"
                onClick={() =>
                  factorKey && navigator.clipboard.writeText(factorKey)
                }
              />
              <p className="text-sm text-gray-500 font-departure">
                Click on the key to copy it to your clipboard.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleCarouselSelect = (
    event: React.SyntheticEvent,
    index: number | null
  ) => {
    setCurrentSlide(index as number);
  };

  const handleSelectAvatar = async () => {
    const selectedAvatarIndex = currentSlide + 1;
    const selectedAvatarURI =
      avatarURIs[selectedAvatarIndex as keyof typeof avatarURIs];
    console.log(
      `Selected avatar ${selectedAvatarIndex} with URI: ${selectedAvatarURI}`
    );
    await createPlayer(selectedAvatarURI);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#D8B4FE] text-black ml-4 font-departure">
          {isLoggedIn ? "My Wallet" : "Connect Wallet"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-departure">
            Web3Auth MPC Login
          </DialogTitle>
          <DialogDescription className="font-departure">
            {isLoggedIn
              ? "Welcome! Manage your wallet and game assets here."
              : "Connect your wallet using Web3Auth MPC. Choose a social login method."}
          </DialogDescription>
        </DialogHeader>
        {!isLoggedIn ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-departure">Social Login</CardTitle>
              <CardDescription className="font-departure">
                Login using your Google account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full bg-white text-text dark:bg-secondaryBlack dark:text-darkText font-departure"
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
                <div className="flex items-center space-x-4 font-departure">
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
                        <div className="mb-2 flex items-center cursor-help font-departure">
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
                <div className="flex-1">
                  <GroupBox label="Buy Avatar" className="font-departure">
                    <CardContent>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="mb-4 flex items-center cursor-help font-departure">
                              Purchase Card packs!
                              <Info size={16} className="ml-2" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-departure">
                              Each pack contains 5 unique cards. Every pack
                              includes a memecoin allocation you can redeem.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Link href={"/open-packs"}>
                        <Button95 className="w-full">
                          <ShoppingCart
                            size={16}
                            className="mr-2 font-departure"
                          />
                          Buy Card Packs
                        </Button95>
                      </Link>
                    </CardContent>
                  </GroupBox>
                  <GroupBox
                    className="font-departure"
                    label="My Cats, Memes & Dog's Coins ($CMD)"
                  >
                    <CardContent>
                      <Frame variant="field" className="p-2">
                        <div className="flex items-center justify-between mb-2">
                          <Counter value={142424} minLength={8} size="lg" />
                        </div>
                      </Frame>
                    </CardContent>
                  </GroupBox>
                  <GroupBox
                    label="My Tournament Position"
                    className="font-departure"
                  >
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span
                            role="img"
                            aria-label="trophy"
                            className="m-3 text-7xl"
                          >
                            🏆
                          </span>
                          <span className="font-departure text-xl">
                            Position:
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </GroupBox>
                </div>
                <div className="flex-1">
                  <GroupBox
                    label="GAME AVATAR ERC6551"
                    className="font-departure"
                  >
                    <Window>
                      <WindowContent>
                        {hasPlayer ? (
                          <div className="flex flex-col items-center">
                            <img
                              src={avatarImage}
                              alt="User Avatar"
                              className="w-full h-auto mb-4"
                            />
                            <span className="text-lg font-semibold">
                              Your Current Avatar
                            </span>
                          </div>
                        ) : (
                          <>
                            <Carousel onSelect={handleCarouselSelect as any}>
                              <CarouselContent>
                                {Object.entries(avatarURIs).map(([id, uri]) => (
                                  <CarouselItem key={id}>
                                    <div className="p-2">
                                      <Card>
                                        <CardContent className="flex aspect-square items-center justify-center p-2">
                                          <img
                                            src={uri}
                                            alt={`Avatar ${id}`}
                                            className="w-full h-auto"
                                          />
                                        </CardContent>
                                      </Card>
                                    </div>
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              <CarouselPrevious />
                              <CarouselNext />
                            </Carousel>
                            <div className="mt-4 flex justify-center">
                              <Button95
                                onClick={() => {
                                  handleSelectAvatar().catch((error) => {
                                    console.error(
                                      "Error selecting avatar:",
                                      error
                                    );
                                  });
                                }}
                                className="w-full max-w-xs"
                                disabled={isCreating}
                              >
                                {isCreating
                                  ? "Creating..."
                                  : `Select ${
                                      currentSlide === 0
                                        ? "Pablo"
                                        : currentSlide === 1
                                          ? "Papi Frog"
                                          : currentSlide === 2
                                            ? "Doggy Master"
                                            : "Kween"
                                    }`}
                              </Button95>
                            </div>
                          </>
                        )}
                      </WindowContent>
                    </Window>
                  </GroupBox>
                </div>
              </div>
              <Separator className="my-4" />
              <Button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full font-departure uppercase"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin font-departure" />
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
