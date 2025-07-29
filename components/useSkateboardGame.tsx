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
    }
    const [gameState, setGameState] = useState<GameState>(defaultGameState);
    const [usedTricks, setUsedTricks] = useState<number[]>([]);
    const [newPlayerName, setNewPlayerName] = useState("")
    const [localStorageLoading, setLocalStorageLoading] = useState<boolean>(true);

    // Load from localStorage on client mount
    useEffect(() => {
        if (typeof window === "undefined" || !window.localStorage) return

        const loadGameFromStorage = () => {
            try {
                const saved = localStorage.getItem("skateboardGameState")
                if (saved) {
                    const parsed = JSON.parse(saved)
                    if (
                        parsed &&
                        isValidGameState(parsed.gameState) &&
                        Array.isArray(parsed.usedTricks) &&
                        parsed.usedTricks.every((id: any) => typeof id === "number" && trickCards.some((t) => t.id === id))
                    ) {
                        setGameState(parsed.gameState)
                        setUsedTricks(parsed.usedTricks)
                    }
                }
            } catch (error) {
                console.error("Failed to load game state from localStorage:", error)
            } finally {
                setLocalStorageLoading(false)

            }
        }

        loadGameFromStorage()
    }, [])

    // Save to localStorage on state updates
    useEffect(() => {
        if (typeof window === "undefined" || !window.localStorage) return

        try {
            localStorage.setItem("skateboardGameState", JSON.stringify({ gameState, usedTricks }))
        } catch (error) {
            console.error("Failed to save game state to localStorage:", error)
        }
    }, [gameState, usedTricks])

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
                    },
                ],
            }))
            setNewPlayerName("")
        }
    }



    const removePlayer = (playerId: number) => {
        setGameState((prev) => ({
            ...prev,
            players: prev.players.filter((p) => p.id !== playerId),
        }))
    }

    const startGame = () => {
        if (gameState.players.length >= 2) {
            const randomFirstPlayer = Math.floor(Math.random() * gameState.players.length)
            setGameState((prev) => ({
                ...prev,
                gameStarted: true,
                currentPlayerIndex: randomFirstPlayer,
                gamePhase: "setting",
                players: prev.players.map((player) => ({
                    ...player,
                    skillCards: [skillCards[0], skillCards[1]],
                    consecutiveTricks: 0,
                    hasAttemptedCurrentTrick: false,
                })),
            }))
            drawRandomTrick(randomFirstPlayer)
        }
    }

    const drawRandomTrick = (playerIndex: number) => {
        setGameState((prev) => {
            if (prev.gamePhase === "game-over") return prev

            const availableTricks = trickCards.filter((trick) => !usedTricks.includes(trick.id))

            if (availableTricks.length === 0) {
                setUsedTricks([])
                const randomTrick = trickCards[Math.floor(Math.random() * trickCards.length)]
                setUsedTricks([randomTrick.id])
                return {
                    ...prev,
                    currentTrick: randomTrick,
                    currentPlayerIndex: playerIndex,
                    showTurnModal: true,
                    gamePhase: "attempting",
                    roundNumber: prev.roundNumber + 1,
                    trickLeaderLanded: false,
                    leaderIndex: playerIndex,
                    players: prev.players.map((p) => ({ ...p, hasAttemptedCurrentTrick: false })),
                }
            }

            const randomTrick = availableTricks[Math.floor(Math.random() * availableTricks.length)]
            setUsedTricks((prev) => [...prev, randomTrick.id])

            return {
                ...prev,
                currentTrick: randomTrick,
                currentPlayerIndex: playerIndex,
                showTurnModal: true,
                gamePhase: "attempting",
                roundNumber: prev.roundNumber + 1,
                trickLeaderLanded: false,
                leaderIndex: playerIndex,
                players: prev.players.map((p) => ({ ...p, hasAttemptedCurrentTrick: false })),
            }
        })
    }

    const landTrick = () => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex]

        setGameState((prev) => {
            const isLeader = prev.currentPlayerIndex === prev.leaderIndex
            const updatedPlayers = prev.players.map((p) =>
                p.id === currentPlayer.id
                    ? {
                        ...p,
                        consecutiveTricks: isLeader ? p.consecutiveTricks + 1 : p.consecutiveTricks,
                        hasAttemptedCurrentTrick: true,
                    }
                    : p
            )

            const activePlayers = updatedPlayers.filter((p) => !p.isEliminated)

            if (activePlayers.length <= 1) {
                return {
                    ...prev,
                    players: updatedPlayers,
                    gamePhase: "game-over",
                    winner: activePlayers.length === 1 ? activePlayers[0].name : null,
                    showTurnModal: false,
                    currentTrick: null,
                }
            }

            return {
                ...prev,
                players: updatedPlayers,
                showTurnModal: false,
                trickLeaderLanded: isLeader ? true : prev.trickLeaderLanded,
            }
        })

        nextPlayerForTrick()
    }

    const missTrick = () => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex]
        const newLetters = [...currentPlayer.letters, SKATE_LETTERS[currentPlayer.letters.length]]
        const isEliminated = newLetters.length >= 5

        setGameState((prev) => {
            const updatedPlayers = prev.players.map((p) =>
                p.id === currentPlayer.id
                    ? { ...p, letters: newLetters, isEliminated, consecutiveTricks: 0, hasAttemptedCurrentTrick: true }
                    : p
            )

            const activePlayers = updatedPlayers.filter((p) => !p.isEliminated)

            if (activePlayers.length <= 1) {
                return {
                    ...prev,
                    players: updatedPlayers,
                    gamePhase: "game-over",
                    winner: activePlayers.length === 1 ? activePlayers[0].name : null,
                    showTurnModal: false,
                    currentTrick: null,
                }
            }

            return {
                ...prev,
                players: updatedPlayers,
                showTurnModal: false,
            }
        })

        if (!gameState.trickLeaderLanded) {
            nextPlayer()
        } else {
            nextPlayerForTrick()
        }
    }

    const nextPlayerForTrick = () => {
        setGameState((prev) => {
            if (prev.gamePhase === "game-over") return prev

            const activePlayers = prev.players.filter((p) => !p.isEliminated)
            const playersToAttempt = activePlayers.filter((p) => !p.hasAttemptedCurrentTrick)

            if (!prev.trickLeaderLanded || playersToAttempt.length === 0) {
                if (prev.trickLeaderLanded && prev.leaderIndex !== null) {
                    const leader = prev.players[prev.leaderIndex]
                    if (!leader.isEliminated && leader.consecutiveTricks < 3) {
                        drawRandomTrick(prev.leaderIndex)
                        return {
                            ...prev,
                            currentPlayerIndex: prev.leaderIndex,
                            showTurnModal: true,
                        }
                    } else {
                        let nextIndex = (prev.leaderIndex + 1) % prev.players.length
                        while (prev.players[nextIndex].isEliminated) {
                            nextIndex = (nextIndex + 1) % prev.players.length
                        }
                        drawRandomTrick(nextIndex)
                        return {
                            ...prev,
                            currentPlayerIndex: nextIndex,
                            players: prev.players.map((p) => ({ ...p, consecutiveTricks: 0 })),
                            showTurnModal: true,
                        }
                    }
                }
                return prev
            }

            let nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length
            while (prev.players[nextIndex].isEliminated || prev.players[nextIndex].hasAttemptedCurrentTrick) {
                nextIndex = (nextIndex + 1) % prev.players.length
            }

            return {
                ...prev,
                currentPlayerIndex: nextIndex,
                showTurnModal: true,
            }
        })
    }

    const nextPlayer = () => {
        setGameState((prev) => {
            if (prev.gamePhase === "game-over") return prev

            const activePlayers = prev.players.filter((p) => !p.isEliminated)
            if (activePlayers.length <= 1) {
                return {
                    ...prev,
                    gamePhase: "game-over",
                    winner: activePlayers.length === 1 ? activePlayers[0].name : null,
                    showTurnModal: false,
                    currentTrick: null,
                    leaderIndex: null,
                }
            }

            let nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length
            while (prev.players[nextIndex].isEliminated) {
                nextIndex = (nextIndex + 1) % prev.players.length
            }

            const updatedPlayers = prev.players.map((p) => ({
                ...p,
                consecutiveTricks: 0,
                hasAttemptedCurrentTrick: false,
            }))

            drawRandomTrick(nextIndex)

            return {
                ...prev,
                players: updatedPlayers,
                currentPlayerIndex: nextIndex,
                trickLeaderLanded: false,
                leaderIndex: nextIndex,
                showTurnModal: true,
            }
        })
    }

    const resetGame = () => {
        setGameState({
            players: gameState.players.map((p) => ({
                ...p,
                letters: [],
                isEliminated: false,
                skillCards: [skillCards[0], skillCards[1]],
                consecutiveTricks: 0,
                hasAttemptedCurrentTrick: false,
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
        })
        setUsedTricks([])
        if (typeof window !== "undefined" && window.localStorage) {
            localStorage.removeItem("skateboardGameState")
        }
    }

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
        })
        setUsedTricks([])
        if (typeof window !== "undefined" && window.localStorage) {
            localStorage.removeItem("skateboardGameState")
        }
    }

    const useSkillCard = (cardId: string) => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];

        if (cardId === "hard-pass") {
            setGameState((prev) => ({
                ...prev,
                players: prev.players.map((p) =>
                    p.id === currentPlayer.id
                        ? { ...p, skillCards: p.skillCards.filter((card) => card.id !== cardId), consecutiveTricks: 0, hasAttemptedCurrentTrick: true }
                        : p
                ),
                showTurnModal: false,
            }));

            if (!gameState.trickLeaderLanded) {
                nextPlayer();
            } else {
                nextPlayerForTrick();
            }
        }

        if (cardId === "trick-swap") {
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

                // Update players: remove skill card, reset hasAttemptedCurrentTrick for all (including current player)
                const updatedPlayers = prev.players.map((p) =>
                    p.id === currentPlayer.id
                        ? { ...p, skillCards: p.skillCards.filter((card) => card.id !== cardId), hasAttemptedCurrentTrick: false }
                        : { ...p, hasAttemptedCurrentTrick: false }
                );

                return {
                    ...prev,
                    players: updatedPlayers,
                    currentTrick: newTrick,
                    currentPlayerIndex: prev.currentPlayerIndex, // Stay on current player
                    trickLeaderLanded: false,
                    leaderIndex: prev.currentPlayerIndex, // Current player is the leader
                    showTurnModal: true, // Keep dialog open for current player's attempt
                    gamePhase: "attempting",
                    roundNumber: prev.roundNumber + 1,
                };
            });
        }
    };

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    const activePlayers = gameState.players.filter((p) => !p.isEliminated)
    const playersToAttempt = activePlayers.filter((p) => !p.hasAttemptedCurrentTrick)

    const handleSkillCardClick = (cardId: string) => {
        setGameState((prev) => ({ ...prev, showTurnModal: false }))
        useSkillCard(cardId)
    }

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
        resetGame,
        newGame,
        handleSkillCardClick
    };
};