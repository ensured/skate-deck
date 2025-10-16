// src/components/Header.tsx
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import ClerkSignInButton from "../auth/ClerkSignInButton";
import ClerkUserButtonClient from "../auth/ClerkUserButtonClient";
import { Button } from "../ui/button";
import { GitHubLinkDialog } from "./GitHubLinkDialog";
export async function Header() {
  return (
    <header className="w-full border-b shadow-lg">
      <div className="w-full px-6 h-16 flex items-center justify-between gap-4 bg-accent/20 backdrop-blur-sm">
        <nav className="flex items-center space-x-2">
          <NavLinks />
        </nav>
        <div className="flex-1 flex justify-end">
          <nav className="flex items-center gap-2">
            <SignedIn>
              <Button variant="ghost" size="icon" className="w-10 h-10">
                <ClerkUserButtonClient />
              </Button>
            </SignedIn>
            <SignedOut>
              <ClerkSignInButton />
            </SignedOut>
            <GitHubLinkDialog />

            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
