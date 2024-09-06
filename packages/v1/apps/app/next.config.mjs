import "./src/env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@v1/supabase"],
  experimental: {
    instrumentationHook: process.env.NODE_ENV === "production",
  },
};
