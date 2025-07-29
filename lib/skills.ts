import { SkillCard } from "@/types/types";

export const skillCards: SkillCard[] = [
  {
    id: "hard-pass",
    name: "Hard Pass",
    description: "Skip any trick without getting a letter",
    type: "hard-pass",
    icon: "🛡️",
  },
  {
    id: "trick-swap",
    name: "Trick Swap",
    description:
      "Swap the current trick for a new one of the same or lower difficulty.",
    type: "defensive",
    icon: "🔄",
  },
];
