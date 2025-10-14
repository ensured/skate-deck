import { Powerup } from "./powerups";

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
