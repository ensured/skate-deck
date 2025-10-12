import { TrickCard } from "./tricks";
import { ClerkUser } from "./user";

export type PlayerStatus =
  | "active" // Player is in the game
  | "eliminated"; // Player is out of the game
export type GameStatus =
  | "lobby" // Game is in the lobby
  | "active" // Game is in progress
  | "ended"; // Game has ended

export type SkillCardType = "shield" | "choose_trick";

export interface SkillCard {
  id: string;
  type: SkillCardType;
  name: string;
  description: string;
  trickOptions?: TrickCard[]; // For Trick Selector card
  onUse: (gameState: GameState, playerId: number, selectedTrick?: TrickCard) => GameState;
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
    skillCards: SkillCard[];
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
  shouldRotateLeadershipAfterRound: boolean; // Flag to rotate leadership after current round ends
  gameLog: string[]; // Log of game events for UI display
  totalDeckSize?: number; // Total number of cards in the deck at start
  winner?: Player; // The winner of the game, if any
  skillCardsInPlay: SkillCard[]; // Available skill cards in the game
  trickOptions?: TrickCard[]; // Available trick options for the Trick Selector power-up
  currentTrickSetterId: number | null; // ID of the player who set the current trick
  currentRoundTurns: number; // Number of turns taken in the current round
  settings: {
    powerUpChance: number; // 0 to 1 (0% to 100%), chance to get a power-up when landing a trick
  };
}
