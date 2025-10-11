"use client";

import { useState, useEffect, useCallback } from "react";
import { TrickCard } from "@/types/tricks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Shield, Zap, ListChecks } from "lucide-react";
import { SkillCard, SkillCardType } from "@/types/game";
import { TrickCard as TrickCardType } from "@/types/tricks";

// Simple card component to display trick options
const TrickOptionCard = ({
  trick,
  isSelected,
  onClick,
}: {
  trick: TrickCardType;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <div
    className={`border rounded-lg p-3 cursor-pointer transition-all ${
      isSelected
        ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/30"
        : "hover:bg-muted/50"
    }`}
    onClick={onClick}
  >
    <h4 className="font-medium">{trick.name}</h4>
    <p className="text-sm text-muted-foreground">
      Difficulty: {trick.difficulty}
    </p>
    <p className="text-sm mt-2">{trick.description}</p>
  </div>
);

interface PowerUpsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  powerUps: SkillCard[];
  onUsePowerUp: (powerUp: SkillCard, selectedTrick?: TrickCardType) => void;
  peekNextCards: (count: number) => TrickCard[];
  selectedTrickProp?: TrickCardType;
}

export function PowerUpsDialog({
  open,
  onOpenChange,
  powerUps,
  onUsePowerUp,
  peekNextCards,
  selectedTrickProp,
}: PowerUpsDialogProps) {
  const [showTrickSelection, setShowTrickSelection] = useState(false);
  const [trickOptions, setTrickOptions] = useState<TrickCardType[]>([]);
  const [selectedTrick, setSelectedTrick] = useState<TrickCardType | null>(
    null
  );

  // Only update trick options when the dialog opens or when peekNextCards changes
  useEffect(() => {
    if (open && peekNextCards) {
      const nextTricks = peekNextCards(3);
      setTrickOptions(nextTricks);
      setSelectedTrick(nextTricks[0] || null);
    } else if (!open) {
      // Reset state when dialog closes
      setTrickOptions([]);
      setSelectedTrick(null);
      setShowTrickSelection(false);
    }
  }, [open, peekNextCards]);

  // Handle prop sync for selectedTrick
  useEffect(() => {
    if (selectedTrickProp && selectedTrickProp.id !== selectedTrick?.id) {
      setSelectedTrick(selectedTrickProp);
    }
  }, [selectedTrickProp, selectedTrick?.id]);

  const handleUsePowerUp = useCallback(
    (powerUp: SkillCard) => {
      if (powerUp.type === "choose_trick") {
        setShowTrickSelection(true);
      } else {
        onUsePowerUp(powerUp);
        onOpenChange(false);
      }
    },
    [onOpenChange, onUsePowerUp]
  );

  const handleTrickSelect = useCallback((trick: TrickCardType) => {
    setSelectedTrick(trick);
  }, []);

  const confirmTrickSelection = useCallback(() => {
    if (selectedTrick) {
      const chooseTrickPowerup = powerUps.find(
        (p) => p.type === "choose_trick"
      );
      if (chooseTrickPowerup) {
        onUsePowerUp(chooseTrickPowerup, selectedTrick);
        onOpenChange(false);
      }
    }
  }, [selectedTrick, powerUps, onUsePowerUp, onOpenChange]);

  const getPowerUpIcon = (type: SkillCardType) => {
    switch (type) {
      case "shield":
        return <Shield className="h-5 w-5 text-blue-600 dark:text-blue-300" />;
      case "choose_trick":
        return (
          <ListChecks className="h-5 w-5 text-purple-600 dark:text-purple-300" />
        );
      default:
        return <Zap className="h-5 w-5 text-purple-600 dark:text-purple-300" />;
    }
  };

  const getPowerUpBgColor = (type: SkillCardType) => {
    switch (type) {
      case "shield":
        return "bg-blue-100 dark:bg-blue-900";
      case "choose_trick":
        return "bg-purple-100 dark:bg-purple-900";
      default:
        return "bg-purple-100 dark:bg-purple-900";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Your Power-Ups</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {powerUps.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                You don&apos;t have any power-ups yet!
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
                        className={`p-2 ${getPowerUpBgColor(
                          powerUp.type
                        )} rounded-lg`}
                      >
                        {getPowerUpIcon(powerUp.type)}
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
                      variant={
                        powerUp.type === "shield" ? "default" : "outline"
                      }
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

      {/* Trick Selection Dialog */}
      <Dialog open={showTrickSelection} onOpenChange={setShowTrickSelection}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Your Next Trick</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {trickOptions.length > 0 ? (
              trickOptions.map((trick) => (
                <TrickOptionCard
                  key={trick.id}
                  trick={trick}
                  isSelected={selectedTrick?.id === trick.id}
                  onClick={() => handleTrickSelect(trick)}
                />
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground">
                No more tricks available in the deck.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTrickSelection(false);
                setSelectedTrick(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmTrickSelection} disabled={!selectedTrick}>
              Select Trick
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
