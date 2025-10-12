"use client";

import { useState, useEffect } from "react";

const planets = [
  "🌍 Earth",
  "🌕 Moon",
  "☀️ Sun",
  "⭐ Star",
  "🌌 Galaxy",
  "☄️ Comet",
  "🪐 Saturn",
  "🚀 Rocket",
  "👾 Alien",
  "🌈 Nebula",
];

export default function ClientCounter() {
  const [count, setCount] = useState(0);
  const [currentPlanet, setCurrentPlanet] = useState(planets[0]);
  const [isWarping, setIsWarping] = useState(false);

  // Cycle through planets when count changes
  useEffect(() => {
    if (count !== 0) {
      setIsWarping(true);
      const timer = setTimeout(() => {
        setCurrentPlanet(planets[count % planets.length]);
        setIsWarping(false);
      }, 190);
      return () => clearTimeout(timer);
    }
  }, [count]);

  const handleIncrement = () => {
    setCount((c) => c + 1);
  };

  const handleDecrement = () => {
    if (count > 0) {
      setCount((c) => c - 1);
    }
  };

  return (
    <section className="space-y-6 p-6 bg-gray-900 text-white rounded-xl">
      <h2 className="text-2xl font-bold text-center">🌌 Space Explorer</h2>

      <div className="flex flex-col items-center space-y-6">
        <div
          className={`text-6xl transition-all duration-500 ${
            isWarping ? "scale-150 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          {currentPlanet}
        </div>

        <div className="text-4xl font-mono my-4">{count}</div>

        <div className="flex gap-4">
          <Button
            onClick={handleDecrement}
            disabled={count === 0}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            -1
          </Button>

          <Button
            onClick={handleIncrement}
            className="bg-blue-600 hover:bg-blue-700"
          >
            +1
          </Button>
        </div>
      </div>

      <p className="text-center text-gray-400 text-sm mt-4">
        {count === 0
          ? "Start counting to explore the universe! 🚀"
          : `You've discovered ${count} space ${
              count === 1 ? "object" : "objects"
            }!`}
      </p>
    </section>
  );
}

function Button({
  children,
  onClick,
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg font-bold text-white transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
