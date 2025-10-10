"use client";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Check, X, Award } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple hover effect using Tailwind classes only
import { difficultyColors } from "@/types/tricks";
import { ClerkUser } from "@/types/user";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useState, useEffect } from "react";

interface TrickCardProps {
  trickName: string;
  onResult: (result: "landed" | "missed") => void;
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
}

export function TrickCard({
  trickName,
  onResult,
  className,
  difficulty,
  points,
  description,
  currentPlayer,
  user,
  isLeader,
  gameStatus = "active",
  round = 1,
  cardsRemaining = 0,
  totalCards = 0,
}: TrickCardProps) {
  const difficultyStyle =
    difficultyColors[difficulty] || difficultyColors.Beginner;

  const [showButtons, setShowButtons] = useState(false);
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    // Show buttons after 3 seconds
    const buttonTimer = setTimeout(() => {
      setShowButtons(true);
      // Show points 0.7 seconds after buttons appear
      const pointsTimer = setTimeout(() => {
        setShowPoints(true);
      }, 700);
      return () => clearTimeout(pointsTimer);
    }, 3000);

    // Reset states when trick changes
    setShowButtons(false);
    setShowPoints(false);

    return () => {
      clearTimeout(buttonTimer);
    };
  }, [trickName]);

  const handleButtonClick = (result: "landed" | "missed") => {
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
              stiffness: 300,
              damping: 20,
            },
          }}
          exit={{
            opacity: 0,
            y: -30,
            scale: 0.95,
            transition: {
              duration: 0.2,
            },
          }}
        >
          <motion.div
            className="relative w-full h-full "
            initial={false}
            whileTap={{
              transition: { type: "spring", stiffness: 300, damping: 10 },
              scale: 0.995,
            }}
          >
            {/* Card Header */}
            <div className="relative z-10 px-6 py-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <span className="font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {currentPlayer}
                  </span>
                  <h3 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 mt-1 tracking-tight leading-tight">
                    {trickName.split('').map((letter, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.03,
                          type: "spring",
                          stiffness: 300,
                          damping: 20
                        }}
                        className="inline-block"
                      >
                        {letter === ' ' ? '\u00A0' : letter}
                      </motion.span>
                    ))}
                  </h3>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1">
                <div
                  className={`${difficultyStyle.bg} ${difficultyStyle.text} px-2.5 py-1 rounded-full text-xs font-semibold shadow-md`}
                >
                  {difficulty}
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs mt-2 font-medium">
                  <Award className="h-3.5 w-3.5" />
                  <span>{points} points</span>
                </div>
              </div>
              {description && (
                <div className="my-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700/50">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    &quot;{description}&quot;
                  </p>
                </div>
              )}

              {/* Card Footer */}
              <div className="relative z-10 px-5 pb-5 pt-2">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-2"></div>

                <div className="grid grid-cols-2 gap-5 mt-3">
                  {showButtons ? (
                    <>
                      <div className="relative group">
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
                              scale: [0, 1.5, 1], // Start at 0, zoom to 150%, then back to 100%
                            }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{
                              duration: 0.5, // Total duration of 1 second
                              ease: "easeInOut",
                              times: [0, 0.7, 1], // Timing of the keyframes (0%, 70%, 100%)
                            }}
                            className="font-bold absolute top-1/2 left-[calc(50%+1.9rem)] transform -translate-x-1/2 -translate-y-1/2 animate-[pulse_2.22s_ease-in-out_infinite]"
                          >
                            +{points}
                          </motion.span>
                        )}
                        </Button>
                      </div>
                      <div className="relative group">
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
    </div>
  );
}
