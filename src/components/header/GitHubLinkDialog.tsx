"use client";

import { useState } from "react";
import { IoLogoGithub } from "react-icons/io5";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export function GitHubLinkDialog() {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    window.open("https://github.com/ensured/skate-deck", "_blank");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 cursor-pointer"
        >
          <IoLogoGithub
            className="!h-6 !w-6 transition-all duration-250 shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.4),_0_0_20px_rgba(var(--primary),0.5)] hover:scale-110 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leaving Site</DialogTitle>
          <DialogDescription>
            You&apos;re about to visit the GitHub repository. This will open in
            a new tab.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
