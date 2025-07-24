"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Play, RotateCcw, Target, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Player {
  id: number
  name: string
  letters: string[]
  isEliminated: boolean
  skillCards: SkillCard[]
}

// Add skill card interface after the Player interface
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
  currentTrick: any | null
  gamePhase: "setting" | "attempting" | "game-over"
  winner: string | null
  showTurnModal: boolean
}

const SKATE_LETTERS = ["S", "K", "A", "T", "E"]

const trickCards = [
  {
    id: 1,
    name: "Ollie",
    difficulty: "Beginner",
    points: 10,
    description: "The foundation of all skateboarding tricks",
    stance: "Regular",
  },
  {
    id: 2,
    name: "Kickflip",
    difficulty: "Intermediate",
    points: 25,
    description: "Board flips along the length axis",
    stance: "Regular",
  },
  {
    id: 3,
    name: "Heelflip",
    difficulty: "Intermediate",
    points: 25,
    description: "Board flips opposite to kickflip",
    stance: "Regular",
  },
  {
    id: 4,
    name: "Pop Shuvit",
    difficulty: "Beginner",
    points: 15,
    description: "Board spins 180° horizontally",
    stance: "Regular",
  },
  {
    id: 5,
    name: "360 Flip",
    difficulty: "Advanced",
    points: 50,
    description: "Combines kickflip and 360 shuvit",
    stance: "Regular",
  },
  {
    id: 6,
    name: "Hardflip",
    difficulty: "Advanced",
    points: 45,
    description: "Frontside shuvit with kickflip",
    stance: "Regular",
  },
  {
    id: 7,
    name: "Varial Flip",
    difficulty: "Intermediate",
    points: 30,
    description: "Shuvit combined with kickflip",
    stance: "Regular",
  },
  {
    id: 8,
    name: "Impossible",
    difficulty: "Pro",
    points: 75,
    description: "Board wraps around back foot",
    stance: "Regular",
  },
  {
    id: 9,
    name: "Laser Flip",
    difficulty: "Pro",
    points: 80,
    description: "360 heelflip underflip",
    stance: "Regular",
  },
  {
    id: 10,
    name: "Casper Slide",
    difficulty: "Advanced",
    points: 40,
    description: "Slide on the tail with board vertical",
    stance: "Regular",
  },
  {
    id: 11,
    name: "Primo Slide",
    difficulty: "Advanced",
    points: 35,
    description: "Balance on the edge of the board",
    stance: "Regular",
  },
  {
    id: 12,
    name: "Darkslide",
    difficulty: "Pro",
    points: 70,
    description: "Slide on the grip tape",
    stance: "Regular",
  },
]

// Add skill cards definition after trickCards
const availableSkillCards: SkillCard[] = [
  {
    id: "hard-pass",
    name: "Hard Pass",
    description: "Skip any trick without getting a letter",
    type: "hard-pass",
    icon: "🛡️",
  },
]

const difficultyColors = {
  Beginner: "bg-green-500",
  Intermediate: "bg-yellow-500",
  Advanced: "bg-orange-500",
  Pro: "bg-red-500",
}

export default function SkateboardCardGame() {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    gameStarted: false,
    currentTrick: null,
    gamePhase: "setting",
    winner: null,
    showTurnModal: false,
  })
  const [newPlayerName, setNewPlayerName] = useState("")
  const [trickInput, setTrickInput] = useState("")

  // Update the addPlayer function to include skillCards
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

  // Update startGame function to give starting skill cards
  const startGame = () => {
    if (gameState.players.length >= 2) {
      // Randomly select first player
      const randomFirstPlayer = Math.floor(Math.random() * gameState.players.length)

      setGameState((prev) => ({
        ...prev,
        gameStarted: true,
        currentPlayerIndex: randomFirstPlayer,
        gamePhase: "setting",
        players: prev.players.map((player) => ({
          ...player,
          skillCards: [availableSkillCards[0]], // Give everyone a Hard Pass card to start
        })),
      }))

      // Draw first trick card
      drawRandomTrick(randomFirstPlayer)
    }
  }

  const drawRandomTrick = (playerIndex: number) => {
    const randomTrick = trickCards[Math.floor(Math.random() * trickCards.length)]

    setGameState((prev) => ({
      ...prev,
      currentTrick: randomTrick,
      currentPlayerIndex: playerIndex,
      showTurnModal: true,
    }))
  }

  const landTrick = () => {
    setGameState((prev) => ({
      ...prev,
      showTurnModal: false,
    }))
    nextPlayer()
  }

  const missTrick = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    const newLetters = [...currentPlayer.letters, SKATE_LETTERS[currentPlayer.letters.length]]
    const isEliminated = newLetters.length >= 5

    setGameState((prev) => {
      const updatedPlayers = prev.players.map((p) =>
        p.id === currentPlayer.id ? { ...p, letters: newLetters, isEliminated } : p,
      )

      const activePlayers = updatedPlayers.filter((p) => !p.isEliminated)

      if (activePlayers.length === 1) {
        return {
          ...prev,
          players: updatedPlayers,
          gamePhase: "game-over",
          winner: activePlayers[0].name,
          showTurnModal: false,
        }
      }

      return {
        ...prev,
        players: updatedPlayers,
        showTurnModal: false,
      }
    })

    nextPlayer()
  }

  const nextPlayer = () => {
    setGameState((prev) => {
      const activePlayers = prev.players.filter((p) => !p.isEliminated)
      if (activePlayers.length <= 1) return prev

      let nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length

      // Skip eliminated players
      while (prev.players[nextIndex].isEliminated) {
        nextIndex = (nextIndex + 1) % prev.players.length
      }

      return {
        ...prev,
        currentPlayerIndex: nextIndex,
        gamePhase: "setting",
        currentTrick: null,
      }
    })

    // Draw trick for next player after state update
    setTimeout(() => {
      const activePlayers = gameState.players.filter((p) => !p.isEliminated)
      if (activePlayers.length > 1) {
        let nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length
        while (gameState.players[nextIndex].isEliminated) {
          nextIndex = (nextIndex + 1) % gameState.players.length
        }
        drawRandomTrick(nextIndex)
      }
    }, 500)
  }

  // Update resetGame to reset skill cards
  const resetGame = () => {
    setGameState({
      players: gameState.players.map((p) => ({
        ...p,
        letters: [],
        isEliminated: false,
        skillCards: [availableSkillCards[0]], // Give everyone a Hard Pass card again
      })),
      currentPlayerIndex: 0,
      gameStarted: false,
      currentTrick: null,
      gamePhase: "setting",
      winner: null,
      showTurnModal: false,
    })
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
    })
  }

  // Add function to use a skill card
  const useSkillCard = (cardId: string) => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]

    if (cardId === "hard-pass") {
      // Remove the card from player's hand
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === currentPlayer.id ? { ...p, skillCards: p.skillCards.filter((card) => card.id !== cardId) } : p,
        ),
        showTurnModal: false,
      }))

      // Move to next player without getting a letter
      nextPlayer()
    }
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const activePlayers = gameState.players.filter((p) => !p.isEliminated)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🛹 S.K.A.T.E.</h1>
          <p className="text-gray-300">The classic skateboarding elimination game</p>
        </div>

        {!gameState.gameStarted ? (
          /* Setup Phase */
          <div className="space-y-6">
            {/* Add Players */}
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

            {/* Players List */}
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

            {/* Start Game */}
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
          /* Game Over */
          <div className="text-center space-y-6">
            <Card className="bg-black/40 border-yellow-600 max-w-md mx-auto">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
                <p className="text-xl text-yellow-400 mb-6">{gameState.winner} Wins!</p>
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
          /* Game Phase */
          <div className="space-y-6">
            {/* Current Game Status */}
            <Card className="bg-black/20 border-blue-600">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  <Target className="h-6 w-6 inline mr-2" />
                  Game in Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-300">{activePlayers.length} players remaining</p>
              </CardContent>
            </Card>

            {/* Turn Modal */}
            <Dialog open={gameState.showTurnModal} onOpenChange={() => {}}>
              <DialogContent className="bg-gray-900 border-gray-600 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl">{currentPlayer?.name}'s Turn</DialogTitle>
                </DialogHeader>

                {gameState.currentTrick && (
                  <div className="space-y-6">
                    {/* Trick Card */}
                    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-blue-500">
                      <CardHeader className="text-center">
                        <CardTitle className="text-white text-2xl">{gameState.currentTrick.name}</CardTitle>
                        <Badge
                          className={`${difficultyColors[gameState.currentTrick.difficulty]} text-white w-fit mx-auto`}
                        >
                          {gameState.currentTrick.difficulty}
                        </Badge>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-gray-300 mb-4">{gameState.currentTrick.description}</p>
                        <div className="text-yellow-400 font-bold text-lg">{gameState.currentTrick.points} points</div>
                      </CardContent>
                    </Card>

                    {/* Skill Cards */}
                    {currentPlayer?.skillCards && currentPlayer.skillCards.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-center text-lg font-semibold text-blue-400">Your Skill Cards</h3>
                        <div className="flex gap-2 justify-center">
                          {currentPlayer.skillCards.map((card) => (
                            <Card
                              key={card.id}
                              className="bg-purple-900/50 border-purple-500 cursor-pointer hover:bg-purple-800/50 transition-colors"
                              onClick={() => useSkillCard(card.id)}
                            >
                              <CardContent className="p-3 text-center">
                                <div className="text-2xl mb-1">{card.icon}</div>
                                <div className="text-white font-semibold text-sm">{card.name}</div>
                                <div className="text-gray-300 text-xs">{card.description}</div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <p className="text-center text-gray-400 text-sm">Click a card to use it</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                      <Button onClick={landTrick} className="bg-green-600 hover:bg-green-700 flex-1">
                        ✅ Landed It!
                      </Button>
                      <Button onClick={missTrick} className="bg-red-600 hover:bg-red-700 flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Missed
                      </Button>
                    </div>

                    {/* Player's Current Letters */}
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Your current letters:</p>
                      <div className="flex gap-1 justify-center">
                        {SKATE_LETTERS.map((letter, index) => (
                          <div
                            key={letter}
                            className={`w-8 h-8 rounded border-2 flex items-center justify-center font-bold ${
                              index < (currentPlayer?.letters.length || 0)
                                ? "bg-red-600 border-red-500 text-white"
                                : "bg-gray-700 border-gray-600 text-gray-400"
                            }`}
                          >
                            {letter}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Players Status */}
            <Card className="bg-black/20 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Players Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gameState.players.map((player) => (
                    <div
                      key={player.id}
                      className={`p-4 rounded-lg border-2 ${
                        player.isEliminated
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
                        {player.id === currentPlayer?.id && !player.isEliminated && (
                          <Badge className="bg-blue-600 text-white">Current</Badge>
                        )}
                        {player.isEliminated && <Badge className="bg-red-600 text-white">Out</Badge>}
                      </div>
                      <div className="flex gap-1">
                        {SKATE_LETTERS.map((letter, index) => (
                          <div
                            key={letter}
                            className={`w-8 h-8 rounded border-2 flex items-center justify-center font-bold ${
                              index < player.letters.length
                                ? "bg-red-600 border-red-500 text-white"
                                : "bg-gray-700 border-gray-600 text-gray-400"
                            }`}
                          >
                            {letter}
                          </div>
                        ))}
                      </div>
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
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Controls */}
            <div className="text-center">
              <Button
                onClick={resetGame}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
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
