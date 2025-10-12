"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import useUser from "@/hooks/useUser";
import { Skeleton } from "./ui/skeleton";

export function Header() {
  const { isLoaded } = useUser();
  return (
    <header className="w-full border-b shadow-lg">
      <div className="w-full px-6 h-16 flex items-center justify-between gap-4 bg-accent/20 backdrop-blur-sm">
        <div className="flex-1 ">
          <Link href="/" className="group">
            <h1 className="text-2xl font-bold tracking-tight font-mono">
              <span className="inline-block transition-transform group-hover:scale-110">
                SKATE DECK
              </span>
            </h1>
          </Link>
        </div>

        <div className="flex-1 flex justify-end">
          <nav className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isLoaded ? (
                <SignedIn>
                  <div className="relative group">
                    <UserButton
                      appearance={{
                        elements: {
                          userButtonAvatarBox: "w-9 h-9 border-2",
                        },
                      }}
                    />
                  </div>
                </SignedIn>
              ) : (
                <Skeleton className="w-42 h-8 flex items-center justify-center " />
              )}
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    size={"sm"}
                    className="font-mono text-sm tracking-wide transition-colors"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    size={"sm"}
                    className="font-mono text-sm tracking-wide shadow-sm transition-all"
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
              </SignedOut>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
