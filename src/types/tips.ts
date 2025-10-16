export const getRandomTip = () => {
  const tips = [
    "💡 Tip: It's best to use shield cards when you're the leader!",
    "💡 Tip: Save your Choose Trick cards for difficult tricks (4+ points) rather than easy ones. They're more valuable when the stakes are high!",
    "💡 Tip: Higher difficulty tricks give more points but are usually riskier. Consider your current letter count before attempting Advanced or Pro tricks!",
    "💡 Tip: Don't waste shield cards on easy tricks! Save them for other opportunities that arise.",
    "💡 Tip: Power-ups are more likely to be awarded to players with the most letters. Use this as a comeback mechanic when behind!",
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)];
  return tip;
};
