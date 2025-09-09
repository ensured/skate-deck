// app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TurnTransitionSkeleton } from "@/components/turn-transition-skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Play, RotateCcw, Target, X, Users, Check, ArrowDown, Loader2 } from "lucide-react";
import gameStateCardSkeleton from "@/components/gameStateCardSkeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { difficultyColors } from "@/lib/tricks";
import { SKATE_LETTERS } from "@/lib/tricks";
import { useSkateboardGame } from "@/components/useSkateboardGame";
import { useState, useEffect } from 'react';

export default function SkateboardCardGame() {
  const {
    gameState,
    setGameState,
    localStorageLoading,
    newPlayerName,
    setNewPlayerName,
    currentPlayer,
    activePlayers,
    playersToAttempt,
    addPlayer,
    removePlayer,
    startGame,
    landTrick,
    missTrick,
    resetGame,
    newGame,
    handleSkillCardClick,
    handleTrickSelect,
    isTransitioning
  } = useSkateboardGame();

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Render loading state
  if (!isMounted || localStorageLoading) {
    return (
      <div className="min-h-screen p-4 bg-background">
        <div className="max-w-2xl mx-auto">
          {gameStateCardSkeleton()}
        </div>
      </div>
    );
  }

  // Render transition state
  if (isTransitioning) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto">
          <TurnTransitionSkeleton />
        </div>
      </div>
    );
  }

  // Render main game content
  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-2xl mx-auto">
        {gameState.showTrickPicker && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
            <div className="bg-card text-card-foreground border rounded-lg p-6 w-full max-w-md">
              <h2 className="text-center text-xl font-semibold mb-2">Pick Your Trick</h2>
              <div className="grid grid-cols-1 gap-3 mb-2">
                {gameState.trickPickerOptions?.map((trick) => (
                  <Button
                    key={trick.id}
                    onClick={() => handleTrickSelect(trick)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-lg text-left w-full"
                  >
                    <div className="font-bold text-lg">{trick.name}</div>
                  </Button>
                ))}
              </div>
              {!gameState.modalOverlay && (
                <Button
                  onClick={() => setGameState((prev) => ({ ...prev, showTrickPicker: false }))}
                  className="w-full bg-muted hover:bg-muted/80"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {!gameState.gameStarted ? (
          <div className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">🎮 Start a New Game</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Rest of your game content */}
              </CardContent>
            </Card>
          </div>
        ) : gameState.gamePhase === "game-over" ? (
          <div className="text-center space-y-2">
            <Card className="max-w-md mx-auto border-yellow-600">
              <CardContent className="p-4">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                <p className="text-xl text-yellow-400 mb-1">{gameState.winner} Wins!</p>
                <p className="text-muted-foreground mb-2">Completed {gameState.roundNumber - 1} rounds</p>
                {/* Rest of your game over content */}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Main game UI
          <div className="space-y-4">
            {/* Your main game UI components */}
          </div>
        )}
      </div>
    </div>
  );
}
