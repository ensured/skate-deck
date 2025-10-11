"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Shield, Zap } from "lucide-react";
import { SkillCard } from "@/types/game";

interface PowerUpsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  powerUps: SkillCard[];
  onUsePowerUp: (powerUp: SkillCard) => void;
}

export function PowerUpsDialog({
  open,
  onOpenChange,
  powerUps,
  onUsePowerUp,
}: PowerUpsDialogProps) {
  const handleUsePowerUp = (powerUp: SkillCard) => {
    onUsePowerUp(powerUp);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your Power-Ups</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {powerUps.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              You don&#39;t have any power-ups yet!
            </p>
          ) : (
            <div className="grid gap-3">
              {powerUps.map((powerUp) => (
                <div
                  key={powerUp.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 ${
                        powerUp.type === "shield"
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "bg-purple-100 dark:bg-purple-900"
                      } rounded-lg`}
                    >
                      {powerUp.type === "shield" ? (
                        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      ) : (
                        <Zap className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{powerUp.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {powerUp.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleUsePowerUp(powerUp)}
                    className="ml-4 cursor-pointer"
                    variant={powerUp.type === "shield" ? "default" : "outline"}
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
