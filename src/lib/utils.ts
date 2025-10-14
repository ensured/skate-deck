import { GameState, SkillCard } from "@/types/game";
import trickCards, { TrickCard } from "@/types/tricks";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const chooseTrickCard: SkillCard = {
  id: "choose_trick",
  type: "choose_trick",
  name: "Trick Selector",
  description: "Choose 1 of the next 3 cards in the deck",
  onUse: (
    gameState: GameState,
    playerId: number,
    selectedTrick?: TrickCard
  ) => {
    const playerName = gameState.players.find((p) => p.id === playerId)?.name;

    if (selectedTrick) {
      return {
        ...gameState,
        currentTrick: selectedTrick,
        gameLog: [
          ...gameState.gameLog,
          `🎯 ${playerName} chose: ${selectedTrick.name}`,
        ],
        trickOptions: undefined,
      };
    }

    const availableTricks = trickCards.filter(
      (trick) => trick.id !== gameState.currentTrick?.id
    );

    const shuffled = shuffleArray([...availableTricks]);
    const trickOptions = shuffled.slice(0, 3);

    return {
      ...gameState,
      trickOptions,
      showPowerUpDialog: true,
      gameLog: [
        ...gameState.gameLog,
        `✨ ${playerName} is choosing a new trick...`,
      ],
    };
  },
};

export const shieldCard: SkillCard = {
  id: "shield",
  type: "shield",
  name: "Shield",
  description: "Protect yourself from getting a letter on your next miss",
  onUse: (gameState: GameState, playerId: number) => {
    return {
      ...gameState,
      players: gameState.players.map((p) =>
        p.id === playerId
          ? {
              ...p,
              inventory: {
                ...p.inventory,
                skillCards: p.inventory.skillCards.filter(
                  (c) => c.type !== "shield"
                ),
              },
            }
          : p
      ),
      gameLog: [
        ...gameState.gameLog,
        `🛡️ ${
          gameState.players.find((p) => p.id === playerId)?.name
        } activated a Shield!`,
      ],
    };
  },
};
