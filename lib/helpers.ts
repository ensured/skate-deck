import { GameState, Player, Trick } from "@/types/types";
import { SKATE_LETTERS, trickCards } from "./tricks";

export const isValidPlayer = (player: any): player is Player => {
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
  );
};

export const isValidTrick = (trick: any): trick is Trick => {
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
  );
};

export const isValidGameState = (state: any): state is GameState => {
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
    (state.leaderIndex === null ||
      (typeof state.leaderIndex === "number" &&
        state.leaderIndex >= 0 &&
        state.leaderIndex < state.players.length)) &&
    // Optional properties
    (state.showTrickPicker === undefined ||
      typeof state.showTrickPicker === "boolean") &&
    (state.trickPickerOptions === undefined ||
      Array.isArray(state.trickPickerOptions)) &&
    (state.modalOverlay === undefined ||
      typeof state.modalOverlay === "boolean") &&
    (state.shouldDrawNextTrick === undefined ||
      typeof state.shouldDrawNextTrick === "boolean") &&
    (state.nextPlayerIndex === undefined ||
      state.nextPlayerIndex === null ||
      typeof state.nextPlayerIndex === "number") &&
    (state.shouldAdvanceTurn === undefined ||
      typeof state.shouldAdvanceTurn === "boolean")
  );
};
