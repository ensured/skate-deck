"use client";

import { Moon, Sun } from "lucide-react";
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
        <Skeleton className="sm:size-6 size-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-10 h-10 cursor-pointer hover:text-primary/85"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="sm:size-5 size-4.5" />
      ) : (
        <Sun className="sm:size-5 size-4.5" />
      )}
    </Button>
  );
}
