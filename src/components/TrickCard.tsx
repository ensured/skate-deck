"use client";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, X, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { difficultyColors } from "@/types/tricks";
import { ClerkUser } from "@/types/user";

interface TrickCardProps {
  trickName: string;
  onResult: (result: 'landed' | 'missed') => void;
  className?: string;
  difficulty: keyof typeof difficultyColors;
  points: number;
  description: string;
  currentPlayer: string;
  user: ClerkUser;
  isLeader: boolean;
  gameStatus?: 'lobby' | 'active' | 'ended';
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
  gameStatus = 'active',
  round = 1,
  cardsRemaining = 0,
  totalCards = 0,
}: TrickCardProps) {
  const difficultyStyle = difficultyColors[difficulty] || difficultyColors.Beginner;

  const handleButtonClick = (result: 'landed' | 'missed') => {
    if (typeof onResult === 'function') {
      onResult(result);
    }
  };

  return (
    <Card className={cn("w-full max-w-sm mx-auto p-4 relative shadow-lg hover:shadow-xl transition-all duration-300 border-0", className)}>


      <div className="w-full mb-3">
        <div className={`${difficultyStyle.bg} ${difficultyStyle.text} px-2 py-1 rounded-full text-xs font-medium w-fit mb-2 shadow-sm`}>
          {difficulty}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3">
          <Award className="h-3.5 w-3.5 text-amber-500 drop-shadow-sm" />
          <span className="font-medium">{points} points</span>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-1.5 text-center text-foreground">{trickName}</h3>
      {description && (
        <p className="text-muted-foreground text-sm text-center mb-4 line-clamp-2 leading-relaxed">{description}</p>
      )}

      <div className="flex gap-2 px-2">
        <Button
          variant="ghost"
          className={cn(
            "flex-1 bg-gradient-to-r from-green-500/80 to-green-600/80 dark:from-green-600/80 dark:to-green-700/80 hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all duration-200 h-12 text-sm font-medium text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]",
          )}
          onClick={() => handleButtonClick('landed')}
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Landed (+{points})
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "flex-1 bg-gradient-to-r from-red-500/70 to-red-600/70 dark:from-red-500/50 dark:to-red-600/50 hover:from-red-600/80 hover:to-red-700/80 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 h-12 text-sm font-medium text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]",
          )}
          onClick={() => handleButtonClick('missed')}
        >
          <X className="mr-1.5 h-3.5 w-3.5" />
          Missed
        </Button>
      </div>
    </Card>
  );
}
