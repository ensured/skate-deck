"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface PowerUpNotificationProps {
  powerUps: string[];
  playerName: string;
  onComplete: () => void;
}

export function PowerUpNotification({
  powerUps,
  playerName,
  onComplete,
}: PowerUpNotificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (powerUps.length === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      if (currentIndex < powerUps.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsVisible(false);
        setTimeout(onComplete, 500); // Wait for exit animation
      }
    }, 2000); // Show each notification for 2 seconds

    return () => clearTimeout(timer);
  }, [currentIndex, powerUps.length, onComplete]);

  if (powerUps.length === 0 || !isVisible) return null;

  const currentPowerUp = powerUps[currentIndex];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <AnimatePresence>
        <motion.div
          key={currentPowerUp}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="bg-primary text-primary-foreground px-6 py-4 rounded-lg shadow-lg flex items-center gap-3"
        >
          <Zap className="h-6 w-6 text-yellow-300" />
          <div>
            <div className="font-bold">{playerName} got a new power-up!</div>
            <div className="text-sm">{currentPowerUp}</div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
