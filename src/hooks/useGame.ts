"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import useUser from "./useUser";
import { TrickCard, trickCards } from "@/types/tricks";
import { GameState, GameStatus } from "@/types/game";
import { toast } from "sonner";
import { shuffleArray } from "@/lib/utils";
import { chooseTrick, Powerup, shield } from "../types/powerups";
import { startingPowerups } from "../types/powerups";
import { Player } from "@/types/player";

export const useGame = () => {
  const { clerkUser, isLoaded: isClerkUserLoaded } = useUser();
  const [deck, setDeck] = useState<TrickCard[]>([]);

  const initializeDeck = useCallback(() => {
    const shuffledDeck = shuffleArray([...trickCards]);
    setGameState((prev) => ({
      ...prev,
      totalDeckSize: shuffledDeck.length,
    }));

    setDeck(shuffledDeck);
    return shuffledDeck;
  }, []);

  const peekNextCards = useCallback(
    (count: number): TrickCard[] => {
      if (deck.length === 0) {
        if (deck.length > 0) {
          const reshuffled = shuffleArray([...deck]);
          setDeck(reshuffled);
          return reshuffled.slice(0, Math.min(count, reshuffled.length));
        }
        return [];
      }
      setDeck((prev) => prev.slice(count));
      return deck.slice(0, Math.min(count, deck.length));
    },
    [deck]
  );

  const drawCard = useCallback(() => {
    if (deck.length === 0) {
      if (deck.length > 0) {
        const reshuffled = shuffleArray([...deck]);
        setDeck(reshuffled);

        if (reshuffled.length === 0) {
          return null;
        }

        const drawnCard = reshuffled[0];
        setDeck(reshuffled.slice(1));
        return drawnCard;
      }

      return null;
    }
    const drawnCard = deck[0];
    setDeck((prevDeck) => prevDeck.slice(1));

    return drawnCard;
  }, [deck]);

  const [gameState, setGameState] = useState<GameState>({
    gameCreator: null,
    status: "lobby",
    players: [],
    currentLeaderId: 0,
    currentPlayerId: 0,
    currentTurnIndex: 0,
    currentTrick: undefined,
    discardedTricks: [],
    round: 1,
    leaderConsecutiveWins: 0,
    gameLog: [],
    startTime: null,
    endTime: null,
    roundComplete: false,
    currentAttempts: {},
    totalDeckSize: 0,
    currentRoundTurns: 0,
    settings: {
      powerUpChance: 0.05,
    },
  });

  const updatePowerUpChance = useCallback((chance: number) => {
    setGameState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        powerUpChance: chance,
      },
    }));
  }, []);

  useEffect(() => {
    if (isClerkUserLoaded && clerkUser) {
      setGameState((prev) => ({
        ...prev,
        players: [
          {
            id: 0,
            name: clerkUser.username,
            letters: 0,
            isEliminated: false,
            isCreator: true,
            isLeader: true,
            score: 0,
            inventory: {
              powerups: [...startingPowerups],
            },
          },
        ],
      }));
    }
  }, [clerkUser, isClerkUserLoaded]);

  const addPlayer = useCallback(
    (name: string) => {
      const trimmedName = name?.trim();

      if (!trimmedName) {
        toast.error("Player name cannot be empty");
        return;
      }

      const nameRegex = /^[a-zA-Z0-9\s\-'\.]+$/;
      if (!nameRegex.test(trimmedName)) {
        toast.error("Player name contains invalid characters");
        return;
      }

      if (trimmedName.length < 2) {
        toast.error("Player name must be at least 2 characters");
        return;
      }
      if (trimmedName.length > 20) {
        toast.error("Player name cannot exceed 20 characters");
        return;
      }

      if (gameState.players.length >= 16) {
        toast.error("Maximum of 16 players allowed");
        return;
      }

      setGameState((prev) => {
        const normalizedName = trimmedName.toLowerCase();
        const nameExists = prev.players.some(
          (p) => p.name.toLowerCase().trim() === normalizedName
        );

        if (nameExists) {
          toast.error(`A player named "${trimmedName}" already exists`);
          return prev;
        }

        const newPlayer = {
          name: trimmedName,
          letters: 0,
          isEliminated: false,
          isCreator: false,
          isLeader: false,
          score: 0,
        };

        const updatedPlayer: Player = {
          ...newPlayer,
          id: prev.players.length + 1, // Simple numeric ID
          name: newPlayer.name.trim(),
          score: newPlayer.score || 0,
          isEliminated: newPlayer.isEliminated || false,
          isLeader: prev.players.length === 0, // First player is leader
          isCreator: prev.players.length === 0, // First player is creator
          letters: newPlayer.letters || 0,
          inventory: {
            powerups: [shield, chooseTrick],
          },
        };

        const updatedState = {
          ...prev,
          players: [...prev.players, updatedPlayer],
        };

        if (prev.players.length === 0) {
          updatedState.currentPlayerId = updatedPlayer.id;
          updatedState.currentLeaderId = updatedPlayer.id;
        }

        return updatedState;
      });
    },
    [gameState.players]
  );

  const updatePlayerName = useCallback((id: number, name: string) => {
    setGameState((prev) => {
      const updatedPlayers = prev.players.map((p) =>
        p.id === id ? { ...p, name } : p
      );
      return {
        ...prev,
        players: updatedPlayers,
      };
    });
  }, []);

  const removePlayer = useCallback((id: number) => {
    setGameState((prev) => {
      const playerToRemove = prev.players.find((p) => p.id === id);

      if (playerToRemove?.isCreator) {
        toast.error("Cannot remove the game owner");
        return prev;
      }

      const updatedPlayers = prev.players.filter((p) => p.id !== id);
      return {
        ...prev,
        players: updatedPlayers,
        currentPlayerId: updatedPlayers[0]?.id || 0,
        currentLeaderId: updatedPlayers[0]?.id || 0,
      };
    });
  }, []);

  const handlePlayerRotate = useCallback(() => {
    if (gameState.status !== "active") return;

    const activePlayers = gameState.players.filter((p) => !p.isEliminated);
    if (activePlayers.length <= 1) return;

    const currentLeaderIndex = activePlayers.findIndex(
      (p) => p.id === gameState.currentLeaderId
    );
    if (currentLeaderIndex === -1) return;
    const nextLeaderIndex = (currentLeaderIndex + 1) % activePlayers.length;
    const nextLeader = activePlayers[nextLeaderIndex];

    setGameState((prev) => ({
      ...prev,
      currentLeaderId: nextLeader.id,
      players: prev.players.map((player) => ({
        ...player,
        isLeader: player.id === nextLeader.id,
      })),
      gameLog: [
        ...prev.gameLog,
        `🔄 Leadership passed to ${nextLeader.name} (${nextLeader.score} points, ${nextLeader.letters}/5 letters)`,
      ],
    }));

    return nextLeader;
  }, [gameState.status, gameState.players, gameState.currentLeaderId]);

  // Simplified rotation logic
  const rotateToNextLeader = useCallback(() => {
    const activePlayers = gameState.players.filter((p) => !p.isEliminated);
    if (activePlayers.length <= 1) return;

    const currentLeaderIndex = activePlayers.findIndex(
      (p) => p.id === gameState.currentLeaderId
    );
    if (currentLeaderIndex === -1) return;

    const nextLeaderIndex = (currentLeaderIndex + 1) % activePlayers.length;
    const nextLeader = activePlayers[nextLeaderIndex];

    setGameState((prev) => {
      const newPlayers = prev.players.map((player) => ({
        ...player,
        isLeader: player.id === nextLeader.id,
      }));

      return {
        ...prev,
        currentLeaderId: nextLeader.id,
        currentPlayerId: nextLeader.id, // Make next leader the current player
        players: newPlayers,
        leaderConsecutiveWins: 0, // Reset win counter
      };
    });
  }, [gameState.players, gameState.currentLeaderId]);

  // Simplified effect for handling turns
  useEffect(() => {
    if (gameState.status !== "active") return;

    const currentPlayer = gameState.players.find(
      (p) => p.id === gameState.currentPlayerId
    );
    if (!currentPlayer) return;

    // Check if we should rotate leadership (e.g., after 3 wins)
    const shouldRotate =
      gameState.leaderConsecutiveWins >= 3 &&
      currentPlayer.id === gameState.currentLeaderId;

    if (shouldRotate) {
      rotateToNextLeader();
    }
  }, [
    gameState.status,
    gameState.currentPlayerId,
    gameState.leaderConsecutiveWins,
    gameState.players,
    rotateToNextLeader,
  ]);

  const newGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: "lobby" as GameStatus,
      currentTrick: undefined,
      discardedTricks: [],
      round: 1,
      leaderConsecutiveWins: 0,
      gameLog: ["🔄 New game started - players remain in the lobby"],
      roundComplete: false,
      currentAttempts: {},
      winner: undefined,
      startTime: null,
      trickOptions: undefined,
      currentRoundTurns: 0,
      players: prev.players.map((player) => ({
        ...player,
        letters: 0,
        isEliminated: false,
        score: 0,
        inventory: {
          ...player.inventory,
          powerups: [], // Clear all power-ups
        },
      })),
    }));

    // Reinitialize the deck for the new game
    initializeDeck();
  }, [initializeDeck]);

  const reset = useCallback(() => {
    // Initialize deck and get the shuffled deck synchronously
    const shuffledDeck = initializeDeck();

    setGameState((prev) => {
      const resetPlayers = prev.players.map((player, index) => ({
        ...player,
        letters: 0,
        isEliminated: false,
        isLeader: index === 0,
        score: 0,
        inventory: {
          ...player.inventory,
          powerups: [...startingPowerups],
        },
      }));

      const resetState = {
        ...prev,
        status: "active" as GameStatus,
        players: resetPlayers,
        startTime: new Date(),
        currentPlayerId: resetPlayers[0]?.id || 0,
        currentLeaderId: resetPlayers[0]?.id || 0,
        currentTurnIndex: 0,
        currentTrick: shuffledDeck[0],
        discardedTricks: [],
        round: 1,
        leaderConsecutiveWins: 0,
        gameLog: ["🔄 Game reset - all players and scores have been reset!"],
        roundComplete: false,
        currentAttempts: {},
      };

      setDeck(shuffledDeck.slice(1));

      return resetState;
    });
  }, [initializeDeck]);

  const [shufflePlayers, setShufflePlayers] = useState(false);

  const toggleShufflePlayers = useCallback(() => {
    setShufflePlayers((prev) => !prev);
  }, []);

  const handlePlayerAction = (
    action: "landed" | "missed" | "use_shield" | "use_choose_trick",
    selectedTrick?: TrickCard
  ) => {
    if (action === "use_choose_trick") {
      setGameState((prev) => {
        const currentPlayer = prev.players.find(
          (p: Player) => p.id === prev.currentPlayerId
        );
        if (!currentPlayer) return prev;

        const chooseTrickCard = currentPlayer.inventory.powerups.find(
          (card: Powerup) => card.type === "choose_trick"
        );
        if (!chooseTrickCard) return prev;

        if (selectedTrick) {
          const updatedDeck = deck.filter(
            (card) => card.id !== selectedTrick.id
          );
          setDeck(updatedDeck);

          return {
            ...prev,
            currentTrick: selectedTrick,
            players: prev.players.map((p) =>
              p.id === prev.currentPlayerId
                ? {
                    ...p,
                    inventory: {
                      ...p.inventory,
                      powerups: p.inventory.powerups.filter(
                        (card) => card.id !== chooseTrickCard.id
                      ),
                    },
                  }
                : p
            ),
            gameLog: [
              ...prev.gameLog,
              `🃏 ${currentPlayer.name} used Trick Selector to change to: ${selectedTrick.name}`,
            ],
          };
        }

        // If no trick was selected yet, just set up the trick options
        const nextThreeTricks = deck.slice(0, 3);
        return {
          ...prev,
          trickOptions: nextThreeTricks,
        };
      });
      return;
    }

    if (action === "use_shield") {
      setGameState((prev) => {
        const currentPlayer = prev.players.find(
          (p) => p.id === prev.currentPlayerId
        );
        if (!currentPlayer) return prev;

        const shieldCard = currentPlayer.inventory.powerups.find(
          (card: Powerup) => card.type === "shield"
        );
        if (!shieldCard) return prev;

        const updatedState = shieldCard.onUse(
          {
            ...prev,
            players: prev.players.map((p) =>
              p.id === prev.currentPlayerId
                ? {
                    ...p,
                    // remove shield card from inventory
                    inventory: {
                      ...p.inventory,
                      powerups: p.inventory.powerups.filter(
                        (c: Powerup) => c.id !== shieldCard.id
                      ),
                    },
                  }
                : p
            ),
          },
          prev.currentPlayerId
        );

        const activePlayersList = updatedState.players.filter(
          (p) => !p.isEliminated
        );
        const currentPlayerIdx = activePlayersList.findIndex(
          (p) => p.id === prev.currentPlayerId
        );

        const newTrick = deck[0];
        const updatedDeck = deck.slice(1);
        setDeck(updatedDeck);

        // Calculate next player
        const nextPlayerIdx = (currentPlayerIdx + 1) % activePlayersList.length;
        const nextPlayerId = activePlayersList[nextPlayerIdx].id;

        return {
          ...updatedState,
          currentPlayerId: nextPlayerId,
          currentTrick: newTrick,
          currentRoundTurns:
            (prev.currentRoundTurns + 1) % activePlayersList.length,
          gameLog: [
            ...updatedState.gameLog,
            `🛡️ ${currentPlayer?.name} used a Shield!`,
            `🔄 New trick: ${newTrick.name}`,
            `👤 ${activePlayersList[nextPlayerIdx].name}'s turn`,
          ],
        };
      });
      return;
    }
    const activePlayers = gameState.players.filter((p) => !p.isEliminated);
    if (activePlayers.length === 0) return;

    const currentPlayer = activePlayers.find(
      (p) => p.id === gameState.currentPlayerId
    );
    if (!currentPlayer) return;

    const currentIndex = activePlayers.findIndex(
      (p) => p.id === gameState.currentPlayerId
    );
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    const nextPlayer = activePlayers[nextIndex];

    if (action === "missed") {
      const currentLetters = currentPlayer.letters || 0;
      const newLetters = currentLetters + 1;
      const isEliminated = newLetters >= 5; // G.R.I.N.D = 5 letters

      const activePlayersBeforeMiss = gameState.players.filter(
        (p) => !p.isEliminated
      );
      const willBeOnlyOnePlayer =
        activePlayersBeforeMiss.length === 2 && isEliminated;

      if (willBeOnlyOnePlayer) {
        const updatedPlayers = gameState.players.map((p) =>
          p.id === currentPlayer.id ? { ...p, letters: newLetters } : p
        );

        const winner = updatedPlayers.find((p) => p.letters < 5);

        if (winner) {
          setGameState((prev) => ({
            ...prev,
            status: "ended" as GameStatus,
            winner: winner, // Store the winner in game state
            players: updatedPlayers,
            gameLog: [
              ...prev.gameLog,
              `🏆 GAME OVER! ${winner.name} wins with ${winner.score} points and only ${winner.letters}/5 letters!`,
              `🎉 Congratulations to ${winner.name} for winning the game!`,
              `🏁 Final score: ${winner.score} points`,
            ],
          }));
          return; // Exit early, don't continue with normal miss logic
        }
      }

      const shouldRotateOnMiss = gameState.currentLeaderId === currentPlayer.id;
      const activePlayers = gameState.players.filter((p) => !p.isEliminated);
      const currentRoundTurns = gameState.currentRoundTurns + 1;
      const isEndOfRound = currentRoundTurns >= activePlayers.length;
      const newRound = isEndOfRound ? gameState.round + 1 : gameState.round;

      // Get a new trick if:
      // 1. The leader misses their own trick, OR
      // 2. We're at the end of the round
      const shouldGetNewTrick = shouldRotateOnMiss || isEndOfRound;

      let newTrick = gameState.currentTrick;
      if (shouldGetNewTrick) {
        newTrick = drawCard() || gameState.currentTrick;
        if (!newTrick) {
          const newDeck = initializeDeck();
          newTrick = newDeck[0];
          setDeck(newDeck.slice(1));
        }
      }

      // Reset round turns if we're starting a new round
      const newRoundTurns = isEndOfRound ? 0 : currentRoundTurns;

      const updatedPlayers = gameState.players.map((p) =>
        p.id === currentPlayer.id
          ? { ...p, letters: newLetters, isEliminated }
          : p
      );

      // Check for a random power-up
      chanceGrantPowerUp(nextPlayer.id);

      setGameState((prev) => ({
        ...prev,
        players: updatedPlayers,
        discardedTricks:
          shouldGetNewTrick && prev.currentTrick
            ? [...prev.discardedTricks, prev.currentTrick]
            : prev.discardedTricks,
        currentTrick: newTrick || prev.currentTrick,
        currentPlayerId: nextPlayer.id,
        currentTurnIndex: nextIndex,
        round: newRound,
        currentRoundTurns: newRoundTurns,
        leaderConsecutiveWins: shouldRotateOnMiss
          ? 0 // Reset consecutive wins only when leader misses
          : prev.leaderConsecutiveWins, // Keep the current streak otherwise
        gameLog: [
          ...prev.gameLog,
          `❌ ${currentPlayer.name} missed the ${
            prev.currentTrick?.name || "trick"
          } and received letter "${"SKATE".charAt(
            currentLetters
          )}" (${newLetters}/5)${
            isEliminated
              ? ` - ${currentPlayer.name} is ELIMINATED with a score of ${currentPlayer.score}! 👋`
              : ""
          }`,
        ],
      }));

      if (shouldRotateOnMiss) {
        const nextLeader = handlePlayerRotate();
        if (nextLeader) {
          setGameState((prev) => ({
            ...prev,
            currentPlayerId: nextLeader.id,
            gameLog: [
              ...prev.gameLog,
              `🔄 Leadership passed to ${nextLeader.name} because ${
                currentPlayer.name
              } couldn't set the ${
                gameState.currentTrick?.name || "trick"
              }. New leader has ${nextLeader.score} points.`,
            ],
          }));
        }
      }
    } else if (action === "landed") {
      const currentRoundTurns = gameState.currentRoundTurns + 1;

      const activePlayers = gameState.players.filter((p) => !p.isEliminated);
      const isEndOfRound = currentRoundTurns >= activePlayers.length;

      const newRound = isEndOfRound ? gameState.round + 1 : gameState.round;

      const shouldGetNewTrick =
        isEndOfRound ||
        (gameState.currentLeaderId === currentPlayer.id &&
          gameState.leaderConsecutiveWins >= 3);

      let newTrick = gameState.currentTrick;

      if (shouldGetNewTrick) {
        newTrick = drawCard() || gameState.currentTrick;

        if (!newTrick) {
          const newDeck = initializeDeck();
          newTrick = newDeck[0];
          setDeck(newDeck.slice(1));
        }
      }

      chanceGrantPowerUp(nextPlayer.id);

      setGameState((prev) => {
        const updatedState = {
          ...prev,
          currentPlayerId: nextPlayer.id,
          currentTurnIndex: nextIndex,
          players: prev.players.map((p) =>
            p.id === currentPlayer.id
              ? { ...p, score: p.score + (gameState.currentTrick?.points || 0) }
              : p
          ),
          round: newRound,
          currentRoundTurns: isEndOfRound ? 0 : currentRoundTurns,
          currentTrick: newTrick,
          leaderConsecutiveWins:
            gameState.currentLeaderId === currentPlayer.id
              ? gameState.leaderConsecutiveWins + 1
              : gameState.leaderConsecutiveWins,
        };

        return updatedState;
      });
    }
  };

  const reorderPlayers = (activeId: number, overId: number) => {
    setGameState((prev) => {
      const oldIndex = prev.players.findIndex((p) => p.id === activeId);
      const newIndex = prev.players.findIndex((p) => p.id === overId);

      const newPlayers = [...prev.players];
      const [movedPlayer] = newPlayers.splice(oldIndex, 1);
      newPlayers.splice(newIndex, 0, movedPlayer);

      return {
        ...prev,
        players: newPlayers,
      };
    });
  };

  const handleTrickSelection = (trick: TrickCard) => {
    setGameState((prev) => {
      if (!prev.trickOptions) return prev;

      // Update player's inventory to remove the used choose_trick card
      const updatedPlayers = prev.players.map((p) =>
        p.id === prev.currentPlayerId
          ? {
              ...p,
              inventory: {
                ...p.inventory,
                powerups: p.inventory.powerups.filter(
                  (card) => card.type !== "choose_trick"
                ),
              },
            }
          : p
      );

      return {
        ...prev,
        currentTrick: trick,
        trickOptions: undefined, // Clear the trick options
        players: updatedPlayers,
        gameLog: [
          ...prev.gameLog,
          `🎲 ${
            prev.players.find((p) => p.id === prev.currentPlayerId)?.name
          } used Choose Trick and selected: ${trick.name}`,
        ],
      };
    });
  };

  const getDeckStatus = () => {
    const remaining = deck.length;
    const total = gameState.totalDeckSize;
    return {
      remaining,
      total,
    };
  };

  const updateShieldChance = useCallback((chance: number) => {
    setGameState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        shieldChance: Math.min(1, Math.max(0, chance)), // Clamp between 0 and 1
      },
    }));
  }, []);

  // Check if current player should receive a random power-up at start of turn
  const chanceGrantPowerUp = useCallback((playerId: number) => {
    setGameState((prev) => {
      const player = prev.players.find((p) => p.id === playerId);
      if (!player) return prev;

      // Find the maximum number of letters any player has
      const maxLetters = Math.max(...prev.players.map((p) => p.letters));
      const playersWithMostLetters = prev.players.filter(
        (p) => p.letters === maxLetters
      );

      // Only proceed if player is among those with most letters
      if (!playersWithMostLetters.some((p) => p.id === playerId)) {
        return prev;
      }

      // Check if we should grant a power-up based on the single power-up chance
      if (Math.random() >= prev.settings.powerUpChance) {
        return prev;
      }

      const randomCard = Math.random() < 0.5 ? shield : chooseTrick;

      return {
        ...prev,
        players: prev.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                inventory: {
                  ...p.inventory,
                  powerups: [...p.inventory.powerups, randomCard],
                },
              }
            : p
        ),
        newPowerUp: { playerId, card: randomCard },
        gameLog: [
          ...prev.gameLog,
          `🛡️ ${player.name} received a ${randomCard.name} card!`,
        ],
      };
    });
  }, []);

  const updateChooseTrickChance = useCallback((chance: number) => {
    setGameState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        choose_trick_chance: Math.min(1, Math.max(0, chance)), // Clamp between 0 and 1
      },
    }));
  }, []);

  const startGame = useCallback(
    (players: Player[], shouldShuffle: boolean = false) => {
      if (players.length < 2) {
        toast.error("Need at least 2 players to start the game");
        return;
      }

      const playersToUse = shouldShuffle
        ? shuffleArray([...players])
        : [...players];

      const shuffledDeck = initializeDeck();

      setGameState((prev) => {
        const newState = {
          ...prev,
          status: "active" as GameStatus,
          players: playersToUse,
          startTime: new Date(),
          currentLeaderId: playersToUse[0]?.id ?? 0,
          currentPlayerId: playersToUse[0]?.id ?? 0,
          currentTurnIndex: 0,
          currentTrick: shuffledDeck[0],
          discardedTricks: [],
          round: 1,
          leaderConsecutiveWins: 0,
          gameLog: [
            `🎮 Game started with ${
              playersToUse.length
            } players! First player is ${playersToUse[0]?.name || "unknown"}.`,
            shouldShuffle ? "🔀 Players were shuffled randomly!" : "",
          ].filter(Boolean),
          roundComplete: false,
          currentAttempts: {},
        };

        setDeck(shuffledDeck.slice(1));

        for (const player of playersToUse) {
          chanceGrantPowerUp(player.id);
        }

        return newState;
      });
    },
    [initializeDeck, chanceGrantPowerUp]
  );
  return {
    gameState,
    setGameState,
    addPlayer,
    removePlayer,
    startGame: (players: Player[]) => startGame(players, shufflePlayers),
    handlePlayerAction,
    handleTrickSelection,
    getDeckStatus,
    reset,
    newGame,
    peekNextCards,
    isClerkUserLoaded,
    clerkUser,
    shufflePlayers,
    toggleShufflePlayers,

    reorderPlayers,
    updateShieldChance,
    updateChooseTrickChance,
    chanceGrantPowerUp,
    updatePowerUpChance,
    updatePlayerName,
  } as const;
};

export default useGame;
