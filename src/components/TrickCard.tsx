"use client";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
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
}: TrickCardProps) {
  const difficultyStyle = difficultyColors[difficulty] || difficultyColors.Beginner;

  const handleButtonClick = (result: 'landed' | 'missed') => {
    if (typeof onResult === 'function') {
      onResult(result);
    }
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto p-6 relative", className)}>
      <div className={cn(
        "absolute top-2 right-2 text-white text-xs p-1 px-2 rounded font-medium flex items-center gap-1",
        currentPlayer === user.id ? 'bg-green-600' : 'bg-muted-foreground/50',
        isLeader && 'ring-2 ring-yellow-400'
      )}>
        {isLeader && '👑 '}
        {currentPlayer === user.id
          ? 'Your Turn!'
          : `Waiting for ${currentPlayer === user.id ? 'you' : 'player'}...`}
      </div>

      <div className="w-full mb-4">
        <div className={`${difficultyStyle.bg} ${difficultyStyle.text} px-3 py-1 rounded-full text-sm font-medium w-fit mb-2`}>
          {difficulty}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <Award className="h-4 w-4 text-amber-500" />
          <span>{points} points</span>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-2 text-center">{trickName}</h3>
      {description && (
        <p className="text-muted-foreground text-center mb-6">{description}</p>
      )}

      <div className="flex justify-between mt-4 space-x-2">
        <Button
          variant="outline"
          className={cn(
            "flex-1 bg-green-500 hover:bg-green-600 text-white transition-colors",
          )}
          onClick={() => handleButtonClick('landed')}
        >
          <Check className="mr-2 h-4 w-4" />
          Landed It! (+{points})
        </Button>
        <Button
          variant="outline"
          className={cn(
            "flex-1 bg-red-500 hover:bg-red-600 text-white transition-colors",
          )}
          onClick={() => handleButtonClick('missed')}
        >
          <X className="mr-2 h-4 w-4" />
          Missed (Get a Letter)
        </Button>
      </div>
    </Card>
  );
}
