// src/components/Header.tsx
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import ClerkSignInButton from "../auth/ClerkSignInButton";
import ClerkUserButtonClient from "../auth/ClerkUserButtonClient";

export async function Header() {
  return (
    <header className="w-full border-b shadow-lg">
      <div className="w-full px-6 h-16 flex items-center justify-between gap-4 bg-accent/20 backdrop-blur-sm">
        <nav className="flex items-center space-x-2">
          <NavLinks />
        </nav>

        <div className="flex-1 flex justify-end">
          <nav className="flex items-center gap-4">
            <SignedIn>
              <ClerkUserButtonClient />
            </SignedIn>
            <SignedOut>
              <ClerkSignInButton />
            </SignedOut>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
