import { TrickCard } from "./tricks";
import { ClerkUser } from "./user";

export type GameStatus =
  | "lobby" // Players joining
  | "in-progress" // Game is active
  | "game-over"; // Game has ended

export type PlayerStatus =
  | "active" // Player is in the game
  | "eliminated"; // Player is out of the game

export interface Player {
  id: string; // Unique player ID
  name: string; // Display name
  status: PlayerStatus; // Current player status
  score: number; // Current score
  isLeader: boolean; // Is the current round leader
  isCreator?: boolean; // Is the player who created the game
  consecutiveWins: number; // Number of consecutive successful tricks as leader
  letters: number; // Letters from G.R.I.N.D that the player has collected (0-5)
  isEliminated: boolean; // Whether the player is eliminated from the game
}

export type GamePhase =
  | "leader-turn" // Leader is attempting their trick
  | "followers-turn" // Followers are attempting the leader's trick
  | "between-turns"; // Time between turns for UI updates

export interface GameState {
  clerkUser: ClerkUser | null;
  status: GameStatus;
  players: Player[];
  currentLeaderId: string | null;
  currentPlayerId: string | null;
  turnOrder: string[]; // Array of player IDs in turn order
  currentTurnIndex: number; // Index in turnOrder for current player
  currentTrick: TrickCard | undefined; // The current trick being attempted
  discardedTricks: TrickCard[]; // Used tricks
  round: number; // Current round number
  phase: GamePhase; // Current phase of the game
  roundComplete: boolean;
  currentAttempts: Record<string, boolean>;
  leaderConsecutiveWins: number; // Number of consecutive wins by the current leader
  gameLog: string[]; // Log of game events for UI display
}

// Helper type to get a player by ID
export type GetPlayerById = (
  players: Player[],
  playerId: string
) => Player | undefined;

// Helper to get the current player
export const getCurrentPlayer = (state: GameState): Player | undefined => {
  return state.currentPlayerId
    ? state.players.find((p) => p.id === state.currentPlayerId)
    : undefined;
};

// Helper to get the current leader
export const getCurrentLeader = (state: GameState): Player | undefined => {
  return state.currentLeaderId
    ? state.players.find((p) => p.id === state.currentLeaderId)
    : undefined;
};
