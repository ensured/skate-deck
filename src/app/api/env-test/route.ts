import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      ? "✅ Found"
      : "❌ Missing",
    clerkSecretKey: process.env.CLERK_SECRET_KEY ? "✅ Found" : "❌ Missing",
    nodeEnv: process.env.NODE_ENV,
  });
}
