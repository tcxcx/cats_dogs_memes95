"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { Label } from "@v1/ui/label";
import { Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@v1/ui/drawer";
import { useWeb3Auth } from "@/lib/context/web3auth";
import { Alert, AlertDescription, AlertTitle } from "@v1/ui/alert";
import { Separator } from "@v1/ui/separator";
import { Textarea } from "@v1/ui/textarea";
import { useCreatePlayer } from "@/lib/hooks/useCreatePlayer";
import { useMintNFT } from "@/lib/hooks/useMintNFT";

export default function TransactionDrawer() {
  const { isLoggedIn, rpc } = useWeb3Auth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageToSign, setMessageToSign] = useState("");
  const [signedMessage, setSignedMessage] = useState<string | null>(null);

  // New states for useCreatePlayer
  const [avatarURI, setAvatarURI] = useState("");
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  // New states for useMintNFT
  const [tokenURI, setTokenURI] = useState("");

  const {
    createPlayer,
    isCreating,
    error: createPlayerError,
    avatarId,
    avatarAddress,
  } = useCreatePlayer();

  const { mintNFT, isMinting, mintError, mintReceipt } = useMintNFT();

  useEffect(() => {
    if (isLoggedIn) {
      fetchAccountData();
      setIsOpen(true);
    }
  }, [isLoggedIn]);

  const fetchAccountData = async () => {
    if (!rpc) return;
    try {
      const accounts = await rpc.getAccounts();
      if (accounts.length > 0) {
        setAddress(accounts[0] || null);
        const userBalance = await rpc.getBalance();
        setBalance(userBalance);
      }
    } catch (error) {
      console.error("Failed to fetch account data:", error);
      setError("Failed to fetch account data. Please try again.");
    }
  };

  const handleSignMessage = async () => {
    if (!rpc || !messageToSign) return;
    setIsLoading(true);
    setError(null);
    setCurrentAction("Signing message");
    try {
      const signature = await rpc.signMessage(messageToSign);
      console.log("Signed message:", signature);
      setSignedMessage(signature);
    } catch (error) {
      console.error("Error signing message:", error);
      setError("Failed to sign message. Please try again.");
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  const handleSendTransaction = async () => {
    if (!rpc) return;
    setIsLoading(true);
    setError(null);
    setCurrentAction("Sending transaction");
    try {
      const receipt = await rpc.sendTransaction();
      console.log("Transaction receipt:", receipt);
      setTransactionHash(receipt.transactionHash);
    } catch (error) {
      console.error("Error sending transaction:", error);
      setError("Failed to send transaction. Please try again.");
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  const handleCreatePlayer = async () => {
    if (avatarURI) {
      setCurrentAction("Creating player");
      console.log("Avatar URI inside handle create async function", avatarURI)
      await createPlayer(avatarURI);
      setCurrentAction(null);
    }
  };

  const handleMintNFT = async () => {
    if (recipient && tokenURI) {
      setCurrentAction("Minting NFT");
      await mintNFT(recipient, tokenURI);
      setCurrentAction(null);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Web3 Transaction Manager (Beta)</DrawerTitle>
          <DrawerDescription>
            Sign messages, send transactions, create players, or mint NFTs
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0">
          {isLoggedIn ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Your Address</Label>
                <Input id="address" value={address || ""} readOnly />
              </div>
              <div>
                <Label htmlFor="balance">Your Balance</Label>
                <Input id="balance" value={`${balance || "0"} ETH`} readOnly />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="messageToSign">Message to Sign</Label>
                <Textarea
                  id="messageToSign"
                  value={messageToSign}
                  onChange={(e) => setMessageToSign(e.target.value)}
                  placeholder="Enter a message to sign"
                />
                <Button
                  onClick={handleSignMessage}
                  disabled={isLoading || !messageToSign}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Sign Message
                </Button>
                {signedMessage && (
                  <Alert>
                    <AlertTitle>Message Signed</AlertTitle>
                    <AlertDescription className="break-all">
                      Signature: {signedMessage}
                    </AlertDescription>
                  </Alert>
                )}
                <Button
                  onClick={handleSendTransaction}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Send Transaction
                </Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="avatarURI">Avatar URI</Label>
                <Input
                  id="avatarURI"
                  value={avatarURI}
                  onChange={(e) => setAvatarURI(e.target.value)}
                  placeholder="Enter avatar URI"
                />
                <Button
                  onClick={handleCreatePlayer}
                  disabled={isCreating || !avatarURI}
                  className="w-full"
                >
                  {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create Player
                </Button>
                {createPlayerError && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{createPlayerError}</AlertDescription>
                  </Alert>
                )}
                {avatarId && avatarAddress && (
                  <Alert>
                    <AlertTitle>Player Created</AlertTitle>
                    <AlertDescription>
                      Avatar ID: {avatarId}, Address: {avatarAddress}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient address"
                />
                <Label htmlFor="tokenURI">Token URI</Label>
                <Input
                  id="tokenURI"
                  value={tokenURI}
                  onChange={(e) => setTokenURI(e.target.value)}
                  placeholder="Enter token URI"
                />
                <Button
                  onClick={handleMintNFT}
                  disabled={isMinting || !recipient || !tokenURI}
                  className="w-full"
                >
                  {isMinting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Mint NFT
                </Button>
                {mintError && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{mintError}</AlertDescription>
                  </Alert>
                )}
                {mintReceipt && (
                  <Alert>
                    <AlertTitle>NFT Minted</AlertTitle>
                    <AlertDescription>
                      Transaction Hash: {mintReceipt.transactionHash}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              {currentAction && (
                <Alert>
                  <AlertTitle>Current Action</AlertTitle>
                  <AlertDescription>{currentAction}</AlertDescription>
                </Alert>
              )}
              {transactionHash && (
                <Alert>
                  <AlertTitle>Transaction Successful</AlertTitle>
                  <AlertDescription>
                    Transaction Hash: {transactionHash}
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <Alert>
              <AlertTitle>Not Connected</AlertTitle>
              <AlertDescription>
                Please connect your wallet to use this feature.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="noShadow">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}