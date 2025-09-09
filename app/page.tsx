// app/page.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TurnTransitionSkeleton } from "@/components/turn-transition-skeleton";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Play, RotateCcw, Target, X, Users, Check, ArrowDown, Loader2 } from "lucide-react";
import gameStateCardSkeleton from "@/components/gameStateCardSkeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { difficultyColors } from "@/lib/tricks";
import { SKATE_LETTERS } from "@/lib/tricks";
import { useSkateboardGame } from "@/components/useSkateboardGame";
import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const SkateboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 16.5h15m-12 2.25a1.5 1.5 0 11-3 0m15 0a1.5 1.5 0 11-3 0"
    />
  </svg>
);

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

  return (
    <div className="min-h-screen py-2 bg-background relative">


      <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {!gameState.gameStarted && localStorageLoading ? gameStateCardSkeleton() : null}
        <div className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-2 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

          {/* cringe or nah? :P */}
          {/* <div className="text-center ">
            <h1 className=" font-bold text-balance text-[clamp(1.9rem,3.8vw,3.3rem)] leading-tight mb-0.5">
              Skate Deck
            </h1>
            <p className="text-gray-300 text-[clamp(0.875rem,2.5vw,1.25rem)] leading-snug mb-2">
              Tricks, Flicks, and Epic Picks! 🛹
            </p>
          </div> */}

          {gameState.showTrickPicker && (
            <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
              <div className="bg-card text-card-foreground border rounded-lg p-6 max-w-md w-full">
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


          {!gameState.gameStarted && !localStorageLoading ? (
            <div className="space-y-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">🎮 Start a New Game</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Add Players
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter player name"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addPlayer()}
                        className="flex-1"
                        maxLength={20}
                      />
                      <Button
                        onClick={addPlayer}
                        disabled={!newPlayerName.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {gameState.players.length > 0 && (
                    <div>
                      <div className="text-center">
                        {/* <p className="text-sm text-muted-foreground">
                            {gameState.trickLeaderLanded ? "Leader" : "Next up!"}
                          </p> */}
                        {/* <p className="font-medium">
                            {gameState.gamePhase === 'game-over' ? 'Game Over' :
                              gameState.trickLeaderLanded && gameState.leaderIndex !== null && gameState.leaderIndex < gameState.players.length
                                ? gameState.players[gameState.leaderIndex]?.name
                                : playersToAttempt[0]?.name || 'No players'}
                          </p> */}
                      </div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Players ({gameState.players.length})
                      </h4>
                      <div className="space-y-3">
                        {gameState.players.map((player, index) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                {index + 1}
                              </div>
                              <span className="font-medium">
                                {player.name}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => removePlayer(player.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={startGame}
                    disabled={gameState.players.length < 2}
                    className="w-full mt-4"
                    size="lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Game with {gameState.players.length} Player{gameState.players.length !== 1 ? 's' : ''}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : gameState.gamePhase === "game-over" ? (
            <div className="text-center space-y-2">
              <Card className="max-w-md mx-auto border-yellow-600">
                <CardContent className="p-2 sm:p-3 md:p-4">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                  <p className="text-xl text-yellow-400 mb-1">{gameState.winner} Wins!</p>
                  <p className="text-muted-foreground mb-2">Completed {gameState.roundNumber - 1} rounds</p>

                  {/* Final Scoreboard */}
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Final Standings</h3>
                    <div className="space-y-2">
                      {[...gameState.players]
                        .sort((a, b) => a.letters.length - b.letters.length)
                        .map((player, index) => (
                          <div
                            key={player.id}
                            className={`flex items-center justify-between p-2 rounded-lg ${player.name === gameState.winner
                              ? 'bg-yellow-500/10 border border-yellow-500/30'
                              : 'bg-muted/50'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '•'} {player.name}
                              </span>
                              {player.name === gameState.winner && (
                                <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">
                                  Winner
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {player.isEliminated ? (
                                <span className="text-destructive text-sm">Eliminated</span>
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  {5 - player.letters.length} letter{5 - player.letters.length === 1 ? '' : 's'} left
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center pt-2">
                    <Button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Play Again
                    </Button>
                    <Button
                      onClick={newGame}
                      variant="outline"
                      className="border-input hover:bg-accent hover:text-accent-foreground"
                    >
                      New Game
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className={`space-y-2 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {/* <Card
                className="bg-card hover:border-primary/50 border p-2 sm:p-3 rounded-xl shadow-md cursor-pointer transition-colors"

                onClick={() => setGameState((prev) => ({ ...prev, showTurnModal: true }))}
              >
                <div className="text-center space-y-3">
                  <div className="flex justify-center items-center gap-4 text-sm sm:text-base text-gray-300 font-medium">
                    
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{activePlayers.length}</span> players left
                    </div>
                  </div>

                  <div>
                    <p className="uppercase text-xs tracking-wide text-gray-400 mb-1">Current Trick</p>
                    <h2 className="text-xl sm:text-2xl font-bold text-primary">{gameState.currentTrick?.name}</h2>
                  </div>

                  {/* <div className="text-sm sm:text-base text-gray-400 mt-4">
                    {gameState.trickLeaderLanded ? (
                      <p>
                        <span className="font-semibold">{playersToAttempt.length}</span>{" "}
                        player{playersToAttempt.length !== 1 ? "s" : ""} need to attempt
                      </p>
                    ) : (
                      <p>
                        <span className="font-semibold text-yellow-400">{currentPlayer?.name}</span>{" "}
                        to set the trick
                      </p>
                    )}
                  </div> 
                </div>
              </Card> */}

              {gameState.showTurnModal && currentPlayer && gameState.currentTrick && (
                <Card className="w-full max-w-md mx-auto overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4 text-primary" />
                        Round {gameState.roundNumber}
                      </div>
                      <div className="flex items-center gap-2">
                        {currentPlayer?.consecutiveTricks > 1 && (
                          <Badge variant="secondary" className="gap-1 bg-gradient-to-r from-amber-500/90 to-amber-600/80 text-white">
                            🔥 {currentPlayer.consecutiveTricks}x Streak
                          </Badge>
                        )}
                        <Badge variant={gameState.leaderIndex === gameState.currentPlayerIndex ? "default" : "secondary"} className="gap-1">
                          {gameState.leaderIndex === gameState.currentPlayerIndex ? (
                            <span>👑 Leader</span>
                          ) : (
                            <span>🎯 Attempting</span>
                          )}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-center py-2">
                      {currentPlayer.name}'s Turn
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="bg-primary/10 border border-primary/5 dark:bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Current Trick</p>
                      <p className="text-xl font-bold text-primary">{gameState.currentTrick.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={missTrick}
                        className="h-14 text-base border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        Missed
                      </Button>
                      <Button
                        size="lg"
                        onClick={landTrick}
                        className="h-14 text-base bg-emerald-600 hover:bg-emerald-700"
                      >
                        Landed
                      </Button>
                    </div>
                  </CardContent>

                  <div className="border-t border-border/50 p-4 bg-muted/20">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-full">
                        <p className="text-sm text-muted-foreground text-center mb-2">
                          {5 - currentPlayer.letters.length} letter{5 - currentPlayer.letters.length === 1 ? '' : 's'} remaining
                        </p>
                      </div>

                      {/* SKATE letters */}
                      <div className="w-full">
                        <div className="flex justify-center gap-1.5 mb-3">
                          {SKATE_LETTERS.map((letter, index) => (
                            <div
                              key={letter}
                              className={`
                                w-7 h-7 text-xs rounded-md border-2 flex items-center justify-center 
                                font-bold transition-all duration-200
                                ${index < (currentPlayer?.letters.length || 0)
                                  ? 'bg-red-500 text-white border-red-600 scale-105 shadow-sm shadow-red-500/20 dark:bg-red-600/90 dark:border-red-500'
                                  : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-accent/50'
                                }`}
                            >
                              {letter}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skill Cards */}
                      {currentPlayer.skillCards && currentPlayer.skillCards.length > 0 && (
                        <div className="w-full">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full">
                                Skill Cards
                                <ArrowDown className="ml-2 h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="center" className="w-[90vw] max-w-md">
                              <div className="grid grid-cols-2 gap-3">
                                {currentPlayer.skillCards.map((card, index) => (
                                  <div
                                    key={index}
                                    onClick={() => handleSkillCardClick(card.id)}
                                    className="cursor-pointer p-2 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors text-center"
                                  >
                                    <div className="text-xl mb-1">
                                      {card.icon}
                                    </div>
                                    <div className="text-sm font-medium truncate">
                                      {card.name}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              <Card className="bg-card/80 border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground flex justify-between gap-2 items-center mb-2">Players Status
                    {activePlayers.length > 0 ? (
                      <span className="text-sm text-muted-foreground text-center ml-2 relative top-[0.069rem]">
                        ({activePlayers.length} Players)
                      </span>
                    ) : (
                      <span className="">
                        <Skeleton className="w-16 h-5" />
                      </span>
                    )}
                  </CardTitle>

                  {/* <div className="flex flex-wrap justify-center gap-1.5 max-h-20 overflow-y-auto p-1">
                    {gameState.players
                      .filter((p) => !p.isEliminated)
                      .map((player) => (
                        <Badge
                          key={player.id}
                          variant={player.id === currentPlayer.id ? 'default' : 'outline'}
                          className="gap-1.5 px-2.5 py-1 text-xs"
                        >
                          {player.name}
                        </Badge>
                      ))}
                  </div> */}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gameState.players.length === 0 ? (
                      <Skeleton className="flex justify-center w-full h-40" />
                    ) : (
                      gameState.players.map((player) => (
                        <div
                          key={player.id}
                          className={`p-4 rounded-lg border transition-all duration-200 ${player.isEliminated
                            ? "bg-destructive/5 border-destructive/30"
                            : player.id === currentPlayer?.id
                              ? "border-primary/50 bg-primary/5 shadow-sm"
                              : "border-primary/15 bg-card/50 hover:bg-accent/30"
                            }`}
                        >
                          {/* Player Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-full flex items-center gap-1">
                              <span className={`font-medium truncate ${player.isEliminated
                                ? "text-destructive/90"
                                : player.id === currentPlayer?.id
                                  ? "text-primary"
                                  : "text-foreground"
                                }`}>
                                {player.name}
                              </span>
                              {player.id === currentPlayer?.id && !player.isEliminated && (
                                <Badge variant="outline" className="h-5 text-xs bg-primary/10 text-primary border-primary/30">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {player.isEliminated && (
                                <Badge variant="destructive" className="h-5 text-xs">
                                  Out
                                </Badge>
                              )}
                              {!player.isEliminated && player.hasAttemptedCurrentTrick && gameState.trickLeaderLanded && (
                                <Badge variant="outline" className="flex-nowrap items-center gap-1 h-5 text-xs bg-green-500/10 text-green-500 border-green-500/30">
                                  <Check className="h-4 w-4" /> Landed
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* SKATE Letters */}
                          <div className="flex gap-1.5 mb-3">
                            {SKATE_LETTERS.map((letter, index) => (
                              <div
                                key={letter}
                                className={`w-7 h-7 rounded-md border flex items-center justify-center text-sm font-bold transition-all ${index < player.letters.length
                                  ? "bg-destructive/90 text-destructive-foreground border-destructive/80 shadow-inner"
                                  : "bg-muted/30 border-border text-muted-foreground"
                                  }`}
                              >
                                {letter}
                              </div>
                            ))}
                          </div>

                          {/* Stats and Skills */}
                          <div className="space-y-2">
                            {player.consecutiveTricks > 0 && (
                              <div className="flex items-center gap-1.5 text-xs text-amber-500">
                                <span className="flex items-center">🔥</span>
                                <span>{player.consecutiveTricks} tricks in a row</span>
                              </div>
                            )}

                            {player.skillCards.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {player.skillCards.map((card, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs h-6 px-2 py-0.5 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                                  >
                                    <span className="mr-1">{card.icon}</span>
                                    <span className="truncate max-w-[70px]">{card.name}</span>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )))}
                  </div>
                </CardContent>
              </Card>

              {isMounted ? <div className="text-center">
                <Button
                  onClick={() => setShowResetDialog(true)}
                  variant="outline"
                  className="border-gray-600 text-primary hover:bg-gray-800 bg-transparent transition-all duration-300"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Game
                </Button>
              </div>
                : null}

              <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset the entire game, including all player progress and scores.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={resetGame}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Reset Game
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>


      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ x: [0, 40, -60, 0] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <SkateboardIcon className="h-12 w-12 text-primary" />
            </motion.div>

            <p className="text-muted-foreground">Next turn...</p>
          </div>
        </div>
      )}
    </div>
  );
};