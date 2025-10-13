"use client";
import { Button } from "./ui/button";
import { SignInButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

const ClerkSignInButton = () => {
  const { theme } = useTheme();

  return (
    <Button asChild variant="outline" className="cursor-pointer">
      <SignInButton
        forceRedirectUrl={"/"}
        mode="modal"
        appearance={{ theme: theme === "dark" ? dark : undefined }}
      />
    </Button>
  );
};

export default ClerkSignInButton;
