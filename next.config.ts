import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This ensures environment variables are available at build time
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  // Remove or comment out this line if you're not using standalone output
  // output: 'standalone',
};

export default nextConfig;
