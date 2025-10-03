// src/components/PlayerSetupForm.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Info, X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import React from "react";
import { Player } from "@/types/game";
import { Skeleton } from "./ui/skeleton";
import Players from "./Players";

export interface PlayerSetupFormProps {
  username: string;
  players: Player[];
  isLoaded: boolean;
  onAddPlayer: (player: Player) => void;
  onRemovePlayer: (id: string) => void;
  onShufflePlayers: () => void;
  onResetPlayers: () => void;
  onStartGame?: (players: Player[]) => void;
  hasInitialized: boolean;
}

export function PlayerSetupForm({
  username,
  players,
  isLoaded,
  onAddPlayer,
  onRemovePlayer,
  onShufflePlayers,
  onResetPlayers,
  onStartGame,
  hasInitialized
}: PlayerSetupFormProps) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showRules, setShowRules] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Removed automatic creator addition - now handled by the parent component

  React.useEffect(() => {
    if (isLoaded && hasInitialized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoaded, hasInitialized]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addPlayer();
    }
  };

  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;

    if (name.toLowerCase() === username?.toLowerCase()) {
      toast.error('This name is already taken by the creator');
      return;
    }

    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      toast.error('A player with this name already exists');
      return;
    }

    const newPlayer: Player = {
      id: (players.length + 1).toString(),
      name,
      status: 'active',
      score: 0,
      isEliminated: false,
      isLeader: players.length === 0, // First player is leader
      isCreator: players.length === 0, // First player is creator
      letters: 0,
      consecutiveWins: 0
    };

    onAddPlayer(newPlayer);
    setNewPlayerName('');
    toast.success(`Added player: ${name}`);
  };

  if (!players) return null;

  return (
    <div className="flex flex-col items-center justify-center text-foreground pt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="sm:w-xl w-[92vw] shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border/50 dark:border-border/30 select-none">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">Start a New Game</CardTitle>
                <CardDescription>
                  {username ? `Welcome, ${username}!` : 'Add players to start the game'}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowRules(!showRules)}
                type="button"
              >
                {showRules ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          <AnimatePresence>
            {showRules && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.2 }}
                className="px-6"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  Type a player's name and press Enter or comma to add them.
                  The first player is the game creator.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-end gap-2 ">
                {/* <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onResetPlayers}
                  disabled={players.length <= 1}
                  className="text-xs"
                  title="Reset to original order"
                >
                  ↩️ Reset Order
                </Button> */}
                {/* <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onShufflePlayers}
                  disabled={players.length <= 1}
                  className="text-xs"
                  title="Randomize player order"
                >
                  🔀 Shuffle Players
                </Button> */}
              </div>
              <div className="space-y-2">
                {!isLoaded || !hasInitialized ? (
                  <Skeleton className="h-12 w-full flex flex-1 items-center pl-6" >
                    <Loader2 className="animate-spin size-5" />
                  </Skeleton>
                ) : (
                  players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${player.isCreator ? 'text-primary' : ''}`}>
                          {player.name}
                        </span>
                        {player.isCreator && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Creator
                          </span>
                        )}
                      </div>
                      {!player.isCreator && (
                        <div
                          onClick={() => onRemovePlayer(player.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          aria-label={`Remove ${player.name}`}

                        >
                          <Trash2 className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form
                className="flex gap-2 pt-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  addPlayer();
                }}
              >
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a player name and press Enter"
                  value={newPlayerName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewPlayerName(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                  disabled={!isLoaded || !hasInitialized}
                />
                <Button
                  type="submit"
                  disabled={!newPlayerName.trim() || players.length >= 6 || !isLoaded || !hasInitialized}
                  className="whitespace-nowrap"
                >
                  Add Player
                </Button>
              </form>

              <div className="pt-4">
                <Button
                  onClick={() => onStartGame?.(players)}
                  disabled={players.length < 2 || !isLoaded || !hasInitialized}
                  className="w-full"
                >
                  Start Game ({players.length}/6 players)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}