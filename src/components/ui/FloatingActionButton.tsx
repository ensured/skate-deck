"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BackToTop } from "./BackToTop";

export function FloatingActionButton() {
  const pathname = usePathname();
  const showButton = pathname === "/tricks" || pathname === "/how-to-play";

  if (!showButton) return null;

  return (
    <div className="fixed flex flex-col items-end gap-4 bottom-6 right-6 z-50">
      <BackToTop />
      <div className="flex justify-end">
        <Button asChild size="lg" className="gap-2 rounded-full h-12 shadow-lg">
          <Link href="/">
            <Play className="h-5 w-5" />
            Start Playing
          </Link>
        </Button>
      </div>
    </div>
  );
}
