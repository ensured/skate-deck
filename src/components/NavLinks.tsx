// src/components/NavLinks.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
const navLinks = [
  { name: "SKATE DECK", path: "/" },
  { name: "Tricks", path: "/tricks" },
  { name: "How to Play", path: "/how-to-play" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {navLinks.map((link) => {
        const isActive = pathname === link.path;
        return (
          <Link
            key={link.path}
            href={link.path}
            className={`
              text-lg font-medium transition-all rounded-lg
              px-3 py-1.5 relative group  hover:bg-accent/20
              ${
                isActive
                  ? "text-foreground"
                  : "text-foreground/70 hover:text-foreground/90"
              }
            `}
          >
            {link.name}
            {isActive && (
              <span className="absolute inset-x-3 bottom-1 h-0.5 bg-foreground/30 group-hover:bg-foreground/30 transition-colors" />
            )}
          </Link>
        );
      })}
    </>
  );
}
