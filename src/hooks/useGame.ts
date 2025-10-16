"use client";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import useUser from "./useUser";
import { TrickCard, trickCards } from "@/types/tricks";
import { GameState, GameStatus } from "@/types/game";
import { toast } from "sonner";
import { shuffleArray } from "@/lib/utils";
import { chooseTrick, Powerup, shield } from "../types/powerups";
import { startingPowerups } from "../types/powerups";
import { Player } from "@/types/player";
import { getRandomTip } from "@/types/tips";

// Game constants
const MAX_LETTERS = 5; // S.K.A.T.E
const TIP_INTERVAL_SECONDS = 60; // Show tips every 60 seconds
const MAX_PLAYERS = 16;
const MIN_PLAYER_NAME_LENGTH = 2;
const MAX_PLAYER_NAME_LENGTH = 20;
const LEADER_WIN_THRESHOLD = 3;
const SHIELD_CHANCE = 0.5; // 50% chance for shield when granting powerup

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

  const reshuffleDeckIfNeeded = useCallback(() => {
    if (deck.length === 0) return [];
    const reshuffled = shuffleArray([...deck]);
    setDeck(reshuffled);
    return reshuffled;
  }, [deck]);

  const peekNextCards = useCallback(
    (count: number): TrickCard[] => {
      if (deck.length === 0) {
        const reshuffled = reshuffleDeckIfNeeded();
        return reshuffled.slice(0, Math.min(count, reshuffled.length));
      }
      setDeck((prev) => prev.slice(count));
      return deck.slice(0, Math.min(count, deck.length));
    },
    [deck, reshuffleDeckIfNeeded]
  );

  const drawCard = useCallback(() => {
    if (deck.length === 0) {
      const reshuffled = reshuffleDeckIfNeeded();
      if (reshuffled.length === 0) {
        return null;
      }
      const drawnCard = reshuffled[0];
      setDeck(reshuffled.slice(1));
      return drawnCard;
    }
    const drawnCard = deck[0];
    setDeck((prevDeck) => prevDeck.slice(1));
    return drawnCard;
  }, [deck, reshuffleDeckIfNeeded]);

  const [gameState, setGameState] = useState<GameState>({
    endTime: null,
    players: [],
    status: "lobby",
    currentLeaderId: 0,
    currentPlayerId: 0,
    currentTurnIndex: 0,
    currentTrick: undefined,
    discardedTricks: [],
    totalRounds: 1,
    leaderConsecutiveWins: 0,
    gameLog: [],
    startTime: null,
    currentAttempts: {},
    totalDeckSize: 0,
    currentRoundTurns: 0,
    equipmentMalfunction: false,
    settings: {
      powerUpChance: 0.05,
    },
  });

  // Tip system state
  const [currentTip, setCurrentTip] = useState<string>("");
  const [showTip, setShowTip] = useState<boolean>(false);
  const tipTimerRef = useRef<NodeJS.Timeout | null>(null);

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
            clerkId: clerkUser.clerkId,
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

  // Tip system - show tips every 60 seconds
  useEffect(() => {
    if (gameState.status === "active") {
      tipTimerRef.current = setInterval(() => {
        setCurrentTip(getRandomTip());
        setShowTip(true);
      }, TIP_INTERVAL_SECONDS * 1000);
    }

    return () => {
      if (tipTimerRef.current) {
        clearInterval(tipTimerRef.current);
      }
    };
  }, [gameState.status]);

  const dismissTip = useCallback(() => {
    setShowTip(false);
    setCurrentTip("");
  }, []);

  const addPlayerToGame = useCallback(
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

      if (trimmedName.length < MIN_PLAYER_NAME_LENGTH) {
        toast.error("Player name must be at least 2 characters");
        return;
      }
      if (trimmedName.length > MAX_PLAYER_NAME_LENGTH) {
        toast.error("Player name cannot exceed 20 characters");
        return;
      }

      if (gameState.players.length >= MAX_PLAYERS) {
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
      gameState.leaderConsecutiveWins >= LEADER_WIN_THRESHOLD &&
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

  const handleUseChooseTrick = useCallback(
    (selectedTrick?: TrickCard) => {
      // Get current state values before any updates
      const currentGameState = gameState;
      const currentDeck = deck;

      const currentPlayer = currentGameState.players.find(
        (p: Player) => p.id === currentGameState.currentPlayerId
      );
      if (!currentPlayer) return;

      const chooseTrickCard = currentPlayer.inventory.powerups.find(
        (card: Powerup) => card.type === "choose_trick"
      );
      if (!chooseTrickCard) return;

      if (selectedTrick) {
        // Remove selected trick from deck
        const updatedDeck = currentDeck.filter(
          (card) => card.id !== selectedTrick.id
        );

        // Update state first
        setGameState({
          ...currentGameState,
          currentTrick: selectedTrick,
          players: currentGameState.players.map((p) =>
            p.id === currentGameState.currentPlayerId
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
            ...currentGameState.gameLog,
            `🃏 ${currentPlayer.name} used Trick Selector to change to: ${selectedTrick.name}`,
          ],
        });

        // Update deck after state update
        setDeck(updatedDeck);
        return;
      }

      // If no trick was selected yet, just set up the trick options
      const nextThreeTricks = currentDeck.slice(0, 3);
      setGameState({
        ...currentGameState,
        trickOptions: nextThreeTricks,
      });
    },
    [gameState, deck]
  );

  const handleUseShield = useCallback(() => {
    // Get current state values before any updates
    const currentGameState = gameState;
    const currentDeck = deck;

    const currentPlayer = currentGameState.players.find(
      (p) => p.id === currentGameState.currentPlayerId
    );
    if (!currentPlayer) return;

    const shieldCard = currentPlayer.inventory.powerups.find(
      (card: Powerup) => card.type === "shield"
    );
    if (!shieldCard) return;
    const updatedState = shieldCard.onUse(
      {
        ...currentGameState,
        players: currentGameState.players.map((p) =>
          p.id === currentGameState.currentPlayerId
            ? {
                ...p,
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
      currentGameState.currentPlayerId
    );

    const activePlayersList = updatedState.players.filter(
      (p) => !p.isEliminated
    );
    const currentPlayerIdx = activePlayersList.findIndex(
      (p) => p.id === currentGameState.currentPlayerId
    );

    // Get new trick from current deck
    const newTrick = currentDeck[0];
    const updatedDeck = currentDeck.slice(1);

    // Calculate next player
    const nextPlayerIdx = (currentPlayerIdx + 1) % activePlayersList.length;
    const nextPlayerId = activePlayersList[nextPlayerIdx].id;

    // Update state first
    setGameState({
      ...updatedState,
      currentPlayerId: nextPlayerId,
      currentTrick: newTrick,
      currentRoundTurns:
        (currentGameState.currentRoundTurns + 1) % activePlayersList.length,
      gameLog: [
        ...updatedState.gameLog,
        `🛡️ ${currentPlayer?.name} used a Shield!`,
        `🔄 New trick: ${newTrick.name}`,
        `👤 ${activePlayersList[nextPlayerIdx].name}'s turn`,
      ],
    });

    // Update deck after state update
    setDeck(updatedDeck);
  }, [gameState, deck]);

  // Grant random powerup chance at start of turn
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

      const randomCard = Math.random() < SHIELD_CHANCE ? shield : chooseTrick;

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

  const handleMissedAction = useCallback(() => {
    // Get current state values before any updates
    const currentGameState = gameState;

    const currentPlayer = currentGameState.players
      .filter((p) => !p.isEliminated)
      .find((p) => p.id === currentGameState.currentPlayerId);

    if (!currentPlayer) return;

    const currentLetters = currentPlayer.letters || 0;
    const newLetters = currentLetters + 1;
    const isEliminated = newLetters >= MAX_LETTERS; // G.R.I.N.D = 5 letters

    const activePlayersBeforeMiss = currentGameState.players.filter(
      (p) => !p.isEliminated
    );
    const willBeOnlyOnePlayer =
      activePlayersBeforeMiss.length === 2 && isEliminated;

    // Handle early game end case
    if (willBeOnlyOnePlayer) {
      const updatedPlayers = currentGameState.players.map((p) =>
        p.id === currentPlayer.id ? { ...p, letters: newLetters } : p
      );

      const winner = updatedPlayers.find((p) => p.letters < 5);

      if (winner) {
        setGameState({
          ...currentGameState,
          status: "ended" as GameStatus,
          winner: winner, // Store the winner in game state
          players: updatedPlayers,
          gameLog: [
            ...currentGameState.gameLog,
            `🏆 GAME OVER! ${winner.name} wins with ${winner.score} points and only ${winner.letters}/5 letters!`,
            `🎉 Congratulations to ${winner.name} for winning the game!`,
            `🏁 Final score: ${winner.score} points`,
          ],
        });
        return; // Exit early, don't continue with normal miss logic
      }
    }

    const shouldRotateOnMiss =
      currentGameState.currentLeaderId === currentPlayer.id;
    const activePlayers = currentGameState.players.filter(
      (p) => !p.isEliminated
    );
    const currentRoundTurns = currentGameState.currentRoundTurns + 1;
    const isEndOfRound = currentRoundTurns >= activePlayers.length;
    const newRound = isEndOfRound
      ? currentGameState.totalRounds + 1
      : currentGameState.totalRounds;

    // Get a new trick if:
    // 1. The leader misses their own trick, OR
    // 2. We're at the end of the round
    const shouldGetNewTrick = shouldRotateOnMiss || isEndOfRound;

    let newTrick = currentGameState.currentTrick;
    if (shouldGetNewTrick) {
      newTrick = drawCard() || currentGameState.currentTrick;

      if (!newTrick) {
        const newDeck = initializeDeck();
        newTrick = newDeck[0];
        setDeck(newDeck.slice(1));
      }
    }

    // Reset round turns if we're starting a new round
    const newRoundTurns = isEndOfRound ? 0 : currentRoundTurns;

    const updatedPlayers = currentGameState.players.map((p) =>
      p.id === currentPlayer.id
        ? { ...p, letters: newLetters, isEliminated }
        : p
    );

    // Check for a random power-up
    const currentIndex = activePlayers.findIndex(
      (p) => p.id === currentGameState.currentPlayerId
    );
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    const nextPlayer = activePlayers[nextIndex];

    const malfunctionChance = Math.random() < 0.05;

    // Prepare all state updates
    const newGameState = {
      ...currentGameState,
      players: updatedPlayers,
      discardedTricks:
        shouldGetNewTrick && currentGameState.currentTrick
          ? [...currentGameState.discardedTricks, currentGameState.currentTrick]
          : currentGameState.discardedTricks,
      currentTrick: newTrick || currentGameState.currentTrick,
      currentPlayerId: nextPlayer.id,
      currentTurnIndex: nextIndex,
      totalRounds: newRound,
      currentRoundTurns: newRoundTurns,
      leaderConsecutiveWins: shouldRotateOnMiss
        ? 0 // Reset consecutive wins only when leader misses
        : currentGameState.leaderConsecutiveWins, // Keep the current streak otherwise
      equipmentMalfunction: malfunctionChance,
      gameLog: [
        ...currentGameState.gameLog,
        `❌ ${currentPlayer.name} missed the ${
          currentGameState.currentTrick?.name || "trick"
        } and received letter "${"SKATE".charAt(
          currentLetters
        )}" (${newLetters}/5)${
          isEliminated
            ? ` - ${currentPlayer.name} is ELIMINATED with a score of ${currentPlayer.score}! 👋`
            : ""
        }`,
        ...(malfunctionChance
          ? [
              `⚠️ Equipment malfunction! Skill cards are disabled for this turn.`,
            ]
          : []),
      ],
    };

    // Update state first
    setGameState(newGameState);

    // Perform side effects after state update
    chanceGrantPowerUp(nextPlayer.id);

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
              currentGameState.currentTrick?.name || "trick"
            }. New leader has ${nextLeader.score} points.`,
          ],
        }));
      }
    }
  }, [
    gameState,
    deck,
    drawCard,
    initializeDeck,
    chanceGrantPowerUp,
    handlePlayerRotate,
  ]);

  const handleLandedAction = useCallback(() => {
    // Get current state values before any updates
    const currentGameState = gameState;

    const currentRoundTurns = currentGameState.currentRoundTurns + 1;

    const activePlayers = currentGameState.players.filter(
      (p) => !p.isEliminated
    );
    const isEndOfRound = currentRoundTurns >= activePlayers.length;

    const roundsCount = isEndOfRound
      ? currentGameState.totalRounds + 1
      : currentGameState.totalRounds;

    const shouldGetNewTrick =
      isEndOfRound ||
      (currentGameState.currentLeaderId === currentGameState.currentPlayerId &&
        currentGameState.leaderConsecutiveWins >= LEADER_WIN_THRESHOLD);

    let newTrick = currentGameState.currentTrick;

    if (shouldGetNewTrick) {
      newTrick = drawCard() || currentGameState.currentTrick;

      if (!newTrick) {
        const newDeck = initializeDeck();
        newTrick = newDeck[0];
        setDeck(newDeck.slice(1));
      }
    }

    const currentIndex = activePlayers.findIndex(
      (p) => p.id === currentGameState.currentPlayerId
    );
    const nextPlayerIndex = (currentIndex + 1) % activePlayers.length;
    const nextPlayer = activePlayers[nextPlayerIndex];

    const maxLettersAmongPlayers = Math.max(
      ...currentGameState.players.map((p) => p.letters)
    );
    const playersNotWithMostLetters = currentGameState.players.filter(
      (p) => p.letters < maxLettersAmongPlayers
    );
    const isCurrentPlayerEligibleForMalfunction =
      playersNotWithMostLetters.some(
        (p) => p.id === currentGameState.currentPlayerId
      );

    // players with the most letters have a 20% chance of not being able to use any powerups while all other players have a 5% chance
    const malfunctionTriggerChance = isCurrentPlayerEligibleForMalfunction
      ? Math.random() < 0.05
      : Math.random() < 0.2;

    // Prepare all state updates
    const newGameState = {
      ...currentGameState,
      currentPlayerId: nextPlayer.id,
      currentTurnIndex: nextPlayerIndex,
      players: currentGameState.players.map((p) =>
        p.id === currentGameState.currentPlayerId
          ? {
              ...p,
              score: p.score + (currentGameState.currentTrick?.points || 0),
            }
          : p
      ),
      totalRounds: roundsCount,
      currentRoundTurns: isEndOfRound ? 0 : currentRoundTurns,
      currentTrick: newTrick,
      leaderConsecutiveWins:
        currentGameState.currentLeaderId === currentGameState.currentPlayerId
          ? currentGameState.leaderConsecutiveWins + 1
          : currentGameState.leaderConsecutiveWins,
      equipmentMalfunction: malfunctionTriggerChance,
      gameLog: [
        ...currentGameState.gameLog,
        `🎉 ${
          currentGameState.players.find(
            (p) => p.id === currentGameState.currentPlayerId
          )?.name
        } landed the ${
          currentGameState.currentTrick?.name || "trick"
        } and earned ${currentGameState.currentTrick?.points || 0} points!`,
        ...(malfunctionTriggerChance
          ? [
              `⚠️ Equipment malfunction! Skill cards are disabled for this turn.`,
            ]
          : []),
      ],
    };

    // Update state first
    setGameState(newGameState);

    // Perform side effects after state update
    chanceGrantPowerUp(nextPlayer.id);
  }, [gameState, deck, drawCard, initializeDeck, chanceGrantPowerUp]);

  const handlePlayerAction = (
    action: "landed" | "missed" | "use_shield" | "use_choose_trick",
    selectedTrick?: TrickCard
  ) => {
    if (action === "use_choose_trick") {
      handleUseChooseTrick(selectedTrick);
      return;
    }

    if (action === "use_shield") {
      handleUseShield();
      return;
    }

    if (action === "missed") {
      handleMissedAction();
      return;
    }

    if (action === "landed") {
      handleLandedAction();
      return;
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
    addPlayerToGame,
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
    // Tip system
    currentTip,
    showTip,
    dismissTip,
  } as const;
};

export default useGame;
