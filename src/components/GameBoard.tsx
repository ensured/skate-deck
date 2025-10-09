"use client";

import React, { useRef, useState } from "react";
import { useGame } from "@/hooks/useGame";
import { useDOMProtection } from "@/hooks/useDOMProtection";
import { CreateUsername } from "./CreateUsername";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Crown,
  Trash2,
  User,
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  Settings,
} from "lucide-react";
import { TrickCard } from "./TrickCard";

interface GameBoardProps {
  hasUsername: boolean;
}
const GameBoard = ({ hasUsername }: GameBoardProps) => {
  const {
    addPlayer,
    removePlayer,
    shufflePlayers,
    resetPlayers,
    startGame,
    handlePlayerAction,
    drawTrick,
    gameState,
    setGameStatus,
    clerkUser,
    isLoaded,
    hasInitialized,
    getDeckStatus,
  } = useGame();

  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("p1");
  const [isGameControlsOpen, setIsGameControlsOpen] = useState(false);
  const [isGameLogDialogOpen, setIsGameLogDialogOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isLobbyConfirmOpen, setIsLobbyConfirmOpen] = useState(false);

  // DOM Protection Setup
  const { updateProtectedContent } = useDOMProtection([
    {
      targetSelector: ".player-list",
      protectedContent: "", // Will be updated dynamically
      checkInterval: 2000,
      onViolation: (element, original, current) => {
        console.warn("🚨 Player list was modified externally!");
      },
    },
    {
      targetSelector: ".game-status",
      protectedContent: "",
      checkInterval: 3000,
      onViolation: (element, original, current) => {
        console.warn("🚨 Game status was modified externally!");
      },
    },
    {
      targetSelector: ".game-controls",
      protectedContent: "",
      checkInterval: 5000,
      onViolation: (element, original, current) => {
        console.warn("🚨 Game controls were modified externally!");
      },
    },
    {
      targetSelector: ".player-input",
      protectedContent: "",
      checkInterval: 1000,
      onViolation: (element, original, current) => {
        console.warn("🚨 Player input was modified externally!");
      },
    },
  ]);

  if (!hasUsername) {
    return <CreateUsername userId={clerkUser?.id || ""} />;
  }

  const handleAddPlayer = () => {
    addPlayer(name);
    setName("");
  };

  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayerId
  );

  return (
    <div className="w-full h-[calc(100vh-6rem)] flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Center Panel - Main Game Content */}
        <div className="flex-1 flex flex-col overflow-hidden justify-center items-center">
          {/* Game Content */}
          <div className="flex-1 p-2 sm:p-4 overflow-auto">
            {/* Lobby State */}
            {gameState.status === "lobby" && (
              <div className="max-w-md mx-auto">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Game Lobby</CardTitle>
                    <CardDescription>
                      Add players to start the game
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        ref={nameRef}
                        placeholder="Player name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddPlayer()
                        }
                        className="player-input"
                        maxLength={20}
                      />
                      <Button
                        onClick={handleAddPlayer}
                        disabled={
                          !name.trim() || gameState.players.length === 0
                        }
                      >
                        Add Player
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">
                          Players ({gameState.players.length})
                        </h3>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-2 player-list">
                        {gameState.players.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                          >
                            <div className="flex items-center gap-2">
                              {player.isCreator && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                              <span className="font-medium">{player.name}</span>
                              {player.id === gameState.currentPlayerId && (
                                <Badge variant="outline" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePlayer(player.id)}
                              disabled={
                                gameState.players.length <= 1 ||
                                player.isCreator
                              }
                              title={
                                player.isCreator
                                  ? "Cannot remove game owner"
                                  : "Remove player"
                              }
                            >
                              {player.isCreator ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => startGame(gameState.players)}
                      disabled={gameState.players.length < 2}
                      className="w-full"
                    >
                      Start Game
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Active Game State */}
            {gameState.status === "active" && (
              <div className="max-w-4xl mx-auto">
                {/* Current Trick - Centered */}
                {gameState.currentTrick && currentPlayer ? (
                  <TrickCard
                    trickName={gameState.currentTrick.name}
                    onResult={handlePlayerAction}
                    difficulty={
                      gameState.currentTrick
                        .difficulty as keyof typeof import("@/types/tricks").difficultyColors
                    }
                    points={gameState.currentTrick.points}
                    description={gameState.currentTrick.description}
                    currentPlayer={currentPlayer.name}
                    user={{
                      id: currentPlayer.id.toString(),
                      clerkId: currentPlayer.id.toString(),
                      username: currentPlayer.name,
                    }}
                    isLeader={currentPlayer.id === gameState.currentLeaderId}
                    gameStatus={gameState.status}
                    round={gameState.round}
                    cardsRemaining={getDeckStatus().remaining}
                    totalCards={getDeckStatus().total}
                  />
                ) : (
                  <Card className="border-2 border-orange-500 p-4 bg-orange-100 max-w-md mx-auto">
                    <CardContent>
                      <p className="text-orange-600 font-bold">
                        DEBUG: TrickCard not rendering
                      </p>
                      <p>gameState.status: {gameState.status}</p>
                      <p>
                        gameState.currentTrick:{" "}
                        {gameState.currentTrick ? "HAS TRICK" : "NO TRICK"}
                      </p>
                      <p>
                        currentPlayer:{" "}
                        {currentPlayer ? "HAS PLAYER" : "NO PLAYER"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Players */}
            {gameState.status === "active" && (
              <div className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 flex-shrink-0">
                <div className="p-3">
                  <h3 className="text-sm font-semibold mb-3 text-center lg:text-left">
                    Players ({gameState.players.length})
                  </h3>
                  {/* Game Status Section */}
                  {gameState.status === "active" && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      <Badge variant="default" className="text-xs">
                        Status: {gameState.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Round {gameState.round}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getDeckStatus().remaining}/{getDeckStatus().total}{" "}
                        cards
                      </Badge>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 max-h-48 lg:max-h-none overflow-y-auto">
                    {gameState.players.map((player) => (
                      <Card
                        key={player.id}
                        className={`p-2 h-16 transition-all duration-200 ${
                          player.isEliminated
                            ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 opacity-60"
                            : player.id === gameState.currentPlayerId
                            ? "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 shadow-md ring-1 ring-blue-200 dark:ring-blue-800"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between h-full gap-1">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-2">
                              {player.isLeader && (
                                <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                              )}

                              <span
                                className={`text-sm font-medium truncate ${
                                  player.isEliminated
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {player.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                              <div className="flex gap-0.5 flex-1">
                                {"SKATE".split("").map((letter, index) => (
                                  <div
                                    key={index}
                                    className={`text-xs px-1.5 py-0.5 rounded-sm flex-1 min-w-0 text-center font-medium ${
                                      player.letters > index
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                    }`}
                                  >
                                    {letter}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between h-full flex-shrink-0 ml-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                Score:
                              </span>
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                {player.score}
                              </span>
                            </div>
                          </div>
                          {player.id === gameState.currentLeaderId &&
                            gameState.leaderConsecutiveWins > 0 && (
                              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                🔥 {gameState.leaderConsecutiveWins}
                              </span>
                            )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Game Over State */}
            {gameState.status === "ended" && (
              <div className="max-w-2xl mx-auto text-center">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">
                      Game Over!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex flex-col items-center gap-1.5">
                      <Trophy className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-yellow-500 mb-2" />
                      <p className="text-base sm:text-lg font-medium mb-3">
                        {gameState.winner?.name || "Unknown"} won in{" "}
                        {gameState.round} Rounds!
                      </p>

                      {/* Show scores of all other players */}
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-muted-foreground">
                          Final Scores:
                        </p>
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
                                  {player.name}{" "}
                                  {player.id === winner?.id ? "👑" : ""}
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
                    <Button onClick={resetPlayers} className="w-full">
                      Play Again
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Toggle Button - Game Controls & Log */}
      {gameState.status === "active" && (
        <>
          {/* Toggle Button - Fixed at bottom center */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <Button
              onClick={() => setIsGameControlsOpen(!isGameControlsOpen)}
              size="lg"
              className="rounded-full w-16 h-16 shadow-xl bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-3 border-white/20 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Settings className="w-7 h-7" />
            </Button>
          </div>

          {/* Game Controls Sheet */}
          <Sheet open={isGameControlsOpen} onOpenChange={setIsGameControlsOpen}>
            <SheetContent side="bottom" className="py-6 rounded-t-2xl">
              <SheetHeader className="pb-6 pt-2">
                <SheetTitle className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Game Controls
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
                {/* Game Controls */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                      Game Actions
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Dialog
                      open={isResetConfirmOpen}
                      onOpenChange={setIsResetConfirmOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="lg"
                          className="h-12 bg-white/80 dark:bg-gray-800/80 border-2 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-700 text-red-700 dark:text-red-300 font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Reset Game
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Reset Game?
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            This will reset all players' scores and letters back
                            to zero, and start a new game with a fresh deck.
                            This action cannot be undone.
                          </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setIsResetConfirmOpen(false)}
                            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              resetPlayers();
                              setIsResetConfirmOpen(false);
                              setIsGameControlsOpen(false);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-lg cursor-pointer"
                          >
                            Reset Game
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={isLobbyConfirmOpen}
                      onOpenChange={setIsLobbyConfirmOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="lg"
                          className="h-12 bg-white/80 dark:bg-gray-800/80 border-2 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4 mr-2" />
                          Back to Lobby
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Return to Lobby?
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            This will end the current game and return to the
                            lobby where you can add/remove players and start a
                            new game.
                          </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setIsLobbyConfirmOpen(false)}
                            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              setGameStatus("lobby");
                              setIsLobbyConfirmOpen(false);
                              setIsGameControlsOpen(false);
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg cursor-pointer"
                          >
                            Back to Lobby
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Game Log Access */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                    <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                      Game History
                    </h4>
                  </div>
                  <Dialog
                    open={isGameLogDialogOpen}
                    onOpenChange={setIsGameLogDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-12 bg-white/80 dark:bg-gray-800/80 border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 dark:hover:border-blue-700 text-blue-700 dark:text-blue-300 font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4 mr-2" />
                        Game Log ({gameState.gameLog.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 shadow-2xl max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <ArrowDown className="w-5 h-5 text-blue-600" />
                          Game Log
                        </DialogTitle>
                      </DialogHeader>
                      <div className="max-h-96 overflow-y-auto space-y-2 p-1">
                        {gameState.gameLog.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                              <ArrowDown className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              No events yet...
                            </p>
                          </div>
                        ) : (
                          gameState.gameLog.slice(-50).map((log, index) => (
                            <div
                              key={index}
                              className="text-sm p-3 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors"
                            >
                              {log}
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
};

export default GameBoard;
