import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Trophy } from "lucide-react";
import { Button } from "../ui/button";
import { GameState } from "@/types/game";

interface GameOverProps {
  gameState: GameState;
  reset: () => void;
}

const GameOver = ({ gameState, reset }: GameOverProps) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Game Over!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col items-center gap-1.5">
            <Trophy className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-purple-500 mb-2" />
            <p className="text-base sm:text-lg font-medium mb-3">
              {gameState.winner?.name || "Unknown"} won in {gameState.round}{" "}
              Rounds!
            </p>

            {/* Show scores of all other players */}
            <div className="space-y-2 text-sm">
              <p className="font-medium text-muted-foreground">Final Scores:</p>
              {(() => {
                const winner = gameState.winner;

                return gameState.players

                  .sort((a, b) => {
                    // Sort winner first, then by score descending
                    if (a.id === winner?.id) return -1;
                    if (b.id === winner?.id) return 1;
                    return b.score - a.score;
                  })
                  .map((player) => (
                    <div
                      key={player.id}
                      className={`flex justify-between items-center py-1 px-2 rounded ${
                        player.id === winner?.id
                          ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                          : "bg-gray-50 dark:bg-gray-800"
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          player.id === winner?.id
                            ? "text-blue-800 dark:text-blue-200"
                            : ""
                        }`}
                      >
                        {player.name} {player.id === winner?.id ? "👑" : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          {player.letters}/5 letters
                        </span>
                        <span
                          className={`font-bold ${
                            player.id === winner?.id
                              ? "text-blue-800 dark:text-blue-200"
                              : ""
                          }`}
                        >
                          {player.score} pts
                        </span>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          </div>
          <Button onClick={reset} className="w-full">
            Play Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameOver;
