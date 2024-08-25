"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Web3AuthMPCCoreKit,
  COREKIT_STATUS,
  WEB3AUTH_NETWORK,
  JWTLoginParams,
  parseToken,
} from "@web3auth/mpc-core-kit";
import { CHAIN_NAMESPACES, IProvider } from "@web3auth/base";
import { EthereumSigningProvider } from "@web3auth/ethereum-mpc-provider";
import { tssLib } from "@toruslabs/tss-dkls-lib";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import EthereumRpc from "@/lib/viemRPC";
import { makeEthereumSigner } from "@web3auth/mpc-core-kit";

interface Web3AuthContextType {
  coreKitInstance: Web3AuthMPCCoreKit | null;
  rpc: EthereumRpc | null;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<any>;
  getAccounts: () => Promise<string[]>;
  getBalance: () => Promise<string>;
}

const Web3AuthContext = createContext<Web3AuthContextType | null>(null);

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error("useWeb3Auth must be used within a Web3AuthProvider");
  }
  return context;
};

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const web3AuthClientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string;
const verifier = "w3a-firebase-google";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Sepolia testnet
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorer: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

let coreKitInstance: Web3AuthMPCCoreKit;
let evmProvider: EthereumSigningProvider;

export const Web3AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rpc, setRpc] = useState<EthereumRpc | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("Initializing Web3Auth...");
        coreKitInstance = new Web3AuthMPCCoreKit({
          web3AuthClientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.DEVNET,
          storage: localStorage,
          manualSync: true,
          tssLib: tssLib,
        });

        await coreKitInstance.init();

        // Setup provider for EVM Chain
        evmProvider = new EthereumSigningProvider({ config: { chainConfig } });
        evmProvider.setupProvider(makeEthereumSigner(coreKitInstance));
        const rpcInstance = new EthereumRpc(evmProvider as IProvider);
        setRpc(rpcInstance);

        console.log("Web3Auth initialized");
        setIsLoggedIn(coreKitInstance.status === COREKIT_STATUS.LOGGED_IN);
      } catch (error) {
        console.error("Failed to initialize Web3Auth:", error);
      }
    };

    init();
  }, []);

  const signInWithGoogle = async (): Promise<UserCredential> => {
    const googleProvider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, googleProvider);
      return res;
    } catch (err) {
      console.error("Firebase Google Sign-In error:", err);
      throw err;
    }
  };

  const login = async () => {
    if (!coreKitInstance) return;

    try {
      const userCredential = await signInWithGoogle();
      const idToken = await userCredential.user.getIdToken(true);

      // Debugging outputs
      console.log("ID Token:", idToken);

      const parsedToken = parseToken(idToken);
      console.log("Parsed Token:", parsedToken);

      const idTokenLoginParams: JWTLoginParams = {
        verifier,
        verifierId: parsedToken.email, // Ensure this is correct
        idToken,
      };

      console.log("idTokenLoginParams:", idTokenLoginParams);

      await coreKitInstance.loginWithJWT(idTokenLoginParams);

      if (coreKitInstance.status === COREKIT_STATUS.LOGGED_IN) {
        await coreKitInstance.commitChanges();
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    if (!coreKitInstance) return;
    await coreKitInstance.logout();
    setIsLoggedIn(false);
  };

  const getUserInfo = async () => {
    if (!coreKitInstance) return null;
    return await coreKitInstance.getUserInfo();
  };

  const getAccounts = async (): Promise<string[]> => {
    if (!rpc) return [];
    return await rpc.getAccounts();
  };

  const getBalance = async (): Promise<string> => {
    if (!rpc) return "0";
    return await rpc.getBalance();
  };

  return (
    <Web3AuthContext.Provider
      value={{
        coreKitInstance,
        rpc,
        isLoggedIn,
        login,
        logout,
        getUserInfo,
        getAccounts,
        getBalance,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
};
