"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/hooks/useGame";
import { useDOMProtection } from "@/hooks/useDOMProtection";
import { TrickCard } from "../tricks/TrickCard";
import { TrickCard as TrickCardType } from "@/types/tricks";
import LobbyView from "./LobbyView";
import GameOver from "./GameOver";
import GameControlsSheet from "./GameControlsSheet";
import InGamePlayerCards from "./InGamePlayerCards";
import InGameHeader from "./InGameHeader";
import { AnimatePresence, motion } from "framer-motion";
import { domProtectionConfig } from "@/types/dom-protection";

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
    updatePlayerName,
  } = useGame();

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
    nameRef.current?.focus();
  };

  const handleNewGame = useCallback(() => {
    newGame();
    // Close all dialogs and sheets
    setIsLobbyConfirmOpen(false);
  }, [newGame]);

  // DOM Protection Setup for player list
  useDOMProtection(domProtectionConfig);

  // Get current player before any conditional returns
  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayerId
  );

  useEffect(() => {
    if (clerkUser) {
      nameRef.current?.focus();
    }
  }, [clerkUser]);

  // for dev testing
  // useEffect(() => {
  //   if (gameState.players.length < 16 && clerkUser) {
  //     setTimeout(() => {
  //       setName("p" + (gameState.players.length + 1));
  //     }, 50);
  //   }
  // }, [gameState.players.length]);

  return (
    <div className="w-full h-full pb-4 flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key="game-board"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="w-full h-full"
        >
          <div className="pt-6  flex flex-col lg:flex-row overflow-hidden">
            <div className="flex-1  overflow-hidden justify-center items-center">
              <div className="overflow-auto w-full max-w-[48em] mx-auto">
                {gameState.status === "lobby" && (
                  <LobbyView
                    gameState={gameState}
                    isHowToPlayOpen={isHowToPlayOpen}
                    setIsHowToPlayOpen={setIsHowToPlayOpen}
                    nameRef={nameRef}
                    playerRef={playerRef}
                    name={name}
                    setName={setName}
                    handleAddPlayer={handleAddPlayer}
                    removePlayer={removePlayer}
                    shufflePlayers={shufflePlayers}
                    toggleShufflePlayers={toggleShufflePlayers}
                    scrolledAtTop={scrolledAtTop}
                    setScrolledAtTop={setScrolledAtTop}
                    startGame={startGame}
                    updatePlayerName={updatePlayerName}
                  />
                )}
                {gameState.status === "active" && (
                  <div>
                    <InGameHeader
                      gameState={gameState}
                      getDeckStatus={getDeckStatus}
                    />

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
                          isLeader={
                            currentPlayer.id === gameState.currentLeaderId
                          }
                          powerUps={
                            gameState.players.find(
                              (p) => p.id === gameState.currentPlayerId
                            )?.inventory.powerups || []
                          }
                          onResult={handleTrickResult}
                        />
                      )}
                    </div>

                    <InGamePlayerCards
                      gameState={gameState}
                      currentPlayer={currentPlayer || gameState.players[0]}
                    />
                    <GameControlsSheet
                      gameState={gameState}
                      isLobbyConfirmOpen={isLobbyConfirmOpen}
                      setIsLobbyConfirmOpen={setIsLobbyConfirmOpen}
                      reset={reset}
                      updatePowerUpChance={updatePowerUpChance}
                      handleNewGame={handleNewGame}
                    />
                  </div>
                )}
                {gameState.status === "ended" && (
                  <GameOver gameState={gameState} reset={reset} />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
