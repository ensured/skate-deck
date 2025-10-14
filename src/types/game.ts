import { TrickCard } from "./tricks";
import { ClerkUser } from "./user";

export type PlayerStatus =
  | "active" // Player is in the game
  | "eliminated"; // Player is out of the game
export type GameStatus =
  | "lobby" // Game is in the lobby
  | "active" // Game is in progress
  | "ended"; // Game has ended

export type PowerupType = "shield" | "choose_trick";

export interface Powerup {
  id: string;
  type: PowerupType;
  name: string;
  description: string;
  trickOptions?: TrickCard[]; // Available trick options for the Trick Selector power-up
  onUse: (
    gameState: GameState,
    playerId: number,
    selectedTrick?: TrickCard
  ) => GameState;
}

export interface Player {
  id: number;
  name: string;
  letters: number;
  isEliminated: boolean;
  isCreator: boolean;
  isLeader: boolean;
  score: number;
  inventory: {
    powerups: Powerup[];
  };
}

export interface GameState {
  gameCreator: ClerkUser | null;
  players: Player[];
  status: GameStatus;
  currentLeaderId: number;
  currentPlayerId: number;
  currentTurnIndex: number; // Index in turnOrder for current player
  currentTrick: TrickCard | undefined; // The current trick being attempted
  discardedTricks: TrickCard[]; // Used tricks
  round: number; // Current round number
  roundComplete: boolean;
  currentAttempts: Record<string, boolean>;
  leaderConsecutiveWins: number; // Number of consecutive wins by the current leader
  gameLog: string[]; // Log of game events for UI display
  totalDeckSize?: number; // Total number of cards in the deck at start
  trickOptions?: TrickCard[]; // Available trick options for the Trick Selector power-up
  showPowerUpDialog?: boolean; // Controls visibility of power-up dialog
  selectedTrick?: TrickCard; // Currently selected trick (for power-ups)
  winner?: Player; // The winner of the game, if any
  currentRoundTurns: number; // Number of turns taken in the current round
  settings: {
    powerUpChance: number; // 0 to 1 (0% to 100%), chance to get a power-up when landing a trick
  };
}
