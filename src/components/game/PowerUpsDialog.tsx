"use client";

import { useState, useEffect, useCallback } from "react";
import { TrickCard } from "@/types/tricks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Shield, Zap, ListChecks } from "lucide-react";
import { Powerup, PowerupType } from "@/types/powerups";
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
  powerUps: Powerup[];
  onUsePowerUp: (powerUp: Powerup, selectedTrick?: TrickCardType) => void;
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

  // Only update trick options when the dialog opens or peekNextCards changes
  useEffect(() => {
    if (!peekNextCards) return;

    if (open) {
      const nextTricks = peekNextCards(3);
      setTrickOptions(nextTricks);
      // Only update selectedTrick if it's not already set or if it's different from the first option
      setSelectedTrick((prev) => {
        if (!prev || !nextTricks.some((t) => t.id === prev.id)) {
          return nextTricks[0] || null;
        }
        return prev;
      });
    } else {
      // Reset state when dialog closes
      setTrickOptions([]);
      setSelectedTrick(null);
      setShowTrickSelection(false);
    }
  }, [open]);

  // Handle initial prop sync for selectedTrick
  useEffect(() => {
    if (
      selectedTrickProp &&
      (!selectedTrick || selectedTrickProp.id !== selectedTrick.id)
    ) {
      setSelectedTrick(selectedTrickProp);
    }
  }, [selectedTrickProp]);

  const handleUsePowerUp = useCallback(
    (powerUp: Powerup) => {
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

  const getPowerUpIcon = (type: PowerupType) => {
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

  const getPowerUpBgColor = (type: PowerupType) => {
    switch (type) {
      case "shield":
        return "bg-blue-100 dark:bg-blue-900";
      case "choose_trick":
        return "bg-purple-100 dark:bg-purple-900";
      default:
        return "bg-purple-100 dark:bg-purple-900";
    }
  };

  const groupPowerUps = (powerUps: Powerup[]) => {
    const grouped = powerUps.reduce((acc, powerUp) => {
      if (!acc[powerUp.type]) {
        acc[powerUp.type] = {
          ...powerUp,
          count: 1,
          id: powerUp.type, // Use type as ID since we're grouping by type
        };
      } else {
        acc[powerUp.type].count += 1;
      }
      return acc;
    }, {} as Record<string, Powerup & { count: number }>);

    return Object.values(grouped);
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
                {groupPowerUps(powerUps).map((powerUp) => (
                  <div
                    key={powerUp.type} // Use type as key since it's unique per group
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
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{powerUp.name}</h4>
                          {powerUp.count > 1 && (
                            <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                              {powerUp.count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {powerUp.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUsePowerUp(powerUp)}
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
