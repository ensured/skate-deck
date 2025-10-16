"use client";

import { useState } from "react";
import { IoLogoGithub } from "react-icons/io5";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";

export function GitHubLinkDialog() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(true);

  const handleConfirm = (isChecked: boolean) => {
    window.open(
      "https://github.com/ensured/skate-deck",
      isChecked ? "_blank" : "_self"
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="select-none w-10 h-10 cursor-pointer hover:bg-accent transition-colors"
          aria-label="View source code on GitHub"
        >
          <IoLogoGithub className="!h-6.5 !w-6.5 text-primary hover:text-primary/80 transition-colors" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4 pt-3">
          <div className="text-center space-y-2">
            <DialogTitle className="text-sm text-muted-foreground">
              View project on
            </DialogTitle>
            <div className="flex items-center justify-center gap-1">
              <IoLogoGithub className="h-4 w-4 text-primary" />
              <span className="font-medium">GitHub</span>
            </div>
            <code className="text-xs bg-muted px-2 py-1 rounded text-primary inline-block">
              ensured/skate-deck
            </code>
          </div>

          <div
            className="flex items-center justify-center gap-2 py-2 cursor-pointer dark:bg-accent/35 bg-accent/60   border border-border/40 dark:border-border/80 hover:border-green-500 hover:bg-accent rounded-md"
            onClick={() => setChecked(!checked)}
          >
            <Checkbox
              id="new-tab"
              checked={checked}
              className="cursor-pointer"
            />
            <span className="text-sm font-medium">Open in new tab</span>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={() => handleConfirm(checked)} className="flex-1">
            Open
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
