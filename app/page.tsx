"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Play, RotateCcw, Target, X, Users, Shuffle, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Player {
  id: number
  name: string
  letters: string[]
  isEliminated: boolean
  skillCards: SkillCard[]
  hasAttemptedCurrentTrick: boolean
}

interface Trick {
  id: number;
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Pro";
  points: number;
  description: string;
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
  players: Player[];
  currentPlayerIndex: number;
  gameStarted: boolean;
  currentTrick: Trick | null;
  gamePhase: "setting" | "attempting" | "game-over";
  winner: string | null;
  showTurnModal: boolean;
  roundNumber: number;
}



const SKATE_LETTERS = ["S", "K", "A", "T", "E"]

const trickCards: Trick[] = [
  // Basic Ollies
  {
    id: 1,
    name: "Ollie",
    difficulty: "Beginner",
    points: 10,
    description: "The foundation of all skateboarding tricks",
  },
  {
    id: 2,
    name: "Nollie",
    difficulty: "Intermediate",
    points: 20,
    description: "Ollie off the nose",
  },
  {
    id: 3,
    name: "Fakie Ollie",
    difficulty: "Beginner",
    points: 12,
    description: "Ollie while riding fakie",
  },
  {
    id: 4,
    name: "Switch Ollie",
    difficulty: "Intermediate",
    points: 18,
    description: "Ollie in switch stance",
  },

  // Shove-Its
  {
    id: 5,
    name: "Frontside Pop Shove-It",
    difficulty: "Beginner",
    points: 15,
    description: "Board spins 180° frontside",

  },
  {
    id: 6,
    name: "Backside Pop Shove-It",
    difficulty: "Beginner",
    points: 15,
    description: "Board spins 180° backside",
  },
  {
    id: 7,
    name: "Nollie Shove-It",
    difficulty: "Intermediate",
    points: 22,
    description: "Shove-it from nollie position",
  },
  {
    id: 8,
    name: "Fakie Shove-It",
    difficulty: "Beginner",
    points: 16,
    description: "Shove-it while riding fakie",
  },
  {
    id: 9,
    name: "Switch Pop Shove-It",
    difficulty: "Intermediate",
    points: 20,
    description: "Shove-it in switch stance",
  },
  {
    id: 10,
    name: "Nollie Pop Shove-It",
    difficulty: "Intermediate",
    points: 24,
    description: "Pop shove-it from nollie",

  },
  {
    id: 11,
    name: "Fakie Pop Shove-It",
    difficulty: "Intermediate",
    points: 18,
    description: "Pop shove-it while riding fakie",
  },

  // 180s
  {
    id: 12,
    name: "Frontside 180",
    difficulty: "Intermediate",
    points: 20,
    description: "180° frontside turn",
  },
  {
    id: 13,
    name: "Backside 180",
    difficulty: "Intermediate",
    points: 20,
    description: "180° backside turn",
  },
  {
    id: 14,
    name: "Nollie Frontside 180",
    difficulty: "Advanced",
    points: 35,
    description: "Frontside 180 from nollie",
  },
  {
    id: 15,
    name: "Nollie Backside 180",
    difficulty: "Advanced",
    points: 35,
    description: "Backside 180 from nollie",

  },
  {
    id: 16,
    name: "Fakie Frontside 180",
    difficulty: "Intermediate",
    points: 22,
    description: "Frontside 180 from fakie",

  },
  {
    id: 17,
    name: "Fakie Backside 180",
    difficulty: "Intermediate",
    points: 22,
    description: "Backside 180 from fakie",

  },
  {
    id: 18,
    name: "Switch Frontside 180",
    difficulty: "Advanced",
    points: 30,
    description: "Frontside 180 in switch stance",

  },
  {
    id: 19,
    name: "Switch Backside 180",
    difficulty: "Advanced",
    points: 30,
    description: "Backside 180 in switch stance",

  },
  {
    id: 20,
    name: "Frontside Half-Cab",
    difficulty: "Intermediate",
    points: 25,
    description: "Fakie frontside 180",

  },
  {
    id: 21,
    name: "Backside Half-Cab",
    difficulty: "Intermediate",
    points: 25,
    description: "Fakie backside 180",

  },

  // Flip Tricks
  {
    id: 22,
    name: "Kickflip",
    difficulty: "Intermediate",
    points: 25,
    description: "Board flips along the length axis",

  },
  {
    id: 23,
    name: "Heelflip",
    difficulty: "Intermediate",
    points: 25,
    description: "Board flips opposite to kickflip",

  },
  {
    id: 24,
    name: "Frontside Kickflip",
    difficulty: "Advanced",
    points: 40,
    description: "Kickflip with frontside body rotation",

  },
  {
    id: 25,
    name: "Backside Kickflip",
    difficulty: "Advanced",
    points: 40,
    description: "Kickflip with backside body rotation",

  },
  {
    id: 26,
    name: "Nollie Kickflip",
    difficulty: "Advanced",
    points: 45,
    description: "Kickflip from nollie position",
  },
  {
    id: 27,
    name: "Fakie Kickflip",
    difficulty: "Advanced",
    points: 42,
    description: "Kickflip while riding fakie",
  },
  {
    id: 28,
    name: "Switch Kickflip",
    difficulty: "Advanced",
    points: 38,
    description: "Kickflip in switch stance",
  },
  {
    id: 29,
    name: "Nollie Heelflip",
    difficulty: "Advanced",
    points: 45,
    description: "Heelflip from nollie position",
  },
  {
    id: 30,
    name: "Fakie Heelflip",
    difficulty: "Advanced",
    points: 42,
    description: "Heelflip while riding fakie",
  },
  {
    id: 31,
    name: "Switch Heelflip",
    difficulty: "Advanced",
    points: 38,
    description: "Heelflip in switch stance",

  },
  {
    id: 32,
    name: "Varial Kickflip",
    difficulty: "Intermediate",
    points: 30,
    description: "Shove-it combined with kickflip",

  },
  {
    id: 33,
    name: "Varial Heelflip",
    difficulty: "Intermediate",
    points: 30,
    description: "Frontside shove-it with heelflip",
  },

  // Slides
  {
    id: 34,
    name: "Frontside Boardslide",
    difficulty: "Intermediate",
    points: 26,
    description: "Slide frontside on the middle of board",
  },
  {
    id: 35,
    name: "Backside Boardslide",
    difficulty: "Intermediate",
    points: 26,
    description: "Slide backside on the middle of board",
  },
  {
    id: 36,
    name: "Frontside Noseslide",
    difficulty: "Advanced",
    points: 35,
    description: "Slide on the nose frontside",
  },
  {
    id: 37,
    name: "Backside Noseslide",
    difficulty: "Advanced",
    points: 35,
    description: "Slide on the nose backside",
  },
  {
    id: 38,
    name: "Frontside Tailslide",
    difficulty: "Advanced",
    points: 35,
    description: "Slide on the tail frontside",
  },
  {
    id: 39,
    name: "Backside Tailslide",
    difficulty: "Advanced",
    points: 35,
    description: "Slide on the tail backside",
  },
  {
    id: 40,
    name: "Frontside Lipslide",
    difficulty: "Advanced",
    points: 38,
    description: "Lipslide approached frontside",
  },
  {
    id: 41,
    name: "Backside Lipslide",
    difficulty: "Advanced",
    points: 38,
    description: "Lipslide approached backside",
  },
  {
    id: 42,
    name: "Frontside Noseblunt Slide",
    difficulty: "Pro",
    points: 55,
    description: "Noseblunt slide frontside",
  },
  {
    id: 43,
    name: "Backside Noseblunt Slide",
    difficulty: "Pro",
    points: 55,
    description: "Noseblunt slide backside",
  },

  // Grinds
  {
    id: 44,
    name: "50-50 Grind",
    difficulty: "Intermediate",
    points: 22,
    description: "Grind on both trucks",
  },
  {
    id: 45,
    name: "Nosegrind",
    difficulty: "Intermediate",
    points: 24,
    description: "Grind on front truck only",
  },
  {
    id: 46,
    name: "5-0 Grind",
    difficulty: "Intermediate",
    points: 24,
    description: "Grind on back truck only",
  },
  {
    id: 47,
    name: "Frontside Feeble Grind",
    difficulty: "Advanced",
    points: 38,
    description: "Feeble grind approached frontside",
  },
  {
    id: 48,
    name: "Backside Feeble Grind",
    difficulty: "Advanced",
    points: 38,
    description: "Feeble grind approached backside",
  },
  {
    id: 49,
    name: "Frontside Smith Grind",
    difficulty: "Advanced",
    points: 38,
    description: "Smith grind approached frontside",
  },
  {
    id: 50,
    name: "Backside Smith Grind",
    difficulty: "Advanced",
    points: 38,
    description: "Smith grind approached backside",
  },
  {
    id: 51,
    name: "Crooked Grind",
    difficulty: "Advanced",
    points: 40,
    description: "Front truck over, back truck grinds",
  },
  {
    id: 52,
    name: "Frontside 5-0 Grind",
    difficulty: "Advanced",
    points: 32,
    description: "5-0 grind approached frontside",
  },
  {
    id: 53,
    name: "Backside 5-0 Grind",
    difficulty: "Advanced",
    points: 32,
    description: "5-0 grind approached backside",

  },
  {
    id: 54,
    name: "Frontside Crooked Grind",
    difficulty: "Advanced",
    points: 42,
    description: "Crooked grind approached frontside",

  },
  {
    id: 55,
    name: "Backside Crooked Grind",
    difficulty: "Advanced",
    points: 42,
    description: "Crooked grind approached backside",

  },
  {
    id: 56,
    name: "Salad Grind",
    difficulty: "Advanced",
    points: 45,
    description: "Crooked grind with tweaked style",

  },
  {
    id: 57,
    name: "Frontside Nosegrind",
    difficulty: "Advanced",
    points: 32,
    description: "Nosegrind approached frontside",
  },
  {
    id: 58,
    name: "Backside Nosegrind",
    difficulty: "Advanced",
    points: 32,
    description: "Nosegrind approached backside",
  },

  // Stalls
  {
    id: 59,
    name: "Axle Stall",
    difficulty: "Beginner",
    points: 15,
    description: "Stall on both trucks",
  },
  {
    id: 60,
    name: "Nose Stall",
    difficulty: "Beginner",
    points: 16,
    description: "Stall on the nose",

  },
  {
    id: 61,
    name: "Tail Stall",
    difficulty: "Beginner",
    points: 16,
    description: "Stall on the tail",

  },
  {
    id: 62,
    name: "Frontside Feeble Stall",
    difficulty: "Intermediate",
    points: 25,
    description: "Feeble stall approached frontside",

  },
  {
    id: 63,
    name: "Backside Feeble Stall",
    difficulty: "Intermediate",
    points: 25,
    description: "Feeble stall approached backside",

  },
  {
    id: 64,
    name: "Frontside Smith Stall",
    difficulty: "Intermediate",
    points: 25,
    description: "Smith stall approached frontside",

  },
  {
    id: 65,
    name: "Backside Smith Stall",
    difficulty: "Intermediate",
    points: 25,
    description: "Smith stall approached backside",

  },
  {
    id: 66,
    name: "Frontside Nose Stall",
    difficulty: "Intermediate",
    points: 22,
    description: "Nose stall approached frontside",

  },
  {
    id: 67,
    name: "Backside Nose Stall",
    difficulty: "Intermediate",
    points: 22,
    description: "Nose stall approached backside",

  },
  {
    id: 68,
    name: "Disaster",
    difficulty: "Intermediate",
    points: 28,
    description: "Backside axle stall",

  },
  {
    id: 69,
    name: "Backside Air Stall",
    difficulty: "Advanced",
    points: 35,
    description: "Stall while grabbing backside",

  },

  // Transition Tricks
  {
    id: 70,
    name: "Rock to Fakie",
    difficulty: "Beginner",
    points: 18,
    description: "Rock over coping and ride back fakie",

  },
  {
    id: 71,
    name: "Rock and Roll",
    difficulty: "Intermediate",
    points: 24,
    description: "Rock over and kick turn back in",

  },
  {
    id: 72,
    name: "Frontside Rock and Roll",
    difficulty: "Intermediate",
    points: 26,
    description: "Rock and roll approached frontside",

  },
  {
    id: 73,
    name: "Drop-In",
    difficulty: "Beginner",
    points: 12,
    description: "Drop into a ramp or bowl",

  },
  {
    id: 74,
    name: "Frontside Air",
    difficulty: "Advanced",
    points: 45,
    description: "Air with frontside grab",

  },
  {
    id: 75,
    name: "Backside Air",
    difficulty: "Advanced",
    points: 45,
    description: "Air with backside grab",

  },

  // Advanced Flip Tricks
  {
    id: 76,
    name: "360 Flip",
    difficulty: "Advanced",
    points: 50,
    description: "Combines kickflip and 360 shuvit",

  },
  {
    id: 77,
    name: "Hardflip",
    difficulty: "Advanced",
    points: 45,
    description: "Frontside shuvit with kickflip",

  },
  {
    id: 78,
    name: "Inward Heelflip",
    difficulty: "Advanced",
    points: 45,
    description: "Backside shuvit with heelflip",

  },
  {
    id: 79,
    name: "360 Shuvit",
    difficulty: "Intermediate",
    points: 28,
    description: "Board spins 360° horizontally",

  },
  {
    id: 80,
    name: "Frontside 360 Shuvit",
    difficulty: "Intermediate",
    points: 30,
    description: "Board spins 360° frontside",

  },
  {
    id: 81,
    name: "Backside 360 Shuvit",
    difficulty: "Intermediate",
    points: 30,
    description: "Board spins 360° backside",

  },

  // Manual Tricks
  {
    id: 82,
    name: "Manual",
    difficulty: "Beginner",
    points: 12,
    description: "Balance on back wheels",

  },
  {
    id: 83,
    name: "Nose Manual",
    difficulty: "Beginner",
    points: 12,
    description: "Balance on front wheels",

  },
  {
    id: 84,
    name: "Manual to Ollie",
    difficulty: "Intermediate",
    points: 25,
    description: "Manual to Ollie",

  },
  {
    id: 84,
    name: "Manual to Roll-in",
    difficulty: "Intermediate",
    points: 25,
    description: "Manual to Roll-in",

  },

  // Pro Level Tricks
  {
    id: 87,
    name: "Double Kickflip",
    difficulty: "Pro",
    points: 65,
    description: "Kickflip that rotates twice",

  },
  {
    id: 88,
    name: "Double Heelflip",
    difficulty: "Pro",
    points: 65,
    description: "Heelflip that rotates twice",

  },
  {
    id: 89,
    name: "Nollie 360 Flip",
    difficulty: "Pro",
    points: 75,
    description: "360 flip from nollie position",

  },
  {
    id: 91,
    name: "Fakie 360 Flip",
    difficulty: "Pro",
    points: 75,
    description: "360 flip while riding fakie",

  },
  {
    id: 92,
    name: "Kickflip 360",
    difficulty: "Pro",
    points: 68,
    description: "Kickflip with full body rotation",

  },

  {
    id: 94,
    name: "Frontside 360",
    difficulty: "Advanced",
    points: 40,
    description: "Full frontside rotation",

  },
  {
    id: 95,
    name: "Backside 360",
    difficulty: "Advanced",
    points: 40,
    description: "Full backside rotation",

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

const difficultyColors: Record<Trick["difficulty"], string> = {
  Beginner: "bg-green-500",
  Intermediate: "bg-yellow-500",
  Advanced: "bg-orange-500",
  Pro: "bg-red-500",
};

export default function SkateboardCardGame() {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    gameStarted: false,
    currentTrick: null,
    gamePhase: "setting",
    winner: null,
    showTurnModal: false,
    roundNumber: 1,
  })
  const [newPlayerName, setNewPlayerName] = useState("")
  const [usedTricks, setUsedTricks] = useState<number[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)

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
          hasAttemptedCurrentTrick: false,
        })),
      }))

      // Draw first trick card
      drawRandomTrick(randomFirstPlayer)
    }
  }

  const drawRandomTrick = (playerIndex: number) => {
    // Filter out used tricks
    const availableTricks = trickCards.filter((trick) => !usedTricks.includes(trick.id))

    // If no tricks left, reset the used tricks
    if (availableTricks.length === 0) {
      setUsedTricks([])
      const randomTrick = trickCards[Math.floor(Math.random() * trickCards.length)]
      setUsedTricks([randomTrick.id])

      setGameState((prev) => ({
        ...prev,
        currentTrick: randomTrick,
        currentPlayerIndex: playerIndex,
        showTurnModal: true,
        gamePhase: "attempting",
        players: prev.players.map((p) => ({ ...p, hasAttemptedCurrentTrick: false })),
        roundNumber: prev.roundNumber + 1,
      }))
      return
    }

    const randomTrick = availableTricks[Math.floor(Math.random() * availableTricks.length)]

    // Add this trick to used tricks
    setUsedTricks((prev) => [...prev, randomTrick.id])

    setGameState((prev) => ({
      ...prev,
      currentTrick: randomTrick,
      currentPlayerIndex: playerIndex,
      showTurnModal: true,
      gamePhase: "attempting",
      players: prev.players.map((p) => ({ ...p, hasAttemptedCurrentTrick: false })),
      roundNumber: prev.roundNumber + 1,
    }))
  }

  const landTrick = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]

    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === currentPlayer.id ? { ...p, hasAttemptedCurrentTrick: true } : p)),
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
        p.id === currentPlayer.id ? { ...p, letters: newLetters, isEliminated, hasAttemptedCurrentTrick: true } : p,
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
    setIsTransitioning(true)

    setTimeout(() => {
      setGameState((prev) => {
        const activePlayers = prev.players.filter((p) => !p.isEliminated)
        if (activePlayers.length <= 1) return prev

        // Check if everyone has attempted the current trick
        const activePlayersWhoHaventAttempted = activePlayers.filter((p) => !p.hasAttemptedCurrentTrick)

        if (activePlayersWhoHaventAttempted.length === 0) {
          // Everyone has attempted, draw new trick for first active player
          const firstActivePlayerIndex = prev.players.findIndex((p) => !p.isEliminated)
          setTimeout(() => {
            drawRandomTrick(firstActivePlayerIndex)
          }, 500)
          return prev
        }

        // Find next player who hasn't attempted yet
        let nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length

        // Skip eliminated players and players who have already attempted
        while (prev.players[nextIndex].isEliminated || prev.players[nextIndex].hasAttemptedCurrentTrick) {
          nextIndex = (nextIndex + 1) % prev.players.length
        }

        return {
          ...prev,
          currentPlayerIndex: nextIndex,
        }
      })

      // Wait a bit more, then show the modal with fade in
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          showTurnModal: true,
        }))
        setIsTransitioning(false)
      }, 300)
    }, 300)
  }

  const resetGame = () => {
    setGameState({
      players: gameState.players.map((p) => ({
        ...p,
        letters: [],
        isEliminated: false,
        skillCards: [availableSkillCards[0]], // Give everyone a Hard Pass card again
        hasAttemptedCurrentTrick: false,
      })),
      currentPlayerIndex: 0,
      gameStarted: false,
      currentTrick: null,
      gamePhase: "setting",
      winner: null,
      showTurnModal: false,
      roundNumber: 1,
    })
    setUsedTricks([]) // Reset used tricks
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
    })
    setUsedTricks([]) // Reset used tricks
  }

  const useSkillCard = (cardId: string) => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]

    if (cardId === "hard-pass") {
      // Remove the card from player's hand and mark as attempted
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === currentPlayer.id
            ? {
              ...p,
              skillCards: p.skillCards.filter((card) => card.id !== cardId),
              hasAttemptedCurrentTrick: true,
            }
            : p,
        ),
        showTurnModal: false,
      }))

      // Move to next player without getting a letter
      nextPlayer()
    }
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const activePlayers = gameState.players.filter((p) => !p.isEliminated)
  const playersWhoHaventAttempted = activePlayers.filter((p) => !p.hasAttemptedCurrentTrick)

  const handleSkillCardClick = (cardId: string) => {
    useSkillCard(cardId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">The S.K.A.T.E. Deck</h1>
          <p className="text-gray-300">Tricks, Flicks, and Epic Picks! 🛹</p>
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
          /* Game Phase */
          <div className="space-y-6">
            {/* Current Game Status */}
            <Card className="bg-black/20 border-blue-600 hover:bg-black/30 hover:border hover:border-emerald-600 hover:cursor-pointer" onClick={() => {
              setGameState((prevState) => ({
                ...prevState,
                showTurnModal: true, // Update showTurnModal based on the dialog's open state
              }));
            }}>
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
                    {playersWhoHaventAttempted.length} player{playersWhoHaventAttempted.length !== 1 ? "s" : ""} still
                    need to attempt this trick
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Turn Modal */}
            <Dialog open={gameState.showTurnModal && !isTransitioning} onOpenChange={(isOpen) => {
              setGameState((prevState) => ({
                ...prevState,
                showTurnModal: isOpen, // Update showTurnModal based on the dialog's open state
              }));
            }}
            >
              <DialogContent
                className={`bg-gray-900 border-gray-600 text-white max-w-md transition-all duration-300 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
                  }`}
              >
                <DialogHeader>
                  <DialogTitle className="text-center">
                    {/* <div className="text-blue-400 flex justify-start items-center gap-2">
                      <Shuffle className="h-4 w-4 text-blue-400" /> Round {gameState.roundNumber}
                    </div> */}

                    <span className="text-2xl text-yellow-400 flex items-center justify-center gap-2">

                      {currentPlayer?.name}'s Turn</span>

                  </DialogTitle>
                </DialogHeader>

                {gameState.currentTrick && (
                  <div className="space-y-6">
                    {/* Trick Card */}
                    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-blue-500">
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

                    {/* Progress indicator */}
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-1">
                        {((activePlayers.length - playersWhoHaventAttempted.length) / activePlayers.length) * 100}%
                      </p>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${((activePlayers.length - playersWhoHaventAttempted.length) / activePlayers.length) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Skill Cards */}
                    {currentPlayer?.skillCards && currentPlayer.skillCards.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-center text-lg font-semibold text-blue-400">Skill Cards</h3>
                        <div className="flex gap-2 justify-center">
                          {currentPlayer.skillCards.map((card) => (
                            <div
                              key={card.id}
                              onClick={() => handleSkillCardClick(card.id)}
                              className="bg-purple-900/50 border border-purple-500 cursor-pointer hover:bg-purple-800/50 transition-colors rounded-lg"
                            >
                              <div className="p-3 text-center">
                                <div className="text-2xl mb-1">{card.icon}</div>
                                <div className="text-white font-semibold text-sm">{card.name}</div>
                                <div className="text-gray-300 text-xs">{card.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-center text-gray-400 text-sm">Click a card to use it</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-8 justify-between px-8">
                      <Button onClick={missTrick} className="bg-green-600 hover:bg-green-700 flex-1 h-24" size={"lg"}>
                        <CheckCircle2 className="!h-10 !w-10" />
                      </Button>
                      <Button onClick={missTrick} className="bg-red-600/80 hover:bg-red-700/80 flex-1 h-24 " size={"lg"}>
                        <X className="!h-10 !w-10" />
                      </Button>
                    </div>

                    {/* Player's Current Letters */}
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Your current letters:</p>
                      <div className="flex gap-1 justify-center">
                        {SKATE_LETTERS.map((letter, index) => (
                          <div
                            key={letter}
                            className={`w-8 h-8 rounded border-2 flex items-center justify-center font-bold ${index < (currentPlayer?.letters.length || 0)
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

            {/* Transition Overlay */}
            {isTransitioning && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300">
                <div className="bg-gray-900 border-2 border-blue-500 rounded-lg p-8 text-center animate-pulse">
                  <div className="text-4xl mb-4">{playersWhoHaventAttempted.length === 1 ? "🎯" : "🔄"}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {playersWhoHaventAttempted.length === 1 ? "Drawing New Trick..." : "Next Player..."}
                  </h3>
                  <p className="text-gray-300">
                    {playersWhoHaventAttempted.length === 1
                      ? "Everyone has attempted this trick!"
                      : "Get ready for the next attempt!"}
                  </p>
                </div>
              </div>
            )}

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
                      className={`p-4 rounded-lg border-2 ${player.isEliminated
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
                          {!player.isEliminated && player.hasAttemptedCurrentTrick && (
                            <Badge className="bg-green-600 text-white text-xs">✓</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {SKATE_LETTERS.map((letter, index) => (
                          <div
                            key={letter}
                            className={`w-8 h-8 rounded border-2 flex items-center justify-center font-bold ${index < player.letters.length
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
