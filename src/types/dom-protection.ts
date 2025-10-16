export const domProtectionConfig = [
  {
    targetSelector: ".player-list",
    protectedContent: "", // Will be updated dynamically
    checkInterval: 2000,
    onViolation: (element: Element, original: string, current: string) => {
      console.warn(
        "🚨 Player list was modified externally!",
        element,
        original,
        current
      );
    },
  },
  {
    targetSelector: ".game-status",
    protectedContent: "",
    checkInterval: 3000,
    onViolation: (element: Element, original: string, current: string) => {
      console.warn(
        "🚨 Game status was modified externally!",
        element,
        original,
        current
      );
    },
  },
  {
    targetSelector: ".game-controls",
    protectedContent: "",
    checkInterval: 5000,
    onViolation: (element: Element, original: string, current: string) => {
      console.warn(
        "🚨 Game controls were modified externally!",
        element,
        original,
        current
      );
    },
  },
  {
    targetSelector: ".player-input",
    protectedContent: "",
    checkInterval: 1000,
    onViolation: (element: Element, original: string, current: string) => {
      console.warn(
        "🚨 Player input was modified externally!",
        element,
        original,
        current
      );
    },
  },
];
