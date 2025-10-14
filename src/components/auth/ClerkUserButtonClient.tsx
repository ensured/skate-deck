"use client";

import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

const ClerkUserButtonClient = () => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="h-7.5 w-7.5 rounded-full" />;
  }

  return (
    <UserButton
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
      }}
    />
  );
};

export default ClerkUserButtonClient;
