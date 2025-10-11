"use client";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import useUser from "./useUser";
import { TrickCard, trickCards } from "@/types/tricks";
import {
  GameState,
  Player,
  GameStatus,
  SkillCard,
  SkillCardType,
} from "@/types/game";
import { toast } from "sonner";

// Re-export TrickCard type for convenience
export type { TrickCard };

const shieldCard: SkillCard = {
  id: "shield",
  type: "shield",
  name: "Shield",
  description: "Protect yourself from getting a letter on your next miss",
  onUse: (gameState: GameState, playerId: number) => {
    return {
      ...gameState,
      players: gameState.players.map((p) =>
        p.id === playerId
          ? {
              ...p,
              inventory: {
                ...p.inventory,
                skillCards: p.inventory.skillCards.map((c) =>
                  c.id === "shield" ? { ...c, id: `${c.id}-${Date.now()}` } : c
                ),
              },
            }
          : p
      ),
      gameLog: [
        ...gameState.gameLog,
        `🛡️ ${
          gameState.players.find((p) => p.id === playerId)?.name
        } activated a Shield!`,
      ],
    };
  },
};

const chooseTrickCard: SkillCard = {
  id: "choose_trick",
  type: "choose_trick",
  name: "Trick Selector",
  description: "Choose 1 of the next 3 cards in the deck",
  onUse: (
    gameState: GameState,
    playerId: number,
    selectedTrick?: TrickCard
  ) => {
    // If a trick was already selected in the UI, use it
    if (selectedTrick) {
      return {
        ...gameState,
        currentTrick: selectedTrick,
        gameLog: [
          ...gameState.gameLog,
          `🎲 ${
            gameState.players.find((p) => p.id === playerId)?.name
          } selected a new trick!`,
        ],
        // Clear the trick options after selection
        trickOptions: undefined,
      };
    }

    // Otherwise, generate 3 random tricks that aren't the current trick
    const availableTricks = trickCards.filter(
      (trick) => trick.id !== gameState.currentTrick?.id
    );

    // Shuffle and pick 3 unique tricks
    const shuffled = shuffleArray([...availableTricks]);
    const trickOptions = shuffled.slice(0, 3);

    // Set the current selected trick to the second option by default
    const newTrick = trickOptions[0];

    return {
      ...gameState,
      currentTrick: newTrick,
      trickOptions,
      gameLog: [
        ...gameState.gameLog,
        `🎲 ${
          gameState.players.find((p) => p.id === playerId)?.name
        } used Trick Selector!`,
      ],
    };
  },
};

// Fisher-Yates shuffle algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const useGame = () => {
  const { clerkUser, isLoaded } = useUser();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Deck state
  const [deck, setDeck] = useState<TrickCard[]>([]);
  const [drawnCards, setDrawnCards] = useState<TrickCard[]>([]);

  // Rate limiting for player additions
  const lastPlayerAddition = useRef<number>(0);
  const PLAYER_ADDITION_COOLDOWN = 1000; // 1 second cooldown

  // Initialize and shuffle the deck
  const initializeDeck = useCallback(() => {
    console.log("🎲 Initializing deck...");
    const shuffledDeck = shuffleArray([...trickCards]);
    console.log("📋 Shuffled deck created, length:", shuffledDeck.length);

    // Set the total deck size for tracking remaining cards
    setGameState((prev) => ({
      ...prev,
      totalDeckSize: shuffledDeck.length,
    }));

    setDeck(shuffledDeck);
    setDrawnCards([]);
    return shuffledDeck;
  }, []);

  // Peek at the next few cards in the deck without removing them
  const peekNextCards = useCallback(
    (count: number): TrickCard[] => {
      if (deck.length === 0) {
        console.log("🔄 Reshuffling deck...");
        // If deck is empty but we have drawn cards, reshuffle them
        if (drawnCards.length > 0) {
          const reshuffled = shuffleArray([...drawnCards]);
          setDeck(reshuffled);
          setDrawnCards([]);
          return reshuffled.slice(0, Math.min(count, reshuffled.length));
        }
        console.log("🚨 No cards left in deck!");
        return [];
      }
      setDeck((prev) => prev.slice(count));
      setDrawnCards((prev) => [...prev, ...deck.slice(0, count)]);
      return deck.slice(0, Math.min(count, deck.length));
    },
    [deck, drawnCards]
  );

  // Draw a card from the deck
  const drawCard = useCallback(() => {
    if (deck.length === 0) {
      console.log("🔄 Reshuffling deck for draw...");
      // If deck is empty but we have drawn cards, reshuffle them
      if (drawnCards.length > 0) {
        const reshuffled = shuffleArray([...drawnCards]);
        setDeck(reshuffled);
        setDrawnCards([]);

        if (reshuffled.length === 0) {
          console.log("🚨 No cards available to draw!");
          return null;
        }

        const drawnCard = reshuffled[0];
        setDeck(reshuffled.slice(1));
        setDrawnCards([drawnCard]);
        return drawnCard;
      }

      console.log("🚨 No cards left in deck!");
      return null;
    }

    const drawnCard = deck[0];
    console.log("🎴 Drew card:", drawnCard.name);

    // Update deck state (remove the drawn card)
    setDeck((prevDeck) => prevDeck.slice(1));

    // Add to drawn cards
    setDrawnCards((prevDrawn) => [...prevDrawn, drawnCard]);

    return drawnCard;
  }, [deck, drawnCards]);

  // Define available skill cards with useMemo to prevent unnecessary re-renders
  const skillCards = useMemo<SkillCard[]>(
    () => [
      {
        id: "shield",
        type: "shield",
        name: "Shield",
        description: "Protect yourself from getting a letter on your next miss",
        onUse: (gameState: GameState, playerId: number) => {
          return {
            ...gameState,
            players: gameState.players.map((p) =>
              p.id === playerId
                ? {
                    ...p,
                    inventory: {
                      ...p.inventory,
                      skillCards: p.inventory.skillCards.filter(
                        (c) => c.id !== "shield"
                      ),
                    },
                  }
                : p
            ),
            gameLog: [
              ...gameState.gameLog,
              `🛡️ ${
                gameState.players.find((p) => p.id === playerId)?.name
              } activated a Shield!`,
            ],
          };
        },
      },
      {
        id: "choose_trick",
        type: "choose_trick",
        name: "Trick Selector",
        description: "Choose your next trick from 3 random options",
        onUse: (
          gameState: GameState,
          playerId: number,
          selectedTrick?: TrickCard
        ) => {
          // If a trick was already selected in the UI, use it
          if (selectedTrick) {
            return {
              ...gameState,
              currentTrick: selectedTrick,
              gameLog: [
                ...gameState.gameLog,
                `🎲 ${
                  gameState.players.find((p) => p.id === playerId)?.name
                } selected a new trick!`,
              ],
              // Clear the trick options after selection
              trickOptions: undefined,
            };
          }

          // Otherwise, generate 3 random tricks that aren't the current trick
          const availableTricks = trickCards.filter(
            (trick) => trick.id !== gameState.currentTrick?.id
          );

          // Shuffle and pick 3 unique tricks
          const shuffled = shuffleArray([...availableTricks]);
          const trickOptions = shuffled.slice(0, 3);

          // Set the current trick to the first option by default
          const newTrick = trickOptions[0];

          return {
            ...gameState,
            currentTrick: newTrick,
            trickOptions,
            gameLog: [
              ...gameState.gameLog,
              `🎲 ${
                gameState.players.find((p) => p.id === playerId)?.name
              } used Trick Selector!`,
            ],
          };
        },
      },
    ],
    []
  ); // Empty dependency array since skillCards doesn't depend on any props or state

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
    roundComplete: false,
    currentAttempts: {},
    shouldRotateLeadershipAfterRound: false,
    totalDeckSize: 0,
    skillCardsInPlay: skillCards,
    currentTrickSetterId: null,
    currentRoundTurns: 0,
  });

  // Automatically add Clerk user as a player when they first load the page
  useEffect(() => {
    if (isLoaded && clerkUser && !hasInitialized) {
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
              skillCards: [
                { ...shieldCard, id: `shield-${Date.now()}` },
                { ...chooseTrickCard, id: `choose_trick-${Date.now()}` },
              ],
            },
          },
        ],
        skillCardsInPlay: [shieldCard, chooseTrickCard],
      }));

      setHasInitialized(true);
    }
  }, [clerkUser, isLoaded, hasInitialized]);

  // Add the skill card functions before they're used
  const useSkillCard = useCallback(
    (playerId: number, cardType: SkillCardType) => {
      setGameState((prev) => {
        const player = prev.players.find((p) => p.id === playerId);
        if (!player) return prev;

        const card = player.inventory.skillCards.find(
          (card) => card.type === cardType
        );
        if (!card) {
          toast.error("You don't have this skill card!");
          return prev;
        }

        // Remove the used card from player's inventory
        const updatedPlayers = prev.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                inventory: {
                  ...p.inventory,
                  skillCards: p.inventory.skillCards.filter(
                    (c) => c.id !== card.id
                  ),
                },
              }
            : p
        );

        // Apply the card's effect
        let newState = card.onUse(
          { ...prev, players: updatedPlayers },
          playerId
        );

        // After applying the card's effect, move to the next player if it's a shield
        if (cardType === "shield") {
          const activePlayers = newState.players.filter((p) => !p.isEliminated);
          const currentPlayerIndex = activePlayers.findIndex(
            (p) => p.id === playerId
          );
          if (currentPlayerIndex !== -1) {
            const nextPlayerIndex =
              (currentPlayerIndex + 1) % activePlayers.length;
            const nextPlayer = activePlayers[nextPlayerIndex];

            newState = {
              ...newState,
              currentPlayerId: nextPlayer.id,
              gameLog: [
                ...newState.gameLog,
                `🔄 Turn passed to ${nextPlayer.name}`,
              ],
            };
          }
        }

        return newState;
      });
    },
    []
  );

  const addSkillCardToPlayer = useCallback(
    (playerId: number, cardType: SkillCardType) => {
      const card = skillCards.find((c) => c.type === cardType);
      if (!card) return;

      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                inventory: {
                  ...p.inventory,
                  skillCards: [
                    ...p.inventory.skillCards,
                    { ...card, id: `${cardType}-${Date.now()}` },
                  ],
                },
              }
            : p
        ),
        gameLog: [
          ...prev.gameLog,
          `🎁 ${prev.players.find((p) => p.id === playerId)?.name} received a ${
            card.name
          } card!`,
        ],
      }));
    },
    [skillCards]
  );

  const addPlayer = useCallback(
    (name: string) => {
      // Rate limiting check
      const now = Date.now();
      if (now - lastPlayerAddition.current < PLAYER_ADDITION_COOLDOWN) {
        toast.error("Please wait before adding another player");
        return;
      }
      lastPlayerAddition.current = now;

      // Enhanced input validation and sanitization
      const trimmedName = name?.trim();

      if (!trimmedName) {
        toast.error("Player name cannot be empty");
        return;
      }

      // Validate name format - only allow alphanumeric, spaces, and common punctuation
      const nameRegex = /^[a-zA-Z0-9\s\-'\.]+$/;
      if (!nameRegex.test(trimmedName)) {
        toast.error("Player name contains invalid characters");
        return;
      }

      // Reasonable length limits
      if (trimmedName.length < 2) {
        toast.error("Player name must be at least 2 characters");
        return;
      }
      if (trimmedName.length > 20) {
        toast.error("Player name cannot exceed 20 characters");
        return;
      }

      // Don't add if we already have 16 players (including the creator)
      if (gameState.players.length >= 16) {
        toast.error("Maximum of 16 players allowed");
        return;
      }

      setGameState((prev) => {
        // Enhanced duplicate checking - case insensitive and trimmed
        const normalizedName = trimmedName.toLowerCase();
        const nameExists = prev.players.some(
          (p) => p.name.toLowerCase().trim() === normalizedName
        );

        if (nameExists) {
          toast.error(`A player named "${trimmedName}" already exists`);
          return prev;
        }

        // Check for suspiciously similar names (basic protection against near-duplicates)
        const similarNameExists = prev.players.some((p) => {
          const existingNormalized = p.name.toLowerCase().trim();
          // Check if names are very similar (levenshtein distance of 1-2)
          return (
            Math.abs(existingNormalized.length - normalizedName.length) <= 2 &&
            (existingNormalized.includes(normalizedName) ||
              normalizedName.includes(existingNormalized))
          );
        });

        if (similarNameExists) {
          toast.error(`A similar player name "${trimmedName}" already exists`);
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

        // Create a shield card for the new player using the existing shieldCard definition
        const shieldCard: SkillCard = {
          id: `shield-${Date.now()}-${prev.players.length + 1}`,
          type: "shield",
          name: "Shield",
          description:
            "Protect yourself from getting a letter on your next miss",
          onUse: (gameState: GameState, playerId: number) => {
            return {
              ...gameState,
              players: gameState.players.map((p) =>
                p.id === playerId
                  ? {
                      ...p,
                      inventory: {
                        ...p.inventory,
                        skillCards: p.inventory.skillCards.map((c) =>
                          c.id === "shield"
                            ? { ...c, id: `${c.id}-${Date.now()}` }
                            : c
                        ),
                      },
                    }
                  : p
              ),
              gameLog: [
                ...gameState.gameLog,
                `🛡️ ${
                  gameState.players.find((p) => p.id === playerId)?.name
                } activated a Shield!`,
              ],
            };
          },
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
            // Add both shield and trick selector cards to player's inventory
            skillCards: [
              shieldCard,
              {
                id: `choose_trick-${Date.now()}-${prev.players.length + 1}`,
                type: "choose_trick",
                name: "Choose Trick",
                description:
                  "Look at the next 3 tricks and choose one to attempt",
                onUse: (gameState, playerId, selectedTrick?: TrickCard) => {
                  const player = gameState.players.find(
                    (p) => p.id === playerId
                  );
                  if (!player) return gameState;

                  // If no trick is selected (shouldn't happen with proper UI flow)
                  if (!selectedTrick) {
                    return {
                      ...gameState,
                      message: `❌ No trick was selected.`,
                    };
                  }

                  // Create a new game state with the selected trick
                  const cardId = `choose_trick-${Date.now()}-${playerId}`;
                  const newState = {
                    ...gameState,
                    currentTrick: selectedTrick,
                    message: `🎲 ${player.name} used Choose Trick! New trick: ${selectedTrick.name}`,
                    // Remove the used card
                    players: gameState.players.map((p) =>
                      p.id === playerId
                        ? {
                            ...p,
                            inventory: {
                              ...p.inventory,
                              skillCards: p.inventory.skillCards.filter(
                                (card) =>
                                  !card.id.startsWith("choose_trick") ||
                                  card.id === cardId
                              ),
                            },
                          }
                        : p
                    ),
                  };

                  return newState;
                },
              },
            ],
          },
        };

        // If this is the first player, set them as the current player and leader
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

  const removePlayer = useCallback((id: number) => {
    setGameState((prev) => {
      // Find the player being removed
      const playerToRemove = prev.players.find((p) => p.id === id);

      // Prevent removal of the game creator
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

    // Find current leader's index in active players array
    const currentLeaderIndex = activePlayers.findIndex(
      (p) => p.id === gameState.currentLeaderId
    );
    if (currentLeaderIndex === -1) return; // Current leader not found in active players

    // Move to next player (wrap around to beginning if needed)
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

  // Auto-rotate leadership when conditions are met
  useEffect(() => {
    if (gameState.status !== "active") return;

    // Check if we should rotate leadership (leader has 3 wins and it's end of round)
    const activePlayers = gameState.players.filter((p) => !p.isEliminated);
    if (activePlayers.length <= 1) return;

    const currentPlayer = activePlayers.find(
      (p) => p.id === gameState.currentPlayerId
    );
    const isEndOfRound = currentPlayer?.id === gameState.currentLeaderId;

    if (gameState.shouldRotateLeadershipAfterRound && isEndOfRound) {
      const nextLeader = handlePlayerRotate();
      if (nextLeader) {
        setGameState((prev) => ({
          ...prev,
          currentPlayerId: nextLeader.id, // Update current player to new leader
          gameLog: [
            ...prev.gameLog,
            `👑 ${nextLeader.name} has earned the lead after ${prev.leaderConsecutiveWins} consecutive wins! (Score: ${nextLeader.score}, Letters: ${nextLeader.letters}/5)`,
          ],
          shouldRotateLeadershipAfterRound: false,
          leaderConsecutiveWins: 0,
        }));
      }
    }
  }, [
    gameState.status,
    gameState.currentPlayerId,
    gameState.currentLeaderId,
    gameState.shouldRotateLeadershipAfterRound,
    gameState.leaderConsecutiveWins,
    gameState.players,
    handlePlayerRotate,
  ]);

  const resetPlayers = useCallback(() => {
    console.log("🔄 Resetting game...");

    // Initialize deck and get the shuffled deck synchronously
    const shuffledDeck = initializeDeck();

    setGameState((prev) => {
      // Reset ALL players back to initial state
      const resetPlayers = prev.players.map((player, index) => ({
        ...player,
        letters: 0,
        score: 0,
        isEliminated: false,
        isLeader: index === 0, // First player becomes leader
      }));

      const resetState = {
        ...prev,
        status: "active" as GameStatus,
        players: resetPlayers,
        currentPlayerId: resetPlayers[0]?.id || 0,
        currentLeaderId: resetPlayers[0]?.id || 0,
        currentTurnIndex: 0,
        currentTrick: shuffledDeck[0], // Use the first card from initialized deck
        discardedTricks: [],
        round: 1,
        leaderConsecutiveWins: 0,
        gameLog: ["🔄 Game reset - all players and scores have been cleared!"],
        roundComplete: false,
        currentAttempts: {},
        shouldRotateLeadershipAfterRound: false,
      };

      // Update deck state to remove the first card that was used as current trick
      setDeck(shuffledDeck.slice(1));

      // Reset drawnCards to track only the first drawn card
      setDrawnCards([shuffledDeck[0]]);

      console.log("🎯 Game state reset to:", resetState);
      return resetState;
    });
  }, [initializeDeck]);

  const startGame = useCallback(
    (players: Player[]) => {
      if (players.length < 2) {
        toast.error("Need at least 2 players to start the game");
        return;
      }

      console.log("🎮 Starting game with players:", players.length);

      // Initialize deck and get the shuffled deck synchronously
      const shuffledDeck = initializeDeck();

      setGameState((prev) => {
        const newState = {
          ...prev,
          status: "active" as GameStatus,
          players,
          currentLeaderId: 0, // First player starts as leader
          currentPlayerId: 0,
          currentTurnIndex: 0,
          currentTrick: shuffledDeck[0], // Use the first card from initialized deck
          discardedTricks: [],
          round: 1,
          leaderConsecutiveWins: 0,
          gameLog: [
            `🎮 Game started with ${players.length} players! First player is ${
              players[0]?.name || "unknown"
            }.`,
          ],
          roundComplete: false,
          currentAttempts: {},
          shouldRotateLeadershipAfterRound: false,
        };

        // Update deck state to remove the first card that was used as current trick
        setDeck(shuffledDeck.slice(1));

        // Add the first drawn card to drawnCards state for consistency
        setDrawnCards([shuffledDeck[0]]);

        return newState;
      });
    },
    [initializeDeck]
  );

  // Check if current player should receive a shield (10% chance at start of turn)
  const chanceGrantShield = useCallback((playerId: number) => {
    setGameState((prev) => {
      const player = prev.players.find((p) => p.id === playerId);
      if (!player) return prev;

      const playerWithMostLetters = prev.players.reduce((prevPlayer, curr) => {
        return curr.letters > prevPlayer.letters ? curr : prevPlayer;
      }, prev.players[0]);

      // 10% chance to get a shield if they don't already have 2 or more
      if (
        Math.random() < 0.1 &&
        player.inventory.skillCards.filter((card) => card.type === "shield")
          .length < 2 &&
        player.id === playerWithMostLetters.id
      ) {
        const shieldCard: SkillCard = {
          id: `shield-${Date.now()}-${playerId}`,
          type: "shield",
          name: "Shield",
          description:
            "Protect yourself from getting a letter on your next miss",
          onUse: (gameState: GameState, playerId: number) => {
            return {
              ...gameState,
              players: gameState.players.map((p) =>
                p.id === playerId
                  ? {
                      ...p,
                      inventory: {
                        ...p.inventory,
                        skillCards: p.inventory.skillCards.map((c) =>
                          c.id === "shield"
                            ? { ...c, id: `${c.id}-${Date.now()}` }
                            : c
                        ),
                      },
                    }
                  : p
              ),
              gameLog: [
                ...gameState.gameLog,
                `🛡️ ${
                  gameState.players.find((p) => p.id === playerId)?.name
                } activated a Shield!`,
              ],
            };
          },
        };

        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === playerId
              ? {
                  ...p,
                  inventory: {
                    ...p.inventory,
                    skillCards: [...p.inventory.skillCards, shieldCard],
                  },
                }
              : p
          ),
          gameLog: [
            ...prev.gameLog,
            `✨ ${player.name} found a Shield!`,
            `💡 ${player.name} can use the Shield to protect themselves from getting a letter on their next miss.`,
          ],
        };
      }
      return prev;
    });
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

        const chooseTrickCard = currentPlayer.inventory.skillCards.find(
          (card: SkillCard) => card.type === "choose_trick"
        );
        if (!chooseTrickCard) return prev;

        // If a trick was selected, update the current trick
        if (selectedTrick) {
          // Remove the selected trick from the deck if it's there
          const updatedDeck = deck.filter(
            (card) => card.id !== selectedTrick.id
          );
          setDeck(updatedDeck);

          // Update the current trick and remove the used card
          return {
            ...prev,
            currentTrick: selectedTrick,
            players: prev.players.map((p) =>
              p.id === prev.currentPlayerId
                ? {
                    ...p,
                    inventory: {
                      ...p.inventory,
                      skillCards: p.inventory.skillCards.filter(
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

        const shieldCard = currentPlayer.inventory.skillCards.find(
          (card: SkillCard) => card.type === "shield"
        );
        if (!shieldCard) return prev;

        // Apply the shield effect
        const updatedState = shieldCard.onUse(
          {
            ...prev,
            players: prev.players.map((p) =>
              p.id === prev.currentPlayerId
                ? {
                    ...p,
                    inventory: {
                      ...p.inventory,
                      skillCards: p.inventory.skillCards.filter(
                        (c: SkillCard) => c.id !== shieldCard.id
                      ),
                    },
                  }
                : p
            ),
          },
          prev.currentPlayerId
        );

        // Move to next player after using shield
        const activePlayersList = updatedState.players.filter(
          (p) => !p.isEliminated
        );
        const currentPlayerIdx = activePlayersList.findIndex(
          (p) => p.id === prev.currentPlayerId
        );

        if (currentPlayerIdx !== -1) {
          const nextPlayerIdx =
            (currentPlayerIdx + 1) % activePlayersList.length;
          const nextPlayer = activePlayersList[nextPlayerIdx];

          return {
            ...updatedState,
            currentPlayerId: nextPlayer.id,
            gameLog: [
              ...updatedState.gameLog,
              `🔄 Turn passed to ${nextPlayer.name}`,
            ],
          };
        }

        return updatedState;
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

      const newTrick = drawCard();

      const newRound = gameState.round + 1;

      const shouldRotateOnMiss = gameState.currentLeaderId === currentPlayer.id;

      const updatedPlayers = gameState.players.map((p) =>
        p.id === currentPlayer.id
          ? { ...p, letters: newLetters, isEliminated }
          : p
      );

      chanceGrantShield(nextPlayer.id);

      setGameState((prev) => ({
        ...prev,
        players: updatedPlayers,
        discardedTricks: prev.currentTrick
          ? [...prev.discardedTricks, prev.currentTrick]
          : prev.discardedTricks,
        currentTrick: newTrick || prev.currentTrick,
        currentPlayerId: nextPlayer.id,
        currentTurnIndex: nextIndex,
        round: newRound,
        leaderConsecutiveWins: shouldRotateOnMiss
          ? 0
          : prev.leaderConsecutiveWins,
        shouldRotateLeadershipAfterRound: false,
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
          gameState.leaderConsecutiveWins >= 2);

      let newTrick = gameState.currentTrick;
      let newTrickSetterId = gameState.currentTrickSetterId;

      if (shouldGetNewTrick) {
        newTrick = drawCard() || gameState.currentTrick;
        newTrickSetterId = currentPlayer.id;

        if (!newTrick) {
          const newDeck = initializeDeck();
          newTrick = newDeck[0];
          setDeck(newDeck.slice(1));
          setDrawnCards([newTrick]);
        }
      }

      chanceGrantShield(nextPlayer.id);

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
          currentTrickSetterId: newTrickSetterId,
          leaderConsecutiveWins:
            gameState.currentLeaderId === currentPlayer.id
              ? gameState.leaderConsecutiveWins + 1
              : gameState.leaderConsecutiveWins,
          shouldRotateLeadershipAfterRound:
            gameState.currentLeaderId === currentPlayer.id
              ? gameState.leaderConsecutiveWins + 1 >= 3
              : gameState.shouldRotateLeadershipAfterRound,
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

      const currentPlayer = prev.players.find(
        (p) => p.id === prev.currentPlayerId
      );
      if (!currentPlayer) return prev;

      // Remove the used choose_trick card
      const updatedPlayers = prev.players.map((p) =>
        p.id === prev.currentPlayerId
          ? {
              ...p,
              inventory: {
                ...p.inventory,
                skillCards: p.inventory.skillCards.filter(
                  (card) => card.type !== "choose_trick"
                ),
              },
            }
          : p
      );

      // Remove the selected trick from the deck
      const trickIndex = deck.findIndex((t) => t.name === trick.name);
      const newDeck = [...deck];
      if (trickIndex !== -1) {
        newDeck.splice(trickIndex, 1);
      }

      // Update the deck state
      setDeck(newDeck);

      return {
        ...prev,
        currentTrick: trick,
        trickOptions: undefined, // Clear the trick options
        players: updatedPlayers,
        gameLog: [
          ...prev.gameLog,
          `🎲 ${currentPlayer.name} used Choose Trick and selected: ${trick.name}`,
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

  return {
    gameState,
    setGameState,
    addPlayer,
    removePlayer,
    startGame,
    handlePlayerAction,
    handleTrickSelection,
    getDeckStatus,
    clerkUser,
    drawnCards,
    hasInitialized,
    reorderPlayers,
    useSkillCard,
    addSkillCardToPlayer,
    resetPlayers,
    peekNextCards,
  } as const;
};

export default useGame;
