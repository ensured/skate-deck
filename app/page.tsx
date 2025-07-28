"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Play, RotateCcw, Target, X, Users, Check, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import gameStateCardSkeleton from "@/components/gameStateCardSkeleton"
import { trickCards } from "@/lib/tricks"

interface Player {
  id: number
  name: string
  letters: string[]
  isEliminated: boolean
  skillCards: SkillCard[]
  consecutiveTricks: number
  hasAttemptedCurrentTrick: boolean
}

export interface Trick {
  id: number
  name: string
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Pro"
  points: number
  description: string
}

interface SkillCard {
  id: string
  name: string
  description: string
  type: "hard-pass" | "bonus" | "defensive"
  icon: string
}

interface GameState {
  players: Player[]
  currentPlayerIndex: number
  gameStarted: boolean
  currentTrick: Trick | null
  gamePhase: "setting" | "attempting" | "game-over"
  winner: string | null
  showTurnModal: boolean
  roundNumber: number
  trickLeaderLanded: boolean
  leaderIndex: number | null
}

const SKATE_LETTERS = ["S", "K", "A", "T", "E"]


const availableSkillCards: SkillCard[] = [
  {
    id: "hard-pass",
    name: "Hard Pass",
    description: "Skip any trick without getting a letter",
    type: "hard-pass",
    icon: "🛡️",
  },
]

const difficultyColors: Record<Trick["difficulty"], string> = {
  Beginner: "bg-green-500",
  Intermediate: "bg-yellow-500",
  Advanced: "bg-orange-500",
  Pro: "bg-red-500",
}

// Validation functions
const isValidPlayer = (player: any): player is Player => {
  return (
    player &&
    typeof player === "object" &&
    typeof player.id === "number" &&
    typeof player.name === "string" &&
    player.name.length > 0 &&
    Array.isArray(player.letters) &&
    player.letters.every((l: any) => SKATE_LETTERS.includes(l)) &&
    typeof player.isEliminated === "boolean" &&
    Array.isArray(player.skillCards) &&
    player.skillCards.every(
      (card: any) =>
        card &&
        typeof card.id === "string" &&
        typeof card.name === "string" &&
        typeof card.description === "string" &&
        ["hard-pass", "bonus", "defensive"].includes(card.type) &&
        typeof card.icon === "string"
    ) &&
    typeof player.consecutiveTricks === "number" &&
    player.consecutiveTricks >= 0 &&
    typeof player.hasAttemptedCurrentTrick === "boolean"
  )
}

const isValidTrick = (trick: any): trick is Trick => {
  return (
    trick &&
    typeof trick === "object" &&
    trickCards.some(
      (t) =>
        t.id === trick.id &&
        t.name === trick.name &&
        t.description === trick.description &&
        t.difficulty === trick.difficulty &&
        t.points === trick.points
    )
  )
}

const isValidGameState = (state: any): state is GameState => {
  return (
    state &&
    typeof state === "object" &&
    Array.isArray(state.players) &&
    state.players.every(isValidPlayer) &&
    typeof state.currentPlayerIndex === "number" &&
    state.currentPlayerIndex >= 0 &&
    state.currentPlayerIndex < state.players.length &&
    typeof state.gameStarted === "boolean" &&
    (state.currentTrick === null || isValidTrick(state.currentTrick)) &&
    ["setting", "attempting", "game-over"].includes(state.gamePhase) &&
    (state.winner === null || typeof state.winner === "string") &&
    typeof state.showTurnModal === "boolean" &&
    typeof state.roundNumber === "number" &&
    state.roundNumber >= 1 &&
    typeof state.trickLeaderLanded === "boolean" &&
    (state.leaderIndex === null || (typeof state.leaderIndex === "number" && state.leaderIndex >= 0 && state.leaderIndex < state.players.length))
  )
}

export default function SkateboardCardGame() {
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

  const [gameState, setGameState] = useState<GameState>(defaultGameState)
  const [newPlayerName, setNewPlayerName] = useState("")
  const [usedTricks, setUsedTricks] = useState<number[]>([])
  const [localStorageLoading, setLocalStorageLoading] = useState<Boolean>(true)

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
          skillCards: [availableSkillCards[0]],
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
        skillCards: [availableSkillCards[0]],
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
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]

    if (cardId === "hard-pass") {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === currentPlayer.id
            ? { ...p, skillCards: p.skillCards.filter((card) => card.id !== cardId), consecutiveTricks: 0, hasAttemptedCurrentTrick: true }
            : p
        ),
        showTurnModal: false,
      }))

      if (!gameState.trickLeaderLanded) {
        nextPlayer()
      } else {
        nextPlayerForTrick()
      }
    }
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const activePlayers = gameState.players.filter((p) => !p.isEliminated)
  const playersToAttempt = activePlayers.filter((p) => !p.hasAttemptedCurrentTrick)

  const handleSkillCardClick = (cardId: string) => {
    setGameState((prev) => ({ ...prev, showTurnModal: false }))
    useSkillCard(cardId)
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 ">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2">
              The S.K.A.T.E. Deck
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300">
              Tricks, Flicks, and Epic Picks! 🛹
            </p>
          </div>

        </div>
        {localStorageLoading && gameStateCardSkeleton()}


        {!gameState.gameStarted ? (
          <div className="space-y-6">
            {localStorageLoading ? (null) :
              <Card className="bg-black/20 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Players
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Enter player name"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addPlayer()}
                      className="bg-gray-800 border-gray-600 text-white"
                      maxLength={20}
                    />
                    <Button
                      onClick={addPlayer}
                      disabled={!newPlayerName.trim() || gameState.players.length >= 8}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm">{gameState.players.length}/8 players • Need at least 2 to start</p>
                </CardContent>
              </Card>
            }
            {gameState.players.length > 0 && (
              <Card className="bg-black/20 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Players ({gameState.players.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {gameState.players.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                        <span className="text-white font-medium">
                          {index + 1}. {player.name}
                        </span>
                        <Button
                          onClick={() => removePlayer(player.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {gameState.players.length >= 2 && (
              <div className="text-center">
                <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
                  <Play className="h-5 w-5 mr-2" />
                  Start Game
                </Button>
              </div>
            )}
          </div>
        ) : gameState.gamePhase === "game-over" ? (
          <div className="text-center space-y-6">
            <Card className="bg-black/50 border-yellow-600 max-w-md mx-auto transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
                <p className="text-xl text-yellow-400 mb-4">{gameState.winner} Wins!</p>
                <p className="text-gray-300 mb-6">Completed {gameState.roundNumber - 1} rounds</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Play Again
                  </Button>
                  <Button
                    onClick={newGame}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
                  >
                    New Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card
              className="bg-black/20  hover:bg-black/30  border-blue-600 hover:border-blue-500 transition-all duration-300 cursor-pointer"
              onClick={() => setGameState((prev) => ({ ...prev, showTurnModal: true }))}
            >
              <CardHeader>
                <CardTitle className="text-white text-center flex items-center justify-center gap-2">
                  <Target className="h-6 w-6" />
                  Round {gameState.roundNumber}
                  <Users className="h-5 w-5 ml-2" />
                  {activePlayers.length} players left
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-gray-300 mb-2">
                    Current trick: <span className="text-blue-400 font-semibold">{gameState.currentTrick?.name}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    {gameState.trickLeaderLanded
                      ? `${playersToAttempt.length} player${playersToAttempt.length !== 1 ? "s" : ""} still need to attempt this trick`
                      : `${currentPlayer?.name} to set the trick`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Dialog
              open={gameState.showTurnModal}
              onOpenChange={(isOpen) => setGameState((prev) => ({ ...prev, showTurnModal: isOpen }))}
            >
              <DialogContent className="bg-gray-900 border-gray-600 text-white max-w-md transition-all duration-300">
                <DialogHeader>
                  <DialogTitle className="text-center">
                    <span className="text-2xl text-yellow-400 flex items-center justify-center gap-2">
                      {currentPlayer?.name}'s Turn
                    </span>
                  </DialogTitle>
                </DialogHeader>

                {gameState.currentTrick && (
                  <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-blue-500 transition-all duration-300">
                      <CardHeader className="text-center">
                        <CardTitle className="text-white text-2xl">{gameState.currentTrick.name}</CardTitle>
                        <Badge
                          className={`${difficultyColors[gameState.currentTrick?.difficulty ?? "Beginner"]} text-white w-fit mx-auto`}
                        >
                          {gameState.currentTrick?.difficulty ?? "N/A"}
                        </Badge>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-gray-300 mb-4">{gameState.currentTrick.description}</p>
                      </CardContent>
                    </Card>

                    <div className="flex gap-8 justify-between px-8">
                      <Button
                        onClick={landTrick}
                        className="bg-green-600 hover:bg-green-700 flex-1 h-24 transition-all duration-300"
                        size="lg"
                      >
                        <Check className="!h-10 !w-10" />
                      </Button>
                      <Button
                        onClick={missTrick}
                        className="bg-red-600/80 hover:bg-red-700/80 flex-1 h-24 transition-all duration-300"
                        size="lg"
                      >
                        <X className="!h-10 !w-10" />
                      </Button>
                    </div>

                    {currentPlayer?.skillCards && currentPlayer.skillCards.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-center text-lg font-semibold text-blue-400">Skill Cards</h3>
                        <div className="flex gap-2 justify-center">
                          {currentPlayer.skillCards.map((card) => (
                            <div
                              key={card.id}
                              onClick={() => handleSkillCardClick(card.id)}
                              className="bg-purple-900/50 border border-purple-500 cursor-pointer hover:bg-purple-800/50 transition-all duration-300 rounded-lg"
                            >
                              <div className="p-3 text-center">
                                <div className="text-2xl mb-1">{card.icon}</div>
                                <div className="text-white font-semibold text-sm">{card.name}</div>
                                <div className="text-gray-300 text-xs">{card.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Your current letters:</p>
                      <div className="flex gap-1 justify-center">
                        {SKATE_LETTERS.map((letter, index) => (
                          <div
                            key={letter}
                            className={`w-8 h-8 rounded border-2 flex items-center justify-center font-bold transition-all duration-300 ${index < (currentPlayer?.letters.length || 0)
                              ? "bg-red-600 border-red-500 text-white"
                              : "bg-gray-700 border-gray-600 text-gray-400"
                              }`}
                          >
                            {letter}
                          </div>
                        ))}
                      </div>
                      {gameState.currentPlayerIndex === gameState.leaderIndex && (
                        <p className="text-gray-400 text-sm mt-2">
                          Consecutive Tricks: {currentPlayer?.consecutiveTricks || 0}/3
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Card className="bg-black/20 border-gray-600 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Players Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gameState.players.map((player) => (
                    <div
                      key={player.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${player.isEliminated
                        ? "bg-red-900/20 border-red-600"
                        : player.id === currentPlayer?.id
                          ? "bg-blue-900/30 border-blue-500"
                          : "bg-gray-800 border-gray-600"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold ${player.isEliminated ? "text-red-400" : "text-white"}`}>
                          {player.name}
                        </span>
                        <div className="flex gap-1">
                          {player.id === currentPlayer?.id && !player.isEliminated && (
                            <Badge className="bg-blue-600 text-white text-xs">Current</Badge>
                          )}
                          {player.isEliminated && <Badge className="bg-red-600 text-white text-xs">Out</Badge>}
                          {!player.isEliminated && player.hasAttemptedCurrentTrick && gameState.trickLeaderLanded && (
                            <Badge className="bg-green-600 text-white text-xs">✓</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {SKATE_LETTERS.map((letter, index) => (
                          <div
                            key={letter}
                            className={`w-8 h-8 rounded border-2 flex items-center justify-center font-bold transition-all duration-300 ${index < player.letters.length
                              ? "bg-red-600 border-red-500 text-white"
                              : "bg-gray-700 border-gray-600 text-gray-400"
                              }`}
                          >
                            {letter}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2">
                        <p className="text-gray-400 text-sm">
                          Consecutive Tricks: {player.consecutiveTricks}/3
                        </p>
                        {player.skillCards.length > 0 && (
                          <div className="mt-2 flex gap-1">
                            {player.skillCards.map((card, index) => (
                              <div
                                key={index}
                                className="text-xs bg-purple-600 text-white px-2 py-1 rounded flex items-center gap-1"
                              >
                                <span>{card.icon}</span>
                                <span>{card.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={resetGame}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 bg-transparent transition-all duration-300"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Game
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}