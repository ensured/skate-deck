// hooks/useSkateboardGame.ts
import { useState, useEffect } from "react";
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
        showTurnModal: false,
        roundNumber: 1,
        trickLeaderLanded: false,
        leaderIndex: null,
        justUsedHardPass: false,
        showTrickPicker: false,
        trickPickerOptions: [],
    };
    const [gameState, setGameState] = useState<GameState>(defaultGameState);
    const [usedTricks, setUsedTricks] = useState<number[]>([]);
    const [newPlayerName, setNewPlayerName] = useState("");
    const [localStorageLoading, setLocalStorageLoading] = useState<boolean>(true);

    // Load from localStorage on client mount
    useEffect(() => {
        if (typeof window === "undefined" || !window.localStorage) return;

        const loadGameFromStorage = () => {
            try {
                const saved = localStorage.getItem("skateboardGameState");
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (
                        parsed &&
                        isValidGameState(parsed.gameState) &&
                        Array.isArray(parsed.usedTricks) &&
                        parsed.usedTricks.every((id: any) => typeof id === "number" && trickCards.some((t) => t.id === id))
                    ) {
                        setGameState(parsed.gameState);
                        setUsedTricks(parsed.usedTricks);
                    }
                }
            } catch (error) {
                console.error("Failed to load game state from localStorage:", error);
            } finally {
                setLocalStorageLoading(false);
            }
        };

        loadGameFromStorage();
    }, []);

    // Save to localStorage on state updates
    useEffect(() => {
        if (typeof window === "undefined" || !window.localStorage) return;

        try {
            localStorage.setItem("skateboardGameState", JSON.stringify({ gameState, usedTricks }));
        } catch (error) {
            console.error("Failed to save game state to localStorage:", error);
        }
    }, [gameState, usedTricks]);

    useEffect(() => {
        if (!gameState.justUsedHardPass) return;

        if (!gameState.trickLeaderLanded) {
            nextPlayer();
        } else {
            nextPlayerForTrick();
        }

        // Clean up the flag to avoid loops
        setGameState((prev) => ({ ...prev, justUsedHardPass: false }));
    }, [gameState.justUsedHardPass]);

    const handleTrickSelect = (selected: Trick) => {
        setUsedTricks((prev) => [...prev, selected.id]);
        setGameState((prev) => ({
            ...prev,
            showTrickPicker: false,
            trickPickerOptions: [],
            currentTrick: selected,
            gamePhase: "attempting",
            showTurnModal: true,
            trickLeaderLanded: false,
            leaderIndex: prev.currentPlayerIndex,
            roundNumber: prev.roundNumber + 1,
            players: prev.players.map((p) => ({
                ...p,
                hasAttemptedCurrentTrick: false,
            })),
        }));
    };

    const addPlayer = () => {
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
    };

    const removePlayer = (playerId: number) => {
        setGameState((prev) => ({
            ...prev,
            players: prev.players.filter((p) => p.id !== playerId),
        }));
    };

    // start game and set skills for all player
    const startGame = () => {
        if (gameState.players.length >= 2) {
            const randomFirstPlayer = Math.floor(Math.random() * gameState.players.length);
            setGameState((prev) => ({
                ...prev,
                gameStarted: true,
                currentPlayerIndex: randomFirstPlayer,
                gamePhase: "setting",
                players: prev.players.map((player) => ({
                    ...player,
                    skillCards: [
                        skillCards[0],
                        skillCards[1],
                        skillCards[2],
                        skillCards[3],
                    ],
                    consecutiveTricks: 0,
                    hasAttemptedCurrentTrick: false,
                    extraTries: 0,
                })),
            }));
            drawRandomTrick(randomFirstPlayer);
        }
    };

    const drawRandomTrick = (playerIndex: number) => {
        setGameState((prev) => {
            if (prev.gamePhase === "game-over") return prev;

            const availableTricks = trickCards.filter((trick) => !usedTricks.includes(trick.id));
            const randomTrick =
                availableTricks.length === 0
                    ? trickCards[Math.floor(Math.random() * trickCards.length)]
                    : availableTricks[Math.floor(Math.random() * availableTricks.length)];
            setUsedTricks((prev) => [...prev, randomTrick.id]);

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
                            ? { ...p, skillCards: [...p.skillCards, newSkillCard] }
                            : p
                    );
                }
            }

            return {
                ...prev,
                currentTrick: randomTrick,
                currentPlayerIndex: playerIndex,
                showTurnModal: true,
                gamePhase: "attempting",
                roundNumber: prev.roundNumber + 1,
                trickLeaderLanded: false,
                leaderIndex: playerIndex,
                players: updatedPlayers.map((player) => ({ ...player, hasAttemptedCurrentTrick: false, extraTries: player.extraTries || 0 })),
            };
        });
    };

    const landTrick = () => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];

        setGameState((prev) => {
            const isLeader = prev.currentPlayerIndex === prev.leaderIndex;
            const updatedPlayers = prev.players.map((p) =>
                p.id === currentPlayer.id
                    ? {
                        ...p,
                        consecutiveTricks: isLeader ? p.consecutiveTricks + 1 : p.consecutiveTricks,
                        hasAttemptedCurrentTrick: true,
                        extraTries: 0, // Reset extra tries on success
                    }
                    : p
            );

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
            };
        });

        nextPlayerForTrick();
    };

    const missTrick = () => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        const hasExtraTries = (currentPlayer.extraTries || 0) > 0;
        const newLetters = hasExtraTries
            ? currentPlayer.letters
            : [...currentPlayer.letters, SKATE_LETTERS[currentPlayer.letters.length]];
        const isEliminated = newLetters.length >= 5;

        setGameState((prev) => {
            const updatedPlayers = prev.players.map((p) =>
                p.id === currentPlayer.id
                    ? {
                        ...p,
                        letters: newLetters,
                        isEliminated,
                        consecutiveTricks: 0,
                        hasAttemptedCurrentTrick: true,
                        extraTries: hasExtraTries ? (p.extraTries || 0) - 1 : 0,
                    }
                    : p
            );

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
                showTurnModal: hasExtraTries, // Keep modal open if extra tries remain
            };
        });

        if (!hasExtraTries) {
            // Only advance if no extra tries remain
            if (!gameState.trickLeaderLanded) {
                nextPlayer();
            } else {
                nextPlayerForTrick();
            }
        }
        // If hasExtraTries is true, do nothing (stay on current player)
    };

    const nextPlayerForTrick = () => {
        setGameState((prev) => {
            if (prev.gamePhase === "game-over") return prev;

            const activePlayers = prev.players.filter((p) => !p.isEliminated);
            const playersToAttempt = activePlayers.filter((p) => !p.hasAttemptedCurrentTrick);

            if (!prev.trickLeaderLanded || playersToAttempt.length === 0) {
                if (prev.trickLeaderLanded && prev.leaderIndex !== null) {
                    const leader = prev.players[prev.leaderIndex];
                    if (!leader.isEliminated && leader.consecutiveTricks < 3) {
                        drawRandomTrick(prev.leaderIndex);
                        return {
                            ...prev,
                            currentPlayerIndex: prev.leaderIndex,
                            showTurnModal: true,
                        };
                    } else {
                        let nextIndex = (prev.leaderIndex + 1) % prev.players.length;
                        while (prev.players[nextIndex].isEliminated) {
                            nextIndex = (nextIndex + 1) % prev.players.length;
                        }
                        drawRandomTrick(nextIndex);
                        return {
                            ...prev,
                            currentPlayerIndex: nextIndex,
                            players: prev.players.map((p) => ({ ...p, consecutiveTricks: 0 })),
                            showTurnModal: true,
                        };
                    }
                }
                return prev;
            }

            let nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
            while (prev.players[nextIndex].isEliminated || prev.players[nextIndex].hasAttemptedCurrentTrick) {
                nextIndex = (nextIndex + 1) % prev.players.length;
            }

            return {
                ...prev,
                currentPlayerIndex: nextIndex,
                showTurnModal: true,
            };
        });
    };

    const nextPlayer = () => {
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
                extraTries: 0, // Reset extra tries for new round
            }));

            drawRandomTrick(nextIndex);

            return {
                ...prev,
                players: updatedPlayers,
                currentPlayerIndex: nextIndex,
                trickLeaderLanded: false,
                leaderIndex: nextIndex,
                showTurnModal: true,
            };
        });
    };

    const resetGame = () => {
        setGameState({
            players: gameState.players.map((p) => ({
                ...p,
                letters: [],
                isEliminated: false,
                skillCards: [
                    skillCards[Math.floor(Math.random() * skillCards.length)],
                    skillCards[Math.floor(Math.random() * skillCards.length)],
                ],
                consecutiveTricks: 0,
                hasAttemptedCurrentTrick: false,
                extraTries: 0,
            })),
            currentPlayerIndex: 0,
            gameStarted: false,
            currentTrick: null,
            gamePhase: "setting",
            winner: null,
            showTurnModal: false,
            roundNumber: 1,
            trickLeaderLanded: false,
            leaderIndex: null,
        });
        setUsedTricks([]);
        if (typeof window !== "undefined" && window.localStorage) {
            localStorage.removeItem("skateboardGameState");
        }
    };

    const newGame = () => {
        setGameState({
            players: [],
            currentPlayerIndex: 0,
            gameStarted: false,
            currentTrick: null,
            gamePhase: "setting",
            winner: null,
            showTurnModal: false,
            roundNumber: 1,
            trickLeaderLanded: false,
            leaderIndex: null,
        });
        setUsedTricks([]);
        if (typeof window !== "undefined" && window.localStorage) {
            localStorage.removeItem("skateboardGameState");
        }
    };

    const useSkillCard = (cardId: string) => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];

        if (cardId === "hard-pass") {
            setGameState((prev) => {
                const updatedPlayers = prev.players.map((p) =>
                    p.id === currentPlayer.id
                        ? {
                            ...p,
                            skillCards: p.skillCards.filter((card) => card.id !== cardId),
                            consecutiveTricks: 0,
                            hasAttemptedCurrentTrick: true,
                            extraTries: 0
                        }
                        : p
                );

                const updatedState = {
                    ...prev,
                    players: updatedPlayers,
                    showTurnModal: false,
                    justUsedHardPass: true, // This triggers the effect to skip the turn
                };
                // Determine who to go to next based on the current state
                if (!prev.trickLeaderLanded) {
                    nextPlayer(); // Pass updated state if needed
                } else {
                    nextPlayerForTrick();
                }

                return updatedState;
            });
        } else if (cardId === "trick-swap") {
            if (gameState.gamePhase !== "attempting" || !gameState.currentTrick) {
                console.warn("Trick Swap can only be used during the attempt phase with an active trick.");
                return;
            }

            setGameState((prev) => {
                const currentTrick = prev.currentTrick as Trick;
                const currentDifficultyIndex = ["Beginner", "Intermediate", "Advanced", "Pro"].indexOf(currentTrick.difficulty);
                const availableTricks = trickCards.filter(
                    (trick) =>
                        !usedTricks.includes(trick.id) &&
                        ["Beginner", "Intermediate", "Advanced", "Pro"].indexOf(trick.difficulty) <= currentDifficultyIndex
                );

                let newTrick: Trick;
                if (availableTricks.length === 0) {
                    console.warn("No available tricks of same or lower difficulty. Resetting usedTricks.");
                    setUsedTricks([currentTrick.id]);
                    const fallbackTricks = trickCards.filter(
                        (trick) =>
                            trick.id !== currentTrick.id &&
                            ["Beginner", "Intermediate", "Advanced", "Pro"].indexOf(trick.difficulty) <= currentDifficultyIndex
                    );
                    newTrick = fallbackTricks[Math.floor(Math.random() * fallbackTricks.length)] || trickCards[0];
                } else {
                    newTrick = availableTricks[Math.floor(Math.random() * availableTricks.length)];
                }

                setUsedTricks((prevUsed) => [...prevUsed, newTrick.id]);
                console.log(`Trick swapped from ${currentTrick.name} to ${newTrick.name}`);

                const updatedPlayers = prev.players.map((p) =>
                    p.id === currentPlayer.id
                        ? { ...p, skillCards: p.skillCards.filter((card) => card.id !== cardId), hasAttemptedCurrentTrick: false, extraTries: 0 }
                        : { ...p, hasAttemptedCurrentTrick: false }
                );

                return {
                    ...prev,
                    players: updatedPlayers,
                    currentTrick: newTrick,
                    currentPlayerIndex: prev.currentPlayerIndex,
                    trickLeaderLanded: false,
                    leaderIndex: prev.currentPlayerIndex,
                    showTurnModal: true,
                    gamePhase: "attempting",
                    roundNumber: prev.roundNumber + 1,
                };
            });
        } else if (cardId === "extra-try") {
            setGameState((prev) => ({
                ...prev,
                players: prev.players.map((p) =>
                    p.id === currentPlayer.id
                        ? { ...p, skillCards: p.skillCards.filter((card) => card.id !== cardId), extraTries: 1 } // Changed to 1 extra try
                        : p
                ),
                showTurnModal: true, // Keep modal open for first attempt
            }));
        } else if (cardId === "peek-choose") {
            const available = trickCards.filter((t) => !usedTricks.includes(t.id));
            const nextThree = available.slice(0, 3);
            if (nextThree.length === 0) {
                console.warn("No available tricks to peek at.");
                return;
            }
            setGameState((prev) => ({
                ...prev,
                showTurnModal: false,
                showTrickPicker: true,
                trickPickerOptions: nextThree,
                players: prev.players.map((p) =>
                    p.id === currentPlayer.id
                        ? { ...p, skillCards: p.skillCards.filter((c) => c.id !== cardId) }
                        : p
                ),
            }));
        }
    };

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const activePlayers = gameState.players.filter((p) => !p.isEliminated);
    const playersToAttempt = activePlayers.filter((p) => !p.hasAttemptedCurrentTrick);

    const handleSkillCardClick = (cardId: string) => {
        setGameState((prev) => ({ ...prev, showTurnModal: false }));
        useSkillCard(cardId);
    };

    return {
        gameState,
        setGameState,
        usedTricks,
        setUsedTricks,
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
        nextPlayerForTrick,
        nextPlayer,
        useSkillCard,
        handleTrickSelect,
        resetGame,
        newGame,
        handleSkillCardClick,
    };
};