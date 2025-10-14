import { SkillCard } from "./game";
import trickCards, { TrickCard } from "./tricks";
import { GameState } from "./game";
import { shuffleArray } from "@/lib/utils";

export const chooseTrickSkill: SkillCard = {
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

export const shieldSkill: SkillCard = {
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

export const startingSkillCards = [shieldSkill, chooseTrickSkill];
