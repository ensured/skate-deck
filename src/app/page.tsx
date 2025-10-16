import { auth } from "@clerk/nextjs/server";
import { CreateUsername } from "../components/auth/CreateUsername";
import { getUserByClerkId } from "@/actions/actions";
import { GameBoard } from "@/components/game/GameBoard";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "../components/ui/button";
import Link from "next/link";

export default async function Home() {
  const { userId, isAuthenticated } = await auth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] px-4">
        <div className="max-w-md w-full">
          <div className="text-center flex flex-col items-center gap-6 p-8 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 shadow-2xl backdrop-blur-sm">
            <div className="p-4 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full">
              <svg
                className="w-12 h-12 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Welcome Back!
              </h1>
              <p className="text-muted-foreground text-sm">
                Sign in to start playing and track your progress
              </p>
            </div>

            <SignInButton mode="modal">
              <Button
                size="lg"
                className="cursor-pointer w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                Sign In to Play
              </Button>
            </SignInButton>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border"></div>
              <span>
                Secure authentication with{" "}
                <Link
                  href="https://clerk.dev"
                  target="_blank"
                  className=" text-primary p-0"
                >
                  <Button variant="link" className="text-primary p-">
                    Clerk
                  </Button>
                </Link>
              </span>
              <div className="h-px flex-1 bg-border"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  try {
    const user = await getUserByClerkId(userId);

    // If user doesn't exist or doesn't have a username, show the CreateUsername component
    if (!user || !user.username) {
      return <CreateUsername userId={userId} />;
    }

    return <GameBoard />;
  } catch (error) {
    console.error("Error loading user:", error);
    return <div>Error loading user information. Please try again later.</div>;
  }
}
