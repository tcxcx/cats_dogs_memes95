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
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWeb3Auth } from "@/lib/context/web3auth";

export default function Web3AuthDialog() {
  const { isLoggedIn, login, logout, getUserInfo, rpc } = useWeb3Auth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
      const user = await getUserInfo();
      setUserInfo(user);
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
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccounts = async () => {
    if (!isLoggedIn || !rpc) {
      console.log("User is not logged in or RPC is not available");
      return;
    }
    try {
      const accounts = await rpc.getAccounts();
      setAddress(accounts[0]);
      console.log("User's address:", accounts[0]);
    } catch (error) {
      console.error("Failed to get accounts:", error);
    }
  };

  const getBalance = async () => {
    if (!isLoggedIn || !rpc) {
      console.log("User is not logged in or RPC is not available");
      return;
    }
    try {
      const balance = await rpc.getBalance();
      setBalance(balance);
      console.log("User's balance:", balance);
    } catch (error) {
      console.error("Failed to get balance:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#D8B4FE] text-black ml-4">
          {isLoggedIn ? "Disconnect" : "Connect Wallet"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Web3Auth MPC Login</DialogTitle>
          <DialogDescription>
            Connect your wallet using Web3Auth MPC. Choose a social login
            method.
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
            <CardHeader>
              <CardTitle>User Info</CardTitle>
            </CardHeader>
            <CardContent>
              <pre>{JSON.stringify(userInfo, null, 2)}</pre>
              {address && <p>Address: {address}</p>}
              {balance && <p>Balance: {balance} ETH</p>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button onClick={getAccounts} className="w-full">
                Get Accounts
              </Button>
              <Button onClick={getBalance} className="w-full">
                Get Balance
              </Button>
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
            </CardFooter>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
