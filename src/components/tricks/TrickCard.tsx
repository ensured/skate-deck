"use client";

import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { Check, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { difficultyColors } from "@/types/tricks";
import { ClerkUser } from "@/types/user";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { PowerUpsDialog } from "../PowerUpsDialog";
import { SkillCard } from "@/types/game";
import { TrickCard as TrickCardType } from "@/types/tricks";

// First, update the TrickCardProps interface to include the shield functionality
interface TrickCardProps {
  trickName: string;
  onResult: (
    result: "landed" | "missed" | "use_shield" | "use_choose_trick",
    selectedTrick?: TrickCardType
  ) => void;
  className?: string;
  difficulty: keyof typeof difficultyColors;
  points: number;
  description: string;
  currentPlayer: string;
  user: ClerkUser;
  isLeader: boolean;
  gameStatus?: "lobby" | "active" | "ended";
  round?: number;
  cardsRemaining?: number;
  totalCards?: number;
  powerUps?: SkillCard[]; // Add power-ups array to props
  peekNextCards?: (count: number) => TrickCardType[];
  selectedTrick?: TrickCardType;
}

export function TrickCard({
  trickName,
  onResult,
  className,
  difficulty,
  points,
  description,
  currentPlayer,
  powerUps = [],
  peekNextCards,
  selectedTrick,
}: TrickCardProps) {
  const [showButtons, setShowButtons] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [showPowerUps, setShowPowerUps] = useState(false);
  const [powerUpPulse, setPowerUpPulse] = useState(false);
  const [newPowerUp, setNewPowerUp] = useState<SkillCard | null>(null);
  const prevPowerUpsLength = useRef(powerUps.length);
  const powerUpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper function to get power-up display name and icon
  const getPowerUpInfo = (type: string) => {
    switch (type) {
      case "shield":
        return { name: "Shield", icon: "🛡️" };
      case "choose_trick":
        return { name: "Choose Trick", icon: "🎯" };
      case "reroll":
        return { name: "Reroll", icon: "🔄" };
      default:
        return { name: type, icon: "✨" };
    }
  };

  useEffect(() => {
    if (powerUps.length > prevPowerUpsLength.current) {
      // Find the new power-up that was just added
      const addedPowerUp = powerUps.find(
        (_, index) => index >= prevPowerUpsLength.current
      );

      if (addedPowerUp) {
        setNewPowerUp(addedPowerUp);

        // Show the new power-up for 1.5 seconds
        powerUpTimeoutRef.current = setTimeout(() => {
          setNewPowerUp(null);
          // Then show the pulse animation on the power-up count
          setPowerUpPulse(true);
          const timer = setTimeout(() => setPowerUpPulse(false), 1000);
          return () => clearTimeout(timer);
        }, 1500);
      }
    } else if (powerUps.length < prevPowerUpsLength.current) {
      // If a power-up was used, just show the pulse
      setPowerUpPulse(true);
      const timer = setTimeout(() => setPowerUpPulse(false), 1000);
      return () => clearTimeout(timer);
    }

    prevPowerUpsLength.current = powerUps.length;

    return () => {
      if (powerUpTimeoutRef.current) {
        clearTimeout(powerUpTimeoutRef.current);
        powerUpTimeoutRef.current = null;
      }
    };
  }, [powerUps.length]);

  useEffect(() => {
    const buttonTimer = setTimeout(() => {
      setShowButtons(true);
      const pointsTimer = setTimeout(() => {
        setShowPoints(true);
      }, 500);
      return () => clearTimeout(pointsTimer);
    }, 1500);

    setShowButtons(false);
    setShowPoints(false);

    return () => {
      clearTimeout(buttonTimer);
    };
  }, [trickName]);

  const handleButtonClick = (result: "landed" | "missed" | "use_shield") => {
    if (onResult && showButtons) {
      onResult(result);
    }
  };

  return (
    <div className={cn("w-full  relative px-4", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={trickName}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 500,
              damping: 25,
              mass: 0.5,
            },
          }}
          exit={{
            opacity: 0,
            y: -30,
            scale: 0.95,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          }}
          className="relative"
        >
          {/* New Power-up Notification */}
          <AnimatePresence>
            {newPowerUp && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-10"
              >
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm">
                    {getPowerUpInfo(newPowerUp.type).icon}
                  </span>
                  <span>New: {getPowerUpInfo(newPowerUp.type).name}!</span>
                  <span className="text-xs opacity-80">+1</span>
                </div>
                <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-purple-500 transform -translate-x-1/2 translate-y-1/2 rotate-45"></div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="relative w-full h-full "
            initial={false}
            whileTap={{
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 15,
                mass: 0.4,
              },
              scale: 0.995,
            }}
          >
            {/* Card Header */}
            <div className="relative z-10 px-6 py-5">
              {/* Player Info */}
              <div className="mb-2">
                <motion.div
                  key={`turn-${currentPlayer}`}
                  className="font-mono font-bold uppercase tracking-wider text-muted-foreground text-xs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                      mass: 0.8,
                    },
                  }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {currentPlayer}&#39;s Turn
                </motion.div>

                {/* Trick Name with Animated Underline */}
                <div className="relative group">
                  <h3 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 tracking-tight leading-tight">
                    {trickName.split("").map((letter, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.03,
                          type: "spring",
                          stiffness: 500,
                          damping: 20,
                        }}
                        className="inline-block"
                      >
                        {letter === " " ? "\u00A0" : letter}
                      </motion.span>
                    ))}
                  </h3>
                  <motion.div
                    className={`h-0.5 absolute bottom-0 left-0 ${
                      difficulty === "Beginner"
                        ? "bg-green-500"
                        : difficulty === "Intermediate"
                        ? "bg-amber-500"
                        : difficulty === "Advanced"
                        ? "bg-orange-500"
                        : difficulty === "Pro"
                        ? "bg-red-600"
                        : "bg-gray-400"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 0.5,
                      delay: trickName.length * 0.02,
                    }}
                  />
                </div>
              </div>

              {description && (
                <motion.div
                  className="mb-4 p-4 bg-muted/30 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">
                      &quot;{description}&quot;
                    </p>
                    <Badge
                      variant="outline"
                      className="text-xs font-mono h-fit flex items-center gap-1.5"
                    >
                      {difficulty}
                      <div
                        className={`h-2 w-2 rounded-full ${
                          difficulty === "Beginner"
                            ? "bg-green-500"
                            : difficulty === "Intermediate"
                            ? "bg-amber-500"
                            : difficulty === "Advanced"
                            ? "bg-orange-500"
                            : difficulty === "Pro"
                            ? "bg-red-600"
                            : "bg-gray-400" // Fallback color
                        }`}
                        title={`${difficulty} difficulty`}
                      />
                    </Badge>
                  </div>
                </motion.div>
              )}

              {/* Card Footer */}
              <div className="relative z-10 px-5 pb-5 pt-2">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-2"></div>

                <div className="flex items-center justify-center gap-4 mt-3">
                  {showButtons ? (
                    <>
                      <div className="relative group flex-1">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
                        <Button
                          variant="ghost"
                          className={cn(
                            "relative w-full h-12 text-sm font-medium text-white shadow-md hover:shadow-lg transform transition-all duration-300 cursor-pointer",
                            "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
                            "hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800",
                            "active:scale-[0.98] active:shadow-inner"
                          )}
                          onClick={() => handleButtonClick("landed")}
                        >
                          <Check className="!h-7 !w-7" />
                          {showPoints && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{
                                opacity: 0.95,
                                scale: [0, 1.5, 1],
                              }}
                              exit={{ opacity: 0, scale: 0.7 }}
                              transition={{
                                duration: 0.5,
                                ease: "easeInOut",
                                times: [0, 0.7, 1],
                              }}
                              className="font-bold absolute top-1/2 left-[calc(50%+1.9rem)] transform -translate-x-1/2 -translate-y-1/2 animate-[pulse_2.22s_ease-in-out_infinite]"
                            >
                              +{points}
                            </motion.span>
                          )}
                        </Button>
                      </div>

                      {/* Power-ups Button */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer relative h-12 w-12 rounded-full bg-background border border-border shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors group"
                          onClick={() => setShowPowerUps(true)}
                        >
                          <Zap
                            className={`h-5 w-5 transition-all duration-200 ${
                              powerUpPulse
                                ? "text-primary scale-110"
                                : "text-muted-foreground group-hover:text-primary"
                            }`}
                          />
                          {powerUps.length > 0 && (
                            <motion.span
                              key={`powerup-${powerUps.length}`}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{
                                scale: powerUpPulse ? [1, 1.5, 1] : 1,
                                opacity: 1,
                                rotate: powerUpPulse ? [0, 10, -10, 0] : 0,
                                y: powerUpPulse ? [0, -5, 0] : 0,
                              }}
                              transition={{
                                duration: 0.6,
                                ease: "easeOut",
                                scale: { duration: 0.6 },
                                rotate: { duration: 0.6 },
                                y: { duration: 0.6 },
                              }}
                              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold ring-2 ring-background"
                            >
                              {powerUps.length}
                            </motion.span>
                          )}
                        </Button>
                      </div>

                      <div className="relative group flex-1">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
                        <Button
                          variant="ghost"
                          className={cn(
                            "relative w-full h-12 text-sm font-medium text-white shadow-md hover:shadow-lg transform transition-all duration-300 cursor-pointer",
                            "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-500 dark:to-red-600",
                            "hover:from-red-600 hover:to-red-700 dark:hover:from-red-600 dark:hover:to-red-700",
                            "active:scale-[0.98] active:shadow-inner"
                          )}
                          onClick={() => handleButtonClick("missed")}
                        >
                          <X className="!h-7 !w-7" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </>
                  )}
                </div>
              </div>
              {/* Card Corner Decorations */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gray-300 dark:border-gray-600 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gray-300 dark:border-gray-600 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gray-300 dark:border-gray-600 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gray-300 dark:border-gray-600 rounded-br-lg"></div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <PowerUpsDialog
        open={showPowerUps}
        onOpenChange={setShowPowerUps}
        powerUps={powerUps}
        peekNextCards={peekNextCards || (() => [])}
        selectedTrickProp={selectedTrick}
        onUsePowerUp={(powerUp, selectedTrick) => {
          if (powerUp.type === "shield") {
            onResult("use_shield");
          } else if (powerUp.type === "choose_trick" && selectedTrick) {
            onResult("use_choose_trick", selectedTrick);
          }
          setShowPowerUps(false);
        }}
      />
    </div>
  );
}
