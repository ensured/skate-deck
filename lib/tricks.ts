import { type Trick } from "@/types/types";

export const SKATE_LETTERS = ["S", "K", "A", "T", "E"];

export const difficultyColors: Record<Trick["difficulty"], string> = {
  Beginner: "bg-green-500",
  Intermediate: "bg-yellow-500",
  Advanced: "bg-orange-500",
  Pro: "bg-red-500",
};

export const trickCards: Trick[] = [
  // Basic Ollies
  {
    id: 1,
    name: "Ollie",
    difficulty: "Beginner",
    points: 10,
    description: "The foundation of all skateboarding tricks",
  },
  {
    id: 2,
    name: "Nollie",
    difficulty: "Intermediate",
    points: 20,
    description: "Ollie off the nose",
  },
  {
    id: 3,
    name: "Fakie Ollie",
    difficulty: "Beginner",
    points: 12,
    description: "Ollie while riding fakie",
  },
  {
    id: 4,
    name: "Switch Ollie",
    difficulty: "Intermediate",
    points: 18,
    description: "Ollie in switch stance",
  },

  // Shove-Its
  {
    id: 5,
    name: "FS Pop Shove-It",
    difficulty: "Beginner",
    points: 15,
    description: "Board spins 180° FS",
  },
  {
    id: 6,
    name: "BS Pop Shove-It",
    difficulty: "Beginner",
    points: 15,
    description: "Board spins 180° BS",
  },
  {
    id: 7,
    name: "Nollie Shove-It",
    difficulty: "Intermediate",
    points: 22,
    description: "Shove-it from nollie position",
  },
  {
    id: 8,
    name: "Fakie Shove-It",
    difficulty: "Beginner",
    points: 16,
    description: "Shove-it while riding fakie",
  },
  {
    id: 9,
    name: "Switch Pop Shove-It",
    difficulty: "Intermediate",
    points: 20,
    description: "Shove-it in switch stance",
  },
  {
    id: 10,
    name: "Nollie Pop Shove-It",
    difficulty: "Intermediate",
    points: 24,
    description: "Pop shove-it from nollie",
  },
  {
    id: 11,
    name: "Fakie Pop Shove-It",
    difficulty: "Intermediate",
    points: 18,
    description: "Pop shove-it while riding fakie",
  },

  // 180s
  {
    id: 12,
    name: "FS 180",
    difficulty: "Intermediate",
    points: 20,
    description: "180° FS turn",
  },
  {
    id: 13,
    name: "BS 180",
    difficulty: "Intermediate",
    points: 20,
    description: "180° BS turn",
  },
  {
    id: 14,
    name: "Nollie FS 180",
    difficulty: "Advanced",
    points: 35,
    description: "FS 180 from nollie",
  },
  {
    id: 15,
    name: "Nollie BS 180",
    difficulty: "Advanced",
    points: 35,
    description: "BS 180 from nollie",
  },
  {
    id: 16,
    name: "Fakie FS 180",
    difficulty: "Intermediate",
    points: 22,
    description: "FS 180 from fakie",
  },
  {
    id: 17,
    name: "Fakie BS 180",
    difficulty: "Intermediate",
    points: 22,
    description: "BS 180 from fakie",
  },
  {
    id: 18,
    name: "Switch FS 180",
    difficulty: "Advanced",
    points: 30,
    description: "FS 180 in switch stance",
  },
  {
    id: 19,
    name: "Switch BS 180",
    difficulty: "Advanced",
    points: 30,
    description: "BS 180 in switch stance",
  },
  {
    id: 20,
    name: "FS Half-Cab",
    difficulty: "Intermediate",
    points: 25,
    description: "Fakie FS 180",
  },
  {
    id: 21,
    name: "BS Half-Cab",
    difficulty: "Intermediate",
    points: 25,
    description: "Fakie BS 180",
  },

  // Flip Tricks
  {
    id: 22,
    name: "Kickflip",
    difficulty: "Intermediate",
    points: 25,
    description: "Board flips along the length axis",
  },
  {
    id: 23,
    name: "Heelflip",
    difficulty: "Intermediate",
    points: 25,
    description: "Board flips opposite to kickflip",
  },
  {
    id: 24,
    name: "FS Flip",
    difficulty: "Advanced",
    points: 40,
    description: "Kickflip with FS body rotation",
  },
  {
    id: 25,
    name: "BS Flip",
    difficulty: "Advanced",
    points: 40,
    description: "Kickflip with BS body rotation",
  },
  {
    id: 26,
    name: "Nollie Flip",
    difficulty: "Advanced",
    points: 45,
    description: "Kickflip from nollie position",
  },
  {
    id: 27,
    name: "Fakie Flip",
    difficulty: "Advanced",
    points: 42,
    description: "Kickflip while riding fakie",
  },
  {
    id: 28,
    name: "Switch Flip",
    difficulty: "Advanced",
    points: 38,
    description: "Kickflip in switch stance",
  },
  {
    id: 29,
    name: "Nollie Heel",
    difficulty: "Advanced",
    points: 45,
    description: "Heelflip from nollie position",
  },
  {
    id: 30,
    name: "Fakie Heel",
    difficulty: "Advanced",
    points: 42,
    description: "Heelflip while riding fakie",
  },
  {
    id: 31,
    name: "Switch Heel",
    difficulty: "Advanced",
    points: 38,
    description: "Heelflip in switch stance",
  },
  {
    id: 32,
    name: "Varial Flip",
    difficulty: "Intermediate",
    points: 30,
    description: "Shove-it combined with kickflip",
  },
  {
    id: 33,
    name: "Varial Heel",
    difficulty: "Intermediate",
    points: 30,
    description: "FS shove-it with heelflip",
  },

  // Slides
  {
    id: 34,
    name: "FS Boardslide",
    difficulty: "Intermediate",
    points: 26,
    description: "Slide FS on the middle of board",
  },
  {
    id: 35,
    name: "BS Boardslide",
    difficulty: "Intermediate",
    points: 26,
    description: "Slide BS on the middle of board",
  },
  {
    id: 36,
    name: "FS Noseslide",
    difficulty: "Advanced",
    points: 35,
    description: "Slide on the nose FS",
  },
  {
    id: 37,
    name: "BS Noseslide",
    difficulty: "Advanced",
    points: 35,
    description: "Slide on the nose BS",
  },
  {
    id: 38,
    name: "FS Tailslide",
    difficulty: "Advanced",
    points: 35,
    description: "Slide on the tail FS",
  },
  {
    id: 39,
    name: "BS Tailslide",
    difficulty: "Advanced",
    points: 35,
    description: "Slide on the tail BS",
  },
  {
    id: 40,
    name: "FS Lipslide",
    difficulty: "Advanced",
    points: 38,
    description: "Lipslide approached FS",
  },
  {
    id: 41,
    name: "BS Lipslide",
    difficulty: "Advanced",
    points: 38,
    description: "Lipslide approached BS",
  },
  {
    id: 42,
    name: "FS Noseblunt Slide",
    difficulty: "Pro",
    points: 55,
    description: "Noseblunt slide FS",
  },
  {
    id: 43,
    name: "BS Noseblunt Slide",
    difficulty: "Pro",
    points: 55,
    description: "Noseblunt slide BS",
  },

  // Grinds
  {
    id: 44,
    name: "50-50 Grind",
    difficulty: "Intermediate",
    points: 22,
    description: "Grind on both trucks",
  },
  {
    id: 45,
    name: "Nosegrind",
    difficulty: "Intermediate",
    points: 24,
    description: "Grind on front truck only",
  },
  {
    id: 46,
    name: "5-0 Grind",
    difficulty: "Intermediate",
    points: 24,
    description: "Grind on back truck only",
  },
  {
    id: 47,
    name: "FS Feeble Grind",
    difficulty: "Advanced",
    points: 38,
    description: "Feeble grind approached FS",
  },
  {
    id: 48,
    name: "BS Feeble Grind",
    difficulty: "Advanced",
    points: 38,
    description: "Feeble grind approached BS",
  },
  {
    id: 49,
    name: "FS Smith Grind",
    difficulty: "Advanced",
    points: 38,
    description: "Smith grind approached FS",
  },
  {
    id: 50,
    name: "BS Smith Grind",
    difficulty: "Advanced",
    points: 38,
    description: "Smith grind approached BS",
  },
  {
    id: 51,
    name: "Crooked Grind",
    difficulty: "Advanced",
    points: 40,
    description: "Front truck over, back truck grinds",
  },
  {
    id: 52,
    name: "FS 5-0 Grind",
    difficulty: "Advanced",
    points: 32,
    description: "5-0 grind approached FS",
  },
  {
    id: 53,
    name: "BS 5-0 Grind",
    difficulty: "Advanced",
    points: 32,
    description: "5-0 grind approached BS",
  },
  {
    id: 54,
    name: "FS Crooked Grind",
    difficulty: "Advanced",
    points: 42,
    description: "Crooked grind approached FS",
  },
  {
    id: 55,
    name: "BS Crooked Grind",
    difficulty: "Advanced",
    points: 42,
    description: "Crooked grind approached BS",
  },
  {
    id: 56,
    name: "Salad Grind",
    difficulty: "Advanced",
    points: 45,
    description: "Crooked grind with tweaked style",
  },
  {
    id: 57,
    name: "FS Nosegrind",
    difficulty: "Advanced",
    points: 32,
    description: "Nosegrind approached FS",
  },
  {
    id: 58,
    name: "BS Nosegrind",
    difficulty: "Advanced",
    points: 32,
    description: "Nosegrind approached BS",
  },

  // Stalls
  {
    id: 59,
    name: "Axle Stall",
    difficulty: "Beginner",
    points: 15,
    description: "Stall on both trucks",
  },
  {
    id: 60,
    name: "Nose Stall",
    difficulty: "Beginner",
    points: 16,
    description: "Stall on the nose",
  },
  {
    id: 61,
    name: "Tail Stall",
    difficulty: "Beginner",
    points: 16,
    description: "Stall on the tail",
  },
  {
    id: 62,
    name: "FS Feeble Stall",
    difficulty: "Intermediate",
    points: 25,
    description: "Feeble stall approached FS",
  },
  {
    id: 63,
    name: "BS Feeble Stall",
    difficulty: "Intermediate",
    points: 25,
    description: "Feeble stall approached BS",
  },
  {
    id: 64,
    name: "FS Smith Stall",
    difficulty: "Intermediate",
    points: 25,
    description: "Smith stall approached FS",
  },
  {
    id: 65,
    name: "BS Smith Stall",
    difficulty: "Intermediate",
    points: 25,
    description: "Smith stall approached BS",
  },
  {
    id: 66,
    name: "Nose Stall",
    difficulty: "Intermediate",
    points: 22,
    description: "Nose stall",
  },
  //   {
  //     id: 66,
  //     name: "Nose Stall FS Revert",
  //     difficulty: "Intermediate",
  //     points: 22,
  //     description: "Nose stall",
  //   },
  //   {
  //     id: 66,
  //     name: "Nose Stall BS Revert",
  //     difficulty: "Intermediate",
  //     points: 22,
  //     description: "Nose stall",
  //   },
  {
    id: 68,
    name: "FS Disaster",
    difficulty: "Intermediate",
    points: 28,
    description: "FS Disaster",
  },
  {
    id: 68,
    name: "BS Disaster",
    difficulty: "Intermediate",
    points: 28,
    description: "BS Disaster",
  },
  {
    id: 69,
    name: "BS Air",
    difficulty: "Advanced",
    points: 35,
    description: "Stall while grabbing BS",
  },

  // Transition Tricks
  {
    id: 70,
    name: "Rock to Fakie",
    difficulty: "Beginner",
    points: 18,
    description: "Rock over coping and ride back fakie",
  },
  {
    id: 71,
    name: "Rock and Roll",
    difficulty: "Intermediate",
    points: 24,
    description: "Rock over and kick turn back in",
  },
  {
    id: 72,
    name: "FS Rock and Roll",
    difficulty: "Intermediate",
    points: 26,
    description: "Rock and roll approached FS",
  },
  {
    id: 73,
    name: "Drop-In",
    difficulty: "Beginner",
    points: 12,
    description: "Drop into a ramp or bowl",
  },
  {
    id: 74,
    name: "FS Air",
    difficulty: "Advanced",
    points: 45,
    description: "Air with FS grab",
  },
  {
    id: 75,
    name: "BS Air",
    difficulty: "Advanced",
    points: 45,
    description: "Air with BS grab",
  },

  // Advanced Flip Tricks
  {
    id: 76,
    name: "360 Flip",
    difficulty: "Advanced",
    points: 50,
    description: "Combines kickflip and 360 shuvit",
  },
  {
    id: 77,
    name: "Hardflip",
    difficulty: "Advanced",
    points: 45,
    description: "FS shuvit with kickflip",
  },
  {
    id: 78,
    name: "Inward Heelflip",
    difficulty: "Advanced",
    points: 45,
    description: "BS shuvit with heelflip",
  },
  {
    id: 79,
    name: "360 Shuvit",
    difficulty: "Intermediate",
    points: 28,
    description: "Board spins 360° BS",
  },
  {
    id: 80,
    name: "FS 360 Shuvit",
    difficulty: "Intermediate",
    points: 30,
    description: "Board spins 360° FS",
  },

  // Manual Tricks
  {
    id: 82,
    name: "Manual",
    difficulty: "Beginner",
    points: 12,
    description: "Balance on back wheels",
  },
  {
    id: 83,
    name: "Nose Manual",
    difficulty: "Beginner",
    points: 12,
    description: "Balance on front wheels",
  },
  {
    id: 84,
    name: "Manual to Ollie",
    difficulty: "Intermediate",
    points: 25,
    description: "Manual to Ollie",
  },
  {
    id: 84,
    name: "Manual to Roll-in",
    difficulty: "Intermediate",
    points: 25,
    description: "Manual to Roll-in",
  },

  {
    id: 84,
    name: "50-50 to Roll-in",
    difficulty: "Intermediate",
    points: 25,
    description: "Manual to Roll-in",
  },

  {
    id: 84,
    name: "5-0 grind to Roll-in",
    difficulty: "Intermediate",
    points: 25,
    description: "Manual to Roll-in",
  },

  // Pro Level Tricks
  {
    id: 87,
    name: "Double Kickflip",
    difficulty: "Pro",
    points: 65,
    description: "Kickflip that rotates twice",
  },
  {
    id: 88,
    name: "Double Heelflip",
    difficulty: "Pro",
    points: 65,
    description: "Heelflip that rotates twice",
  },
  {
    id: 89,
    name: "Nollie 360 Flip",
    difficulty: "Pro",
    points: 75,
    description: "360 flip from nollie position",
  },
  {
    id: 91,
    name: "Fakie 360 Flip",
    difficulty: "Pro",
    points: 75,
    description: "360 flip while riding fakie",
  },
  {
    id: 92,
    name: "Kickflip 360",
    difficulty: "Pro",
    points: 68,
    description: "Kickflip with full body rotation",
  },

  {
    id: 94,
    name: "FS 360",
    difficulty: "Advanced",
    points: 40,
    description: "Full FS rotation",
  },
  {
    id: 95,
    name: "BS 360",
    difficulty: "Advanced",
    points: 40,
    description: "Full BS rotation",
  },
];
