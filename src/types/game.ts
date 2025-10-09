import { TrickCard } from "./tricks";
import { ClerkUser } from "./user";

export type PlayerStatus =
  | "active" // Player is in the game
  | "eliminated"; // Player is out of the game
export type GameStatus =
  | "lobby" // Game is in the lobby
  | "active" // Game is in progress
  | "ended"; // Game has ended

export interface Player {
  id: number;
  name: string;
  letters: number;
  isEliminated: boolean;
  isCreator: boolean;
  isLeader: boolean;
  score: number;
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
  shouldRotateLeadershipAfterRound: boolean; // Flag to rotate leadership after current round ends
  gameLog: string[]; // Log of game events for UI display
  totalDeckSize: number; // Total number of cards in the deck initially
  winner?: Player; // The winner of the game (set when game ends)
}
