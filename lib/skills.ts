import { SkillCard } from "@/types/types";

export const skillCards: SkillCard[] = [
  {
    id: "hard-pass",
    name: "Nah Fam",
    description: "Skip any trick without getting a letter",
    type: "hard-pass",
    icon: "🛡️",
  },
  {
    id: "trick-swap",
    name: "Switcheroo Skrrt",
    description:
      "Swap the current trick for a new one of the same or lower difficulty.",
    type: "defensive",
    icon: "🔄",
  },
  {
    id: "extra-try",
    name: "Retry Buff",
    description:
      "Attempt the current trick up to two additional times without a letter on a miss.",
    type: "defensive",
    icon: "🔄",
  },
  {
    id: "peek-choose",
    name: "Drop In",
    description: "Peek at the next 3 tricks and choose one to attempt.",
    type: "offensive",
    icon: "🔄",
  },
];
