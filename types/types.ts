export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gameStarted: boolean;
  currentTrick: Trick | null;
  gamePhase: "setting" | "attempting" | "game-over";
  winner: string | null;
  showTurnModal?: boolean;
  roundNumber: number;
  trickLeaderLanded?: boolean;
  leaderIndex: number | null;
  usedTricks: number[];

  // for the peek-choose/Drop In skill card
  showTrickPicker?: boolean;
  trickPickerOptions?: Trick[];

  // Modal overlay to lock screen during powerup usage
  modalOverlay?: boolean;

  // Clean flags to replace setTimeout hacks
  shouldDrawNextTrick?: boolean;
  nextPlayerIndex?: number | null;
  shouldAdvanceTurn?: boolean;
}

export interface Trick {
  id: number;
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Pro";
  points: number;
  description: string;
}
export interface Player {
  id: number;
  name: string;
  letters: string[];
  isEliminated: boolean;
  skillCards: SkillCard[];
  consecutiveTricks: number;
  hasAttemptedCurrentTrick: boolean;
  extraTries?: number; // Tracks remaining extra attempts (0, 1, or 2)
}

export interface SkillCard {
  id: string;
  name: string;
  description: string;
  type: "hard-pass" | "bonus" | "defensive" | "offensive";
  icon: string;
}
