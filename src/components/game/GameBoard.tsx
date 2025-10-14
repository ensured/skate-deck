"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/hooks/useGame";
import { useDOMProtection } from "@/hooks/useDOMProtection";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollText } from "lucide-react";
import { TrickCard } from "../tricks/TrickCard";
import { TrickCard as TrickCardType } from "@/types/tricks";
import LobbyView from "./LobbyView";
import GameOver from "./GameOver";
import GameControlsSheet from "./GameControlsSheet";
import GameTrickCard from "./GameTrickCard";

export function GameBoard() {
  const {
    addPlayer,
    removePlayer,
    startGame,
    handlePlayerAction,
    gameState,
    clerkUser,
    getDeckStatus,
    reset,
    newGame,
    peekNextCards,
    shufflePlayers,
    toggleShufflePlayers,
    updatePowerUpChance,
  } = useGame();

  // All hooks must be called at the top level, before any conditional returns
  const nameRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef(null);

  const [name, setName] = useState("");
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isLobbyConfirmOpen, setIsLobbyConfirmOpen] = useState(false);

  const [scrolledAtTop, setScrolledAtTop] = useState(true);

  const handleTrickResult = useCallback(
    (
      result: "landed" | "missed" | "use_shield" | "use_choose_trick",
      selectedTrick?: TrickCardType
    ) => {
      // Let handlePlayerAction manage all state updates
      handlePlayerAction(result, selectedTrick);
    },
    [handlePlayerAction] // Only depends on handlePlayerAction
  );

  const handleAddPlayer = () => {
    addPlayer(name);
    setName("");
  };

  const handleNewGame = useCallback(() => {
    newGame();
    // Close all dialogs and sheets
    setIsLobbyConfirmOpen(false);
  }, [newGame]);

  // DOM Protection Setup for player list
  useDOMProtection([
    {
      targetSelector: ".player-list",
      protectedContent: "", // Will be updated dynamically
      checkInterval: 2000,
      onViolation: (element, original, current) => {
        console.warn(
          "🚨 Player list was modified externally!",
          element,
          original,
          current
        );
      },
    },
    {
      targetSelector: ".game-status",
      protectedContent: "",
      checkInterval: 3000,
      onViolation: (element, original, current) => {
        console.warn(
          "🚨 Game status was modified externally!",
          element,
          original,
          current
        );
      },
    },
    {
      targetSelector: ".game-controls",
      protectedContent: "",
      checkInterval: 5000,
      onViolation: (element, original, current) => {
        console.warn(
          "🚨 Game controls were modified externally!",
          element,
          original,
          current
        );
      },
    },
    {
      targetSelector: ".player-input",
      protectedContent: "",
      checkInterval: 1000,
      onViolation: (element, original, current) => {
        console.warn(
          "🚨 Player input was modified externally!",
          element,
          original,
          current
        );
      },
    },
  ]);

  // Get current player before any conditional returns
  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayerId
  );

  useEffect(() => {
    if (clerkUser) {
      nameRef.current?.focus();
    }
  }, [clerkUser]);

  useEffect(() => {
    if (gameState.players.length < 16 && clerkUser) {
      setTimeout(() => {
        setName("p" + (gameState.players.length + 1));
      }, 50);
    }
  }, [gameState.players.length]);

  return (
    <div className="w-full h-full pb-4 flex flex-col">
      {/* Main Content Area */}
      <div className="pt-6 px-2 flex flex-col lg:flex-row overflow-hidden">
        {/* Center Panel - Main Game Content */}
        <div className="flex-1  overflow-hidden justify-center items-center">
          {/* Game Content */}
          <div className="overflow-auto w-full max-w-[48em] mx-auto">
            Lobby State
            {gameState.status === "lobby" && (
              <LobbyView
                gameState={gameState}
                isHowToPlayOpen={isHowToPlayOpen}
                setIsHowToPlayOpen={setIsHowToPlayOpen}
                nameRef={nameRef}
                playerRef={playerRef}
                name={name}
                setName={setName}
                isGameStarting={gameState.status === "lobby"}
                handleAddPlayer={handleAddPlayer}
                removePlayer={removePlayer}
                shufflePlayers={shufflePlayers}
                toggleShufflePlayers={toggleShufflePlayers}
                scrolledAtTop={scrolledAtTop}
                setScrolledAtTop={setScrolledAtTop}
                startGame={startGame}
              />
            )}
            {gameState.status === "active" && (
              <div>
                <div className="flex flex-wrap justify-center items-center gap-2 -mb-1">
                  <Badge variant="default" className="text-sm">
                    Players ({gameState.players.length})
                  </Badge>
                  <Badge variant="default" className="text-sm">
                    Status: {gameState.status.toUpperCase()}
                  </Badge>
                  <Badge variant="default" className="text-sm">
                    Round {gameState.round}
                  </Badge>
                  <Badge variant="default" className="text-sm">
                    {getDeckStatus().remaining}/{getDeckStatus().total} cards
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild className="cursor-pointer">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-sm !bg-accent/95"
                      >
                        <ScrollText className="h-3.5 w-3.5" />
                        Log ({gameState.gameLog.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <ScrollText className="h-5 w-5" />
                          Game Log
                        </DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[60vh] overflow-y-auto space-y-2 p-1">
                        {gameState.gameLog.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                              <ScrollText className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground text-sm">
                              No events yet...
                            </p>
                          </div>
                        ) : (
                          gameState.gameLog.slice(-50).map((log, index) => (
                            <div
                              key={index}
                              className="text-sm p-3 bg-muted/50 rounded-lg border hover:bg-muted transition-colors"
                            >
                              {log}
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="w-full">
                  {/* Current Trick - Centered */}
                  {gameState.currentTrick && currentPlayer && (
                    <TrickCard
                      peekNextCards={peekNextCards}
                      trickName={gameState.currentTrick.name}
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
                      gameState={gameState}
                      round={gameState.round}
                      cardsRemaining={getDeckStatus().remaining}
                      totalCards={getDeckStatus().total}
                      powerUps={
                        gameState.players.find(
                          (p) => p.id === gameState.currentPlayerId
                        )?.inventory.powerups || []
                      }
                      onResult={handleTrickResult}
                    />
                  )}
                </div>

                {/* Lobby Header */}
                <GameTrickCard
                  gameState={gameState}
                  currentPlayer={currentPlayer}
                />
              </div>
            )}
            {/* Game Over State */}
            {gameState.status === "ended" && (
              <GameOver gameState={gameState} reset={reset} />
            )}
          </div>
        </div>
      </div>

      {/* Game Controls & Log */}
      {gameState.status === "active" && (
        <GameControlsSheet
          gameState={gameState}
          isLobbyConfirmOpen={isLobbyConfirmOpen}
          setIsLobbyConfirmOpen={setIsLobbyConfirmOpen}
          reset={reset}
          updatePowerUpChance={updatePowerUpChance}
          handleNewGame={handleNewGame}
        />
      )}
    </div>
  );
}
