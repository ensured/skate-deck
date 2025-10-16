"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10"
        aria-label="Toggle theme"
      >
        <Skeleton className="!h-9 !w-9 " />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-10 h-10 cursor-pointer !text-primary hover:!text-primary/40"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <MoonIcon className="!h-5.5 !w-5.5 !text-primary !hover:text-primary/40" />
      ) : (
        <SunIcon className="!h-5.5 !w-5.5 !text-primary !hover:text-primary/40" />
      )}
    </Button>
  );
}
