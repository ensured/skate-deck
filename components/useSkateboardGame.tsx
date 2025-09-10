// hooks/useSkateboardGame.ts
import { useState, useEffect, useCallback } from "react";
import { GameState, Trick } from "@/types/types";
import { trickCards, SKATE_LETTERS } from "@/lib/tricks";
import { isValidGameState } from "@/lib/helpers";
import { skillCards } from "@/lib/skills";

export const useSkateboardGame = () => {
    const defaultGameState: GameState = {
        players: [],
        currentPlayerIndex: 0,
        gameStarted: false,
        currentTrick: null,
        gamePhase: "setting",
        winner: null,
        roundNumber: 1,
        leaderIndex: null,
        showTrickPicker: false,
        trickPickerOptions: [],
        usedTricks: [],
    };
    const [gameState, setGameState] = useState<GameState>(defaultGameState);
    const [newPlayerName, setNewPlayerName] = useState("");
    const [localStorageLoading, setLocalStorageLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Load from localStorage on client mount
    useEffect(() => {
        if (typeof window === "undefined" || !window.localStorage) return;

        let isMounted = true;

        const loadGameFromStorage = async () => {
            try {
                const saved = localStorage.getItem("skateboardGameState");
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed && isValidGameState(parsed.gameState)) {
                        // Set the entire game state at once
                        if (isMounted) {
                            setGameState(prev => ({
                                ...defaultGameState,  // Start with defaults
                                ...parsed.gameState,  // Override with saved state
                                // Ensure usedTricks is always an array
                                usedTricks: Array.isArray(parsed.gameState.usedTricks) ?
                                    parsed.gameState.usedTricks : []
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load game state from localStorage:", error);
            } finally {
                if (isMounted) {
                    setLocalStorageLoading(false);
                }
            }
        };

        loadGameFromStorage();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []);

    // Save to localStorage on state updates
    useEffect(() => {
        if (typeof window === "undefined" || !window.localStorage) return;

        try {
            localStorage.setItem("skateboardGameState", JSON.stringify({ gameState }));
        } catch (error) {
            console.error("Failed to save game state to localStorage:", error);
        }
    }, [gameState]);

    const drawRandomTrick = useCallback((playerIndex: number) => {
        setGameState((prev) => {
            if (prev.gamePhase === "game-over") return prev;

            const availableTricks = trickCards.filter((trick) => !prev.usedTricks.includes(trick.id));
            const randomTrick =
                availableTricks.length === 0
                    ? trickCards[Math.floor(Math.random() * trickCards.length)]
                    : availableTricks[Math.floor(Math.random() * availableTricks.length)];

            // 10% chance to award a random skill card to the current player
            let updatedPlayers = prev.players;
            const currentPlayer = prev.players[playerIndex];
            if (Math.random() < 0.1 && currentPlayer && !currentPlayer.isEliminated && currentPlayer.skillCards.length < 3) {
                const availableSkillCards = skillCards.filter(
                    (card) => !currentPlayer.skillCards.some((c) => c.id === card.id)
                );
                if (availableSkillCards.length > 0) {
                    const newSkillCard = availableSkillCards[Math.floor(Math.random() * availableSkillCards.length)];
                    console.log(`${currentPlayer.name} got a lucky ${newSkillCard.name} card!`);
                    updatedPlayers = prev.players.map((p) =>
                        p.id === currentPlayer.id
                            ? {
                                ...p,
                                skillCards: [...p.skillCards, newSkillCard],
                            }
                            : p
                    );
                }
            }

            return {
                ...prev,
                currentTrick: randomTrick,
                gamePhase: "attempting",
                showTurnModal: true,
                roundNumber: prev.roundNumber + 1,
                leaderIndex: playerIndex,
                players: updatedPlayers.map((player) => ({
                    ...player,
                    hasAttemptedCurrentTrick: false,
                    extraTries: player.extraTries || 0
                })),
            };
        });
    }, []);

    // Clean effect to handle drawing next tricks
    useEffect(() => {
        if (gameState.shouldDrawNextTrick && gameState.nextPlayerIndex !== null && gameState.nextPlayerIndex !== undefined) {
            drawRandomTrick(gameState.nextPlayerIndex);
            setGameState((prev) => ({
                ...prev,
                shouldDrawNextTrick: false,
                nextPlayerIndex: null
            }));
        }
    }, [gameState.shouldDrawNextTrick, gameState.nextPlayerIndex, drawRandomTrick]);

    // Clean effect to handle turn advancement
    useEffect(() => {
        if (gameState.shouldAdvanceTurn) {
            if (!gameState.trickLeaderLanded) {
                nextPlayer();
            } else {
                nextPlayerForTrick();
            }
            setGameState((prev) => ({ ...prev, shouldAdvanceTurn: false }));
        }
    }, [gameState.shouldAdvanceTurn, gameState.trickLeaderLanded]);

    const handleTrickSelect = useCallback((selected: Trick) => {
        setGameState((prev) => ({
            ...prev,
            showTrickPicker: false,
            trickPickerOptions: [],
            currentTrick: selected,
            gamePhase: "attempting" as const,
            showTurnModal: true,
            trickLeaderLanded: false,
            leaderIndex: prev.currentPlayerIndex,
            roundNumber: prev.roundNumber + 1,
            players: prev.players.map((p) => ({
                ...p,
                hasAttemptedCurrentTrick: false,
            })),
            modalOverlay: false,
            // Update usedTricks in the same state update
            usedTricks: [...prev.usedTricks, selected.id]
        }));
    }, []);

    const addPlayer = useCallback(() => {
        if (newPlayerName.trim() && gameState.players.length < 8) {
            setGameState((prev) => ({
                ...prev,
                players: [
                    ...prev.players,
                    {
                        id: Date.now(),
                        name: newPlayerName.trim(),
                        letters: [],
                        isEliminated: false,
                        skillCards: [],
                        consecutiveTricks: 0,
                        hasAttemptedCurrentTrick: false,
                        extraTries: 0,
                    },
                ],
            }));
            setNewPlayerName("");
        }
    }, [newPlayerName, gameState.players.length]);

    const removePlayer = useCallback((playerId: number) => {
        setGameState((prev) => ({
            ...prev,
            players: prev.players.filter((p) => p.id !== playerId),
            shouldAdvanceTurn: true
        }));
    }, []);

    const startGame = useCallback(() => {
        if (gameState.players.length >= 2) {
            // Create a copy of players array to avoid mutating the original
            const playersCopy = [...gameState.players];
            // Get random starting player index
            const randomFirstPlayerIndex = Math.floor(Math.random() * playersCopy.length);
            // Reorder players array so the random player is first, followed by the rest in order
            const reorderedPlayers = [
                playersCopy[randomFirstPlayerIndex],
                ...playersCopy.slice(randomFirstPlayerIndex + 1),
                ...playersCopy.slice(0, randomFirstPlayerIndex)
            ];

            setGameState((prev: any) => {
                const updatedPlayers = reorderedPlayers.map((p, index) => ({
                    ...p,
                    letters: [],
                    isEliminated: false,
                    hasAttemptedCurrentTrick: false,
                    consecutiveTricks: 0,
                    extraTries: 0,
                    // Assign new indices based on the reordered array
                    id: index,
                    order: index
                }));

                return {
                    ...prev,
                    gameStarted: true,
                    gamePhase: "in-progress",
                    currentPlayerIndex: 0, // Always start with the first player in the reordered array
                    leaderIndex: 0, // The first player is the initial leader
                    showTurnModal: true,
                    roundNumber: 1,
                    players: updatedPlayers,
                    usedTricks: []
                };
            });

            // Draw a random trick for the first player
            drawRandomTrick(0);
        }
    }, [gameState.players]);

    const landTrick = useCallback(() => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (!currentPlayer) return;

        setGameState((prev) => {
            const isLeader = prev.currentPlayerIndex === prev.leaderIndex;

            // Update all players' states
            const updatedPlayers = prev.players.map((p) => {
                if (p.id === currentPlayer.id) {
                    // For current player, increment their consecutive tricks if they're the leader
                    // or if they're matching the leader's trick
                    const newConsecutiveTricks = isLeader
                        ? p.consecutiveTricks + 1
                        : (p.consecutiveTricks > 0 ? p.consecutiveTricks + 1 : 1);

                    return {
                        ...p,
                        consecutiveTricks: newConsecutiveTricks,
                        hasAttemptedCurrentTrick: true,
                        extraTries: 0,
                    };
                }
                // For other players, keep their current state
                return p;
            });

            const activePlayers = updatedPlayers.filter((p) => !p.isEliminated);

            if (activePlayers.length <= 1) {
                return {
                    ...prev,
                    players: updatedPlayers,
                    gamePhase: "game-over",
                    winner: activePlayers.length === 1 ? activePlayers[0].name : null,
                    showTurnModal: false,
                    currentTrick: null,
                };
            }

            return {
                ...prev,
                players: updatedPlayers,
                showTurnModal: false,
                trickLeaderLanded: isLeader ? true : prev.trickLeaderLanded,
                shouldAdvanceTurn: true,
            };
        });
    }, [gameState.players, gameState.currentPlayerIndex, gameState.trickLeaderLanded]);

    const nextPlayerForTrick = useCallback(() => {
        setIsTransitioning(true);

        // Use a small delay to allow the skeleton to show before state updates
        setTimeout(() => {
            setGameState((prev) => {
                if (prev.gamePhase === "game-over") return prev;

                // If leader has landed 3 tricks, move to next player
                if (prev.trickLeaderLanded && prev.leaderIndex !== null) {
                    const leader = prev.players[prev.leaderIndex];
                    if (!leader.isEliminated && leader.consecutiveTricks < 3) {
                        const newState = {
                            ...prev,
                            currentPlayerIndex: prev.leaderIndex,
                            showTurnModal: true,
                            shouldDrawNextTrick: true,
                            nextPlayerIndex: prev.leaderIndex,
                            players: prev.players.map(p => ({
                                ...p,
                                hasAttemptedCurrentTrick: p.id === leader.id ? false : p.hasAttemptedCurrentTrick
                            }))
                        };
                        setTimeout(() => {
                            setIsTransitioning(false);
                        }, 280);
                        return newState;
                    } else {
                        const nextIndex = (prev.leaderIndex + 1) % prev.players.length;
                        const newState = {
                            ...prev,
                            currentPlayerIndex: nextIndex,
                            leaderIndex: nextIndex,
                            trickLeaderLanded: false,
                            showTurnModal: true,
                            shouldDrawNextTrick: true,
                            nextPlayerIndex: nextIndex,
                            players: prev.players.map(p => ({
                                ...p,
                                hasAttemptedCurrentTrick: false,
                                extraTries: 0
                            }))
                        };
                        setTimeout(() => {
                            setIsTransitioning(false);
                        }, 280);
                        return newState;
                    }
                }

                // Regular turn progression
                let nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
                while (prev.players[nextIndex].isEliminated) {
                    nextIndex = (nextIndex + 1) % prev.players.length;
                }

                const newState = {
                    ...prev,
                    currentPlayerIndex: nextIndex,
                    leaderIndex: nextIndex,
                    showTurnModal: true,
                    shouldDrawNextTrick: true,
                    nextPlayerIndex: nextIndex,
                    trickLeaderLanded: false
                };
                setTimeout(() => {
                    setIsTransitioning(false);
                }, 280);
                return newState;
            });
        }, 100);
    }, []);

    const missTrick = useCallback(() => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (!currentPlayer) return;

        const hasExtraTries = (currentPlayer.extraTries || 0) > 0;
        let newLetters = currentPlayer.letters;
        let shouldConsumeExtraTry = false;
        
        if (hasExtraTries) {
            // If player has extra tries, consume one and don't add a letter
            shouldConsumeExtraTry = true;
            const remainingTries = (currentPlayer.extraTries || 0) - 1;
            console.log(`Using extra try! Remaining: ${remainingTries}`);
        } else {
            // No extra tries, add a letter
            newLetters = [...currentPlayer.letters, SKATE_LETTERS[currentPlayer.letters.length]];
            console.log(`No extra tries left. Adding letter: ${newLetters[newLetters.length - 1]}`);
        }
        
        const isEliminated = newLetters.length >= 5;

        // Start transition
        setIsTransitioning(true);

        // Use a small delay to allow the transition to start
        setTimeout(() => {
            setGameState((prev) => {
                const updatedPlayers = prev.players.map((p) =>
                    p.id === currentPlayer.id
                        ? {
                            ...p,
                            letters: newLetters,
                            isEliminated,
                            consecutiveTricks: 0,
                            hasAttemptedCurrentTrick: true,
                            extraTries: shouldConsumeExtraTry ? (p.extraTries || 0) - 1 : (p.extraTries || 0),
                        }
                        : p
                );

                const activePlayers = updatedPlayers.filter((p) => !p.isEliminated);

                if (activePlayers.length <= 1) {
                    setTimeout(() => setIsTransitioning(false), 0);
                    return {
                        ...prev,
                        players: updatedPlayers,
                        gamePhase: "game-over",
                        winner: activePlayers.length === 1 ? activePlayers[0].name : null,
                        showTurnModal: false,
                        currentTrick: null,
                    };
                }

                const newState = {
                    ...prev,
                    players: updatedPlayers,
                    showTurnModal: hasExtraTries,
                    shouldAdvanceTurn: !hasExtraTries,
                };

                // Only advance to next player if no extra tries
                if (!hasExtraTries) {
                    setTimeout(() => {
                        nextPlayerForTrick();
                    }, 280);
                } else {
                    setTimeout(() => {
                        setIsTransitioning(false);
                    }, 280);
                }

                return newState;
            });
        }, 0);
    }, [gameState.players, gameState.currentPlayerIndex]);





    const nextPlayer = useCallback(() => {
        setGameState((prev) => {
            if (prev.gamePhase === "game-over") return prev;

            const activePlayers = prev.players.filter((p) => !p.isEliminated);
            if (activePlayers.length <= 1) {
                return {
                    ...prev,
                    gamePhase: "game-over",
                    winner: activePlayers.length === 1 ? activePlayers[0].name : null,
                    showTurnModal: false,
                    currentTrick: null,
                    leaderIndex: null,
                };
            }

            let nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
            while (prev.players[nextIndex].isEliminated) {
                nextIndex = (nextIndex + 1) % prev.players.length;
            }

            const updatedPlayers = prev.players.map((p) => ({
                ...p,
                consecutiveTricks: 0,
                hasAttemptedCurrentTrick: false,
                extraTries: 0,
            }));

            return {
                ...prev,
                players: updatedPlayers,
                currentPlayerIndex: nextIndex,
                trickLeaderLanded: false,
                leaderIndex: nextIndex,
                showTurnModal: true,
                shouldDrawNextTrick: true, // Clean flag to trigger useEffect
                nextPlayerIndex: nextIndex
            };
        });
    }, []);

    const resetGame = useCallback(() => {
        setGameState((prev) => ({
            ...defaultGameState,
            players: prev.players.map((player) => ({
                ...player,
                letters: [],
                isEliminated: false,
                skillCards: [...skillCards].sort(() => 0.5 - Math.random()).slice(0, 2),
                consecutiveTricks: 0,
                hasAttemptedCurrentTrick: false,
                extraTries: 0,
            })),
            usedTricks: [],
            currentPlayerIndex: 0,
            leaderIndex: null,
            trickLeaderLanded: false,
            showTurnModal: false,
            gamePhase: "setting"
        }));
        if (typeof window !== "undefined" && window.localStorage) {
            localStorage.removeItem("skateboardGameState");
        }
    }, [gameState.players]);

    const newGame = useCallback(() => {
        setGameState({
            ...defaultGameState,
            players: [],
            usedTricks: [],
        });
        if (typeof window !== "undefined" && window.localStorage) {
            localStorage.removeItem("skateboardGameState");
        }
    }, []);

    const useSkillCard = useCallback((cardId: string) => {
        setGameState((prev) => {
            const currentPlayer = prev.players[prev.currentPlayerIndex];
            if (!currentPlayer) return prev;

            // Validate card exists in player's hand
            const cardExists = currentPlayer.skillCards.some(card => card.id === cardId);
            if (!cardExists) {
                console.warn(`Player ${currentPlayer.name} doesn't have card ${cardId}`);
                return prev;
            }

            // Create a deep copy of the state to work with
            const newState = JSON.parse(JSON.stringify(prev));
            const currentPlayerIndex = newState.players.findIndex((p: any) => p.id === currentPlayer.id);

            if (cardId === "hard-pass") {
                // Mark the current player as having attempted the trick
                newState.players[currentPlayerIndex].hasAttemptedCurrentTrick = true;
                newState.players[currentPlayerIndex].consecutiveTricks = 0;
                newState.players[currentPlayerIndex].extraTries = 0;
                newState.showTurnModal = false;
                newState.shouldAdvanceTurn = true; // Trigger turn advancement

                // Remove the used card
                newState.players[currentPlayerIndex].skillCards =
                    newState.players[currentPlayerIndex].skillCards.filter((card: any) => card.id !== cardId);

                return newState;

            } else if (cardId === "trick-swap") {
                if (newState.gamePhase !== "attempting" || !newState.currentTrick) {
                    console.warn("Trick Swap can only be used during the attempt phase with an active trick.");
                    return prev;
                }

                const currentTrick = newState.currentTrick;
                const currentDifficultyIndex = ["Beginner", "Intermediate", "Advanced", "Pro"].indexOf(currentTrick.difficulty);

                // Find available tricks of same or lower difficulty
                const availableTricks = trickCards.filter(
                    (trick: any) =>
                        !newState.usedTricks.includes(trick.id) &&
                        ["Beginner", "Intermediate", "Advanced", "Pro"].indexOf(trick.difficulty) <= currentDifficultyIndex
                );

                if (availableTricks.length === 0) {
                    console.warn("No available tricks of same or lower difficulty.");
                    return prev;
                }

                // Select a random trick from available ones
                const newTrick = availableTricks[Math.floor(Math.random() * availableTricks.length)];

                // Update the game state
                newState.currentTrick = newTrick;
                newState.usedTricks = [...newState.usedTricks, newTrick.id];
                newState.trickLeaderLanded = false;
                newState.leaderIndex = newState.currentPlayerIndex;
                newState.showTurnModal = true;
                newState.gamePhase = "attempting";
                newState.roundNumber++;

                // Reset attempt status for all players
                newState.players = newState.players.map((p: any) => ({
                    ...p,
                    hasAttemptedCurrentTrick: false,
                    extraTries: 0
                }));

                // Remove the used card
                newState.players[currentPlayerIndex].skillCards =
                    newState.players[currentPlayerIndex].skillCards.filter((card: any) => card.id !== cardId);

                return newState;

            } else if (cardId === "extra-try") {
                // Add an extra try to the current player (max 2 extra tries)
                const currentTries = newState.players[currentPlayerIndex].extraTries || 0;
                if (currentTries < 2) {
                    newState.players[currentPlayerIndex].extraTries = currentTries + 1;
                    console.log(`Extra try added! Total extra tries: ${currentTries + 1}`);
                } else {
                    console.log('Maximum extra tries (2) already reached');
                }
                newState.showTurnModal = true;

                // Remove the used card
                newState.players[currentPlayerIndex].skillCards =
                    newState.players[currentPlayerIndex].skillCards.filter((card: any) => card.id !== cardId);

                return newState;

            } else if (cardId === "peek-choose") {
                if (newState.gamePhase !== "attempting") {
                    console.warn("Peek Choose can only be used during the attempt phase.");
                    return prev;
                }

                // Get available tricks that haven't been used yet
                const available = trickCards.filter((t: any) => !newState.usedTricks.includes(t.id));
                const nextThree = available.slice(0, 3);

                if (nextThree.length === 0) {
                    console.warn("No available tricks to peek at.");
                    return prev;
                }

                // Set up the trick picker
                newState.showTrickPicker = true;
                newState.trickPickerOptions = nextThree;
                newState.modalOverlay = true;

                // Remove the used card
                newState.players[currentPlayerIndex].skillCards =
                    newState.players[currentPlayerIndex].skillCards.filter((card: any) => card.id !== cardId);

                return newState;
            }

            return newState;
        });
    }, [gameState.players, gameState.currentPlayerIndex, gameState.gamePhase, gameState.currentTrick]);

    const closePowerup = useCallback(() => {
        // Don't allow closing during peek-choose when modal overlay is active
        if (gameState.showTrickPicker && gameState.modalOverlay) {
            return;
        }

        setGameState((prev) => ({
            ...prev,
            showTrickPicker: false,
            trickPickerOptions: [],
            modalOverlay: false,
        }));
    }, [gameState.showTrickPicker, gameState.modalOverlay]);

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const activePlayers = gameState.players.filter((p) => !p.isEliminated);
    const playersToAttempt = activePlayers.filter((p) => !p.hasAttemptedCurrentTrick);

    const handleSkillCardClick = useCallback((cardId: string) => {
        setGameState((prev) => ({ ...prev, showTurnModal: false }));
        useSkillCard(cardId);
    }, [useSkillCard]);

    return {
        gameState,
        setGameState,
        localStorageLoading,
        newPlayerName,
        setNewPlayerName,
        currentPlayer: gameState.players[gameState.currentPlayerIndex] || null,
        activePlayers: gameState.players.filter((p) => !p.isEliminated),
        playersToAttempt: gameState.players.filter(
            (p) => !p.isEliminated && !p.hasAttemptedCurrentTrick
        ),
        addPlayer,
        removePlayer,
        startGame,
        landTrick,
        missTrick,
        resetGame,
        newGame,
        useSkillCard,
        handleTrickSelect,
        isTransitioning,
        handleSkillCardClick
    };
};
