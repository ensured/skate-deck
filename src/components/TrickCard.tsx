"use client";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, X, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { difficultyColors } from "@/types/tricks";
import { ClerkUser } from "@/types/user";
import { motion } from "framer-motion";

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

  const handleButtonClick = (result: "landed" | "missed") => {
    if (typeof onResult === "function") {
      onResult(result);
    }
  };

  return (
    <Card
      className={cn(
        "w-full max-w-xs mx-auto p-0 relative overflow-hidden bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl",
        "bg-[radial-gradient(theme(colors.gray.200)_1px,transparent_1px)] dark:bg-[radial-gradient(theme(colors.gray.700)_1px,transparent_1px)]",
        "bg-[length:20px_20px]",
        "after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:to-black/5 dark:after:to-white/5",
        className
      )}
      style={{
        backgroundImage:
          "radial-gradient(var(--colors-gray-200) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Card Header */}
      <div className="relative z-10 p-5 pb-3">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <span className=" font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {currentPlayer}
            </span>
            <h3 className="text-3xl font-bold text-foreground mt-1">
              {trickName}
            </h3>
          </div>

          <div className="flex flex-col items-end space-y-0.5">
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
        </div>

        {description && (
          <div className="my-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700/50">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
              "{description}"
            </p>
          </div>
        )}

        {/* Card Footer */}
        <div className="relative z-10 px-5 pb-5 pt-2">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-3"></div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button
              variant="ghost"
              className={cn(
                "cursor-pointer relative h-12 text-sm font-medium text-white shadow-md hover:shadow-lg transform transition-all duration-200",
                "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
                "hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800",
                "active:scale-[0.98] active:shadow-inner"
              )}
              onClick={() => handleButtonClick("landed")}
            >
              <Check className="!h-7 !w-7" />
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="animate-[pulse_2s_ease-in-out_infinite] opacity-50 font-bold absolute top-1/2 left-[calc(50%+1.9rem)] transform -translate-x-1/2 -translate-y-1/2"
              >
                +{points}
              </motion.span>
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "cursor-pointer h-12 text-sm font-medium text-white shadow-md hover:shadow-lg transform transition-all duration-200",
                "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-500 dark:to-red-600",
                "hover:from-red-600 hover:to-red-700 dark:hover:from-red-600 dark:hover:to-red-700",
                "active:scale-[0.98] active:shadow-inner"
              )}
              onClick={() => handleButtonClick("missed")}
            >
              <X className="!h-7 !w-7" />
            </Button>
          </div>

          {/* Card Corner Decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gray-300 dark:border-gray-600 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gray-300 dark:border-gray-600 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gray-300 dark:border-gray-600 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gray-300 dark:border-gray-600 rounded-br-lg"></div>
        </div>
      </div>
    </Card>
  );
}
