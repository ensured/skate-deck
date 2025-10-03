'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

export function Header() {
    return (
        <header className="w-full border-b  shadow-lg">
            <div className="w-full px-6 h-16 flex items-center justify-between">
                <div className="flex-1">
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
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button
                                    variant="ghost"
                                    className="font-mono text-sm tracking-wide transition-colors"
                                >
                                    Sign In
                                </Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button
                                    className="font-mono text-sm tracking-wide shadow-sm transition-all"
                                >
                                    Sign Up
                                </Button>
                            </SignUpButton>
                        </SignedOut>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <SignedIn>
                                <div className="border-l h-6 mx-1"></div>
                                <div className="relative group">
                                    <UserButton
                                        appearance={{
                                            elements: {
                                                userButtonAvatarBox: 'w-9 h-9 border-2 ',
                                            },
                                        }}
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3  rounded-full"></div>
                                </div>
                            </SignedIn>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
