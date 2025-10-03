"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import useUser from "./useUser";
import { TrickCard, trickCards } from "@/types/tricks";
import { GameState, Player, GameStatus, getCurrentPlayer } from "@/types/game";
import { toast } from "sonner";

// Re-export TrickCard type for convenience
export type { TrickCard };

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
  const deckInitialized = useRef(false);

  // Initialize and shuffle the deck
  const initializeDeck = useCallback(() => {
    const shuffledDeck = shuffleArray([...trickCards]);
    setDeck(shuffledDeck);
    setDrawnCards([]);
    deckInitialized.current = true;
    return shuffledDeck;
  }, []);

  // Draw a card from the deck
  const drawCard = useCallback(
    (count = 1): TrickCard[] => {
      setDeck((prevDeck) => {
        if (prevDeck.length < count) {
          console.warn("Not enough cards in the deck");
          return prevDeck;
        }

        const drawn = prevDeck.slice(0, count);
        setDrawnCards((prev) => [...prev, ...drawn]);
        return prevDeck.slice(count);
      });

      // Return the drawn cards (this might be slightly out of sync with state)
      return deck.slice(0, count);
    },
    [deck]
  );

  // Shuffle the current deck
  const shuffleDeck = useCallback(() => {
    setDeck((prevDeck) => shuffleArray([...prevDeck]));
  }, []);

  // Reset the deck to a new shuffled state
  const resetDeck = useCallback(() => {
    const newDeck = initializeDeck();
    setDeck(newDeck);
    setDrawnCards([]);
    return newDeck;
  }, [initializeDeck]);

  const [gameState, setGameState] = useState<GameState>({
    clerkUser: null,
    status: "lobby",
    players: [],
    currentLeaderId: null,
    currentPlayerId: null,
    turnOrder: [],
    currentTurnIndex: 0,
    currentTrick: undefined,
    discardedTricks: [],
    round: 1,
    phase: "leader-turn",
    leaderConsecutiveWins: 0,
    gameLog: [],
    roundComplete: false,
    currentAttempts: {},
  });

  const initializeGame = useCallback((players: Player[]) => {
    if (players.length === 0) {
      console.error("Cannot start game with no players");
      return;
    }

    // Initialize and shuffle a fresh deck
    const freshDeck = shuffleArray([...trickCards]);
    setDeck(freshDeck);
    setDrawnCards([]);

    // Draw the first trick from the fresh deck
    const firstTrick = freshDeck[0];

    if (!firstTrick) {
      console.error("Failed to get first trick from deck");
      return;
    }

    // Update deck to remove the drawn card
    setDeck(freshDeck.slice(1));
    setDrawnCards([firstTrick]);

    const turnOrder = players.map((p) => p.id);
    const initialLeaderId = turnOrder[0];

    if (!firstTrick) {
      console.error("Failed to draw initial trick card! Deck might be empty.");
      // Reset the deck and try one more time
      resetDeck();
      shuffleDeck();
      const retryTrick = drawCard()[0];

      if (!retryTrick) {
        console.error(
          "Still failed to draw a trick card after reset. Check if trickCards is properly populated."
        );
        return;
      }
    }

    // First set up the game state with the trick
    setGameState((prev) => ({
      ...prev,
      clerkUser: null,
      status: "in-progress",
      players: players.map((p, index) => ({
        ...p,
        isLeader: index === 0,
        consecutiveWins: 0,
        isEliminated: false,
        letters: 0,
        score: 0,
      })),
      currentLeaderId: initialLeaderId,
      currentPlayerId: initialLeaderId,
      turnOrder,
      currentTurnIndex: 0,
      currentTrick: firstTrick,
      discardedTricks: [],
      round: 1,
      phase: "leader-turn",
      currentAttempts: {},
      leaderConsecutiveWins: 0,
      letters: 0,
      gameLog: [
        `Game started! ${players[0]?.name || "Player 1"} is the first leader.`,
        `First trick: ${firstTrick.name} (${firstTrick.difficulty}, ${firstTrick.points} pts)`,
      ],
      roundComplete: false,
    }));

    // Then update the game log with the turn message in a separate state update
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        gameLog: [
          ...prev.gameLog,
          `${players[0]?.name || "Player 1"}'s turn to attempt the trick!`,
        ],
      }));
    }, 100);
  }, []);

  // Draw the first trick after game starts
  useEffect(() => {
    if (gameState.status === "in-progress" && !gameState.currentTrick) {
      const newTrick = drawCard()[0];
      if (newTrick) {
        setGameState((prev) => ({
          ...prev,
          currentTrick: newTrick,
          gameLog: [
            ...prev.gameLog,
            `First trick: ${newTrick.name} (${newTrick.difficulty})`,
          ],
        }));
      }
    }
  }, [gameState.status, gameState.currentTrick, drawCard]);

  // Initialize the game with a shuffled deck when the component mounts
  useEffect(() => {
    shuffleDeck();
  }, []);

  // Automatically add Clerk user as a player when they're loaded
  useEffect(() => {
    if (isLoaded && clerkUser && !hasInitialized) {
      setGameState((prev) => {
        // Check if player already exists
        const playerExists = prev.players.some(
          (p) => p.name === clerkUser.username
        );

        if (!playerExists) {
          const newPlayer: Player = {
            id: "1", // Start with player 1
            name: clerkUser.username,
            status: "active",
            score: 0,
            isLeader: true,
            isCreator: true,
            consecutiveWins: 0,
            letters: 0,
            isEliminated: false,
          };

          return {
            ...prev,
            players: [newPlayer],
            currentPlayerId: "1",
            currentLeaderId: "1",
            turnOrder: ["1"],
          };
        }
        return prev;
      });
      setHasInitialized(true);
    }
  }, [clerkUser, isLoaded, hasInitialized]);

  const addPlayer = useCallback((newPlayer: Player) => {
    if (!newPlayer.name.trim()) {
      toast.error("Player name cannot be empty");
      return;
    }

    // Don't add if we already have 6 players (including the creator)
    if (gameState.players.length >= 6) {
      toast.error("Maximum of 6 players allowed");
      return;
    }

    setGameState((prev) => {
      // Check if player with this name already exists
      const nameExists = prev.players.some(
        (p) => p.name.toLowerCase() === newPlayer.name.trim().toLowerCase()
      );

      if (nameExists) {
        toast.error(`A player named ${newPlayer.name} already exists`);
        return prev;
      }

      const updatedPlayer: Player = {
        ...newPlayer,
        id: (prev.players.length + 1).toString(), // Simple numeric ID
        name: newPlayer.name.trim(),
        status: "active",
        score: newPlayer.score || 0,
        isEliminated: newPlayer.isEliminated || false,
        isLeader: prev.players.length === 0, // First player is leader
        isCreator: prev.players.length === 0, // First player is creator
        letters: newPlayer.letters || 0,
        consecutiveWins: newPlayer.consecutiveWins || 0,
      };

      // If this is the first player, set them as the current player and leader
      const updatedState = {
        ...prev,
        players: [...prev.players, updatedPlayer],
      };

      if (prev.players.length === 0) {
        updatedState.currentPlayerId = updatedPlayer.id;
        updatedState.currentLeaderId = updatedPlayer.id;
        updatedState.turnOrder = [updatedPlayer.id];
      }

      toast.success(`Added player: ${updatedPlayer.name}`);
      return updatedState;
    });
  }, []);

  const removePlayer = useCallback((id: string) => {
    setGameState((prev) => {
      const updatedPlayers = prev.players.filter((p) => p.id !== id);
      return {
        ...prev,
        players: updatedPlayers,
        currentPlayerId: updatedPlayers[0]?.id || null,
        currentLeaderId: updatedPlayers[0]?.id || null,
        turnOrder: updatedPlayers.map((p) => p.id),
      };
    });
  }, []);

  const resetPlayers = useCallback(() => {}, []);

  const drawTrick = () => {};

  const startGame = useCallback(
    (players: Player[]) => {
      initializeGame(players);
    },
    [initializeGame]
  );

  const rotateLeader = useCallback((state: GameState): GameState => {
    const { players, currentLeaderId } = state;
    if (!currentLeaderId) {
      return state;
    }

    const activePlayers = players.filter((p) => !p.isEliminated);
    if (activePlayers.length === 0) {
      return state;
    }

    const currentLeaderIndex = players.findIndex(
      (p) => p.id === currentLeaderId
    );
    if (currentLeaderIndex === -1) {
      return state;
    }

    let nextLeaderIndex = -1;
    for (let i = 1; i <= players.length; i++) {
      const checkIndex = (currentLeaderIndex + i) % players.length;
      const potentialLeader = players[checkIndex];
      if (!potentialLeader.isEliminated) {
        nextLeaderIndex = checkIndex;
        break;
      }
    }

    if (nextLeaderIndex === -1) {
      return state;
    }

    const nextLeader = players[nextLeaderIndex];

    const updatedPlayers = players.map((p, index) => ({
      ...p,
      isLeader: index === nextLeaderIndex,
      consecutiveWins: index === nextLeaderIndex ? 0 : p.consecutiveWins,
    }));

    return {
      ...state,
      players: updatedPlayers,
      currentLeaderId: nextLeader.id,
      currentPlayerId: nextLeader.id,
      currentTurnIndex: 0,
      leaderConsecutiveWins: 0,
      phase: "leader-turn",
      currentAttempts: {},
      gameLog: [...state.gameLog, `Leadership passed to ${nextLeader.name}!`],
    };
  }, []);

  const shufflePlayers = useCallback(() => {
    toast("Implement player shuffling logic here");
  }, []);

  const setGameStatus = useCallback((status: GameStatus) => {
    setGameState((prev) => ({
      ...prev,
      status,
    }));
  }, []);

  const getNextPlayer = useCallback(
    (state: GameState): { player: Player | null; isNewRound: boolean } => {
      const { players, turnOrder, currentTurnIndex } = state;
      if (turnOrder.length === 0) return { player: null, isNewRound: false };

      let nextIndex = (currentTurnIndex + 1) % turnOrder.length;
      const isNewRound = nextIndex <= currentTurnIndex;

      let attempts = 0;
      while (attempts < turnOrder.length) {
        const nextPlayer = players.find((p) => p.id === turnOrder[nextIndex]);
        if (nextPlayer && !nextPlayer.isEliminated) {
          return {
            player: nextPlayer,
            isNewRound,
          };
        }
        nextIndex = (nextIndex + 1) % turnOrder.length;
        attempts++;
      }

      return { player: null, isNewRound: false };
    },
    []
  );

  // Check for game over condition and determine winner
  const checkGameOver = useCallback((players: Player[]) => {
    // Sort players by letters (ascending) and then by score (descending)
    const sortedPlayers = [...players].sort((a, b) => {
      // First sort by number of letters (fewer is better)
      if (a.letters !== b.letters) {
        return a.letters - b.letters;
      }
      // If letters are equal, sort by score (higher is better)
      return b.score - a.score;
    });

    // Get active (non-eliminated) players
    const activePlayers = sortedPlayers.filter((p) => !p.isEliminated);

    // If no active players, game is over with no winner
    if (activePlayers.length === 0) {
      return {
        isGameOver: true,
        winner: null,
        standings: sortedPlayers, // Return all players sorted
      };
    }

    // If only one player left, they win
    if (activePlayers.length === 1) {
      return {
        isGameOver: true,
        winner: activePlayers[0],
        standings: sortedPlayers, // Return all players sorted
      };
    }

    // If multiple players left, no winner yet
    return {
      isGameOver: false,
      winner: null,
      standings: sortedPlayers, // Return current standings
    };
  }, []);

  const drawNewTrick = useCallback(
    (state: GameState): GameState => {
      const newTrick = drawCard()[0];

      if (!newTrick) {
        return state;
      }

      const updatedState = {
        ...state,
        currentTrick: newTrick,
        roundComplete: false,
        currentAttempts: {},
        gameLog: [
          ...state.gameLog,
          `New trick: ${newTrick.name} (${newTrick.difficulty}, ${newTrick.points} pts)`,
        ],
      };

      console.log("Updated state with new trick:", updatedState);
      return updatedState;
    },
    [drawCard]
  );

  const handlePlayerAction = useCallback(
    (action: "landed" | "missed") => {
      setGameState((prev) => {
        // Don't allow actions if game is over
        if (prev.status === "game-over") return prev;

        const currentPlayer = getCurrentPlayer(prev);
        if (!currentPlayer) return prev;

        // Don't allow eliminated players to take actions
        if (currentPlayer.isEliminated) return prev;

        const currentPlayerLetters = currentPlayer.letters;

        const isLeader = currentPlayer.id === prev.currentLeaderId;

        let updatedPlayers = [...prev.players];
        let nextState = { ...prev, players: updatedPlayers };
        let shouldRotateLeader = false;

        if (isLeader && action === "missed") {
          // Increment letters if not already at max
          const newLetterCount = Math.min(currentPlayer.letters + 1, 5);
          currentPlayer.letters = newLetterCount;

          // Check if player should be eliminated
          if (newLetterCount >= 5) {
            currentPlayer.isEliminated = true;
            currentPlayer.status = "eliminated";

            // Add to game log
            nextState.gameLog = [
              ...nextState.gameLog,
              `${currentPlayer.name} has been eliminated with 5 letters!`,
            ];

            // Check for game over after elimination
            const { isGameOver, winner } = checkGameOver(nextState.players);
            if (isGameOver) {
              return {
                ...nextState,
                status: "game-over",
                gameLog: [
                  ...nextState.gameLog,
                  winner
                    ? `Game over! ${winner.name} wins with ${winner.score} points!`
                    : "Game over! No winners this time.",
                ],
              };
            }

            // If game isn't over, rotate leader to the next active player
            nextState = rotateLeader(nextState);
            const newLeader = nextState.players.find((p) => p.isLeader);

            if (newLeader) {
              nextState.gameLog = [
                ...nextState.gameLog,
                `${newLeader.name} is the new leader!`,
              ];
            }

            // Draw a new trick
            const newTrick = drawCard()[0];
            if (newTrick) {
              nextState.currentTrick = newTrick;
              nextState.gameLog = [
                ...nextState.gameLog,
                `Next trick: ${newTrick.name} (${newTrick.difficulty}, ${newTrick.points} pts)`,
              ];
            }

            return nextState;
          }

          nextState = rotateLeader(nextState);
          const newLeader = nextState.players.find((p) => p.isLeader);
          const newTrick = drawCard()[0];

          if (newTrick) {
            nextState.currentTrick = newTrick;
            nextState.gameLog = [
              ...nextState.gameLog,
              `Leadership rotates to ${newLeader?.name || "next player"}!`,
              `${newLeader?.name || "The new leader"} sets: ${newTrick.name} (${
                newTrick.difficulty
              })`,
            ];
          } else {
            nextState.gameLog = [
              ...nextState.gameLog,
              `Leadership rotates to ${newLeader?.name || "next player"}!`,
            ];
          }

          if (newLeader) {
            nextState.currentPlayerId = newLeader.id;
          }

          nextState.phase = "leader-turn";
          nextState.currentAttempts = {};

          return nextState;
        }

        nextState.players = nextState.players.map((p) => {
          if (p.id === currentPlayer.id) {
            let newConsecutiveWins = p.consecutiveWins || 0;

            if (isLeader) {
              if (action === "landed") {
                newConsecutiveWins += 1;

                if (newConsecutiveWins >= 3) {
                  shouldRotateLeader = true;
                }
              } else if (action === "missed") {
                newConsecutiveWins = 0;
                shouldRotateLeader = true;
              }
            } else {
              newConsecutiveWins = 0;
            }

            if (action === "missed") {
              // First, update the player's score and consecutive wins
              const updatedPlayer = {
                ...p,
                consecutiveWins: newConsecutiveWins,
                score: p.score + (nextState.currentTrick?.points || 1),
              };

              // Update the player in the nextState
              nextState.players = nextState.players.map((player) =>
                player.id === p.id ? updatedPlayer : player
              );

              // Update the player's letters and check for elimination
              const playerToUpdate = nextState.players.find(
                (pl) => pl.id === p.id
              );

              if (playerToUpdate) {
                // Update player's letters and check for elimination
                const newLetterCount = playerToUpdate.letters + 1;
                const isEliminated = newLetterCount >= 5;

                // Update the player's state
                playerToUpdate.letters = newLetterCount;
                playerToUpdate.isEliminated = isEliminated;

                // Get the current letter from GRIND (0-4)
                const lettersWord = "GRIND";
                const currentLetter =
                  newLetterCount <= lettersWord.length
                    ? lettersWord[newLetterCount - 1]
                    : "?";

                // Add to game log
                nextState.gameLog = [
                  ...nextState.gameLog,
                  `${
                    playerToUpdate.name
                  } received letter '${currentLetter}' (${newLetterCount}/5)${
                    isEliminated ? " and is ELIMINATED!" : ""
                  }`,
                ];

                // Return the updated player
                return updatedPlayer;
              }

              // Return the updated player
              return updatedPlayer;
            }

            return {
              ...p,
              consecutiveWins: newConsecutiveWins,
              score:
                action === "landed"
                  ? p.score + (nextState.currentTrick?.points || 1)
                  : p.score,
            };
          }
          return p;
        });

        const updatedAttempts = {
          ...nextState.currentAttempts,
          [currentPlayer.id]: action === "landed",
        };
        nextState.currentAttempts = updatedAttempts;

        // Check for game over after player actions
        const { isGameOver, winner, standings } = checkGameOver(
          nextState.players
        );
        if (isGameOver) {
          // Update all players with their final standings
          const updatedPlayers = nextState.players.map((player) => ({
            ...player,
            // Mark the winner if this player is the winner
            isWinner: winner ? player.id === winner.id : false,
            // Store the final position (1-based index)
            position: standings.findIndex((p) => p.id === player.id) + 1,
          }));

          return {
            ...nextState,
            players: updatedPlayers,
            status: "game-over",
            gameLog: [
              ...nextState.gameLog,
              winner
                ? `Game over! ${winner.name} wins with only ${winner.letters} letters!`
                : "Game over! No winners this time.",
              ...standings.map(
                (p, index) =>
                  `${index + 1}. ${p.name} - ${p.letters} letters, ${
                    p.score
                  } points`
              ),
            ],
          };
        }

        const activePlayers = nextState.players.filter((p) => !p.isEliminated);
        const allPlayersAttempted = activePlayers.every(
          (p) => p.id === nextState.currentLeaderId || p.id in updatedAttempts
        );

        if (!allPlayersAttempted) {
          const currentIndex = nextState.players.findIndex(
            (p) => p.id === currentPlayer.id
          );

          let nextIndex = (currentIndex + 1) % nextState.players.length;
          let nextPlayer = nextState.players[nextIndex];
          let attempts = 0;

          while (
            (nextPlayer.isEliminated || nextPlayer.id in updatedAttempts) &&
            attempts < nextState.players.length
          ) {
            nextIndex = (nextIndex + 1) % nextState.players.length;
            nextPlayer = nextState.players[nextIndex];
            attempts++;
          }

          if (nextPlayer && !nextPlayer.isEliminated) {
            nextState.currentPlayerId = nextPlayer.id;
            nextState.gameLog = [
              ...nextState.gameLog,
              `${nextPlayer.name}'s turn to attempt the trick!`,
            ];
          }

          return nextState;
        }

        if (allPlayersAttempted) {
          const currentLeader = nextState.players.find((p) => p.isLeader);
          if (!currentLeader) return nextState;

          console.log(
            "End of round - leader:",
            currentLeader.name,
            "consecutiveWins:",
            currentLeader.consecutiveWins,
            "action:",
            action,
            "shouldRotateLeader:",
            shouldRotateLeader
          );

          const shouldRotateDueToWins = currentLeader.consecutiveWins >= 3;

          if (shouldRotateDueToWins) {
            console.log("Rotating leader due to 3 consecutive wins");

            const newTrick = drawCard()[0];

            nextState.players = nextState.players.map((p) =>
              p.id === currentLeader.id ? { ...p, consecutiveWins: 0 } : p
            );

            const oldLeaderName = currentLeader.name;

            nextState = rotateLeader(nextState);

            const newLeader = nextState.players.find((p) => p.isLeader);

            if (newTrick) {
              nextState.currentTrick = newTrick;
              nextState.gameLog = [
                ...nextState.gameLog,
                `${oldLeaderName} has set 3 tricks in a row!`,
                `Leadership rotates to ${newLeader?.name || "next player"}!`,
                `${newLeader?.name || "The new leader"} sets: ${
                  newTrick.name
                } (${newTrick.difficulty})`,
              ];
            } else {
              nextState.gameLog = [
                ...nextState.gameLog,
                `${oldLeaderName} has set 3 tricks in a row!`,
                `Leadership rotates to ${newLeader?.name || "next player"}!`,
              ];
            }

            if (newLeader) {
              nextState.currentPlayerId = newLeader.id;
              nextState.phase = "leader-turn";
            }
          } else {
            nextState.currentPlayerId = currentLeader.id;
            nextState.phase = "leader-turn";
            nextState.currentAttempts = {};

            if (!currentLeader.isEliminated) {
              nextState.gameLog = [
                ...nextState.gameLog,
                `${currentLeader.name} remains the leader with ${
                  currentLeader.consecutiveWins || 0
                } consecutive wins and will set the next trick!`,
              ];
            } else {
              nextState = rotateLeader({
                ...nextState,
                roundComplete: true,
                currentAttempts: {},
              });

              const newLeader = nextState.players.find((p) => p.isLeader);
              if (newLeader) {
                nextState.currentPlayerId = newLeader.id;
                nextState.gameLog = [
                  ...nextState.gameLog,
                  `Leader ${currentLeader.name} was eliminated! ${newLeader.name} is the new leader!`,
                ];
              }
            }
          }

          // Draw a new trick for the next round
          nextState.roundComplete = true;
          return drawNewTrick(nextState);
        }

        // 7. Move to next player
        const nextPlayerResult = getNextPlayer(nextState);
        if (!nextPlayerResult?.player) return prev;

        const nextPlayerId = nextPlayerResult.player.id;
        const isNextPlayerLeader = nextPlayerId === nextState.currentLeaderId;

        // 8. Update game state
        nextState = {
          ...nextState,
          currentPlayerId: nextPlayerId,
          currentTurnIndex: nextState.turnOrder.findIndex(
            (id) => id === nextPlayerId
          ),
          phase: isNextPlayerLeader ? "leader-turn" : "followers-turn",
          currentAttempts: allPlayersAttempted ? {} : updatedAttempts,
          roundComplete: allPlayersAttempted, // Mark as complete if all have attempted
          gameLog: [
            ...nextState.gameLog,
            `${currentPlayer.name} ${
              action === "landed" ? "landed" : "missed"
            } the trick!`,
          ],
        };

        // This code is only reached if the round is not complete yet

        return nextState;
      });
    },
    [getNextPlayer, rotateLeader]
  );

  return {
    gameState,
    addPlayer,
    startGame,
    removePlayer,
    resetPlayers,
    shufflePlayers,
    drawTrick,
    handlePlayerAction,
    initializeDeck,
    setGameStatus,
    clerkUser,
    isLoaded,
    drawnCards,
    hasInitialized,
  } as const;
};

export default useGame;
