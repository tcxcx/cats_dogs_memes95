"use client";

import React, { useEffect, useState } from "react";
import { useWeb3Auth } from "@/lib/context/web3auth";

export default function Home() {
  const { isLoggedIn, getUserInfo } = useWeb3Auth();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isLoggedIn) {
        try {
          const info = await getUserInfo();
          setUserInfo(info);
        } catch (error) {
          console.error("Failed to fetch user info:", error);
        }
      } else {
        setUserInfo(null);
      }
    };

    fetchUserInfo();
  }, [isLoggedIn, getUserInfo]);

  return (
    <div>
      <h1>Welcome to My App</h1>
      {isLoggedIn && userInfo ? (
        <p>Welcome, {userInfo.name || "User"}!</p>
      ) : (
        <p>Please login to access all features.</p>
      )}
    </div>
  );
}
