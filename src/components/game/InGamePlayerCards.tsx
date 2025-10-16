import { AnimatePresence, motion } from "framer-motion";
import { GameState } from "@/types/game";
import { Player } from "@/types/player";
import { Crown, Trophy, Zap } from "lucide-react";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";

const InGamePlayerCards = ({
  gameState,
  currentPlayer,
}: {
  gameState: GameState;
  currentPlayer: Player;
}) => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  };

  return (
    <div className="w-full flex-shrink-0">
      <div className="p-2">
        <AnimatePresence>
          <div className="border border-border/60  shadow-md sm:p-3 p-1 grid grid-cols-2 sm:grid-cols-2 gap-2 max-h-96 lg:max-h-none overflow-y-auto rounded-xl">
            {gameState.players.map((player) => {
              const cardContent = (
                <div className="flex items-start justify-between h-full gap-1 relative">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span
                        className={`font-medium truncate ${
                          player.isEliminated
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {currentPlayer?.id === player.id ? (
                          <motion.span
                            key={player.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.6,
                              delay:
                                player.name
                                  .split("")
                                  .reduce((acc, _, i) => acc + 0.02, 0) / 2, // Slightly faster than trick name
                            }}
                            className="flex-shrink-0"
                          >
                            {player.name.split("").map((letter, index) => (
                              <motion.span
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.7,
                                  delay: index * 0.09,
                                }}
                                className={`${
                                  player.isCreator
                                    ? "underline decoration-purple-500"
                                    : ""
                                }`}
                              >
                                {letter}
                              </motion.span>
                            ))}
                          </motion.span>
                        ) : (
                          player.name
                        )}
                      </span>
                      {currentPlayer?.id === player.id && (
                        <div className="flex items-center gap-1 text-xs border-r pr-1.5 font-bold">
                          <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                        </div>
                      )}

                      {player.inventory.powerups.length > 0 && (
                        <Dialog open={open} onOpenChange={handleOpenChange}>
                          <DialogTrigger asChild>
                            <div className="flex gap-1 items-center text-xs sm:text-sm cursor-pointer">
                              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                              {player.inventory.powerups.length}
                            </div>
                          </DialogTrigger>
                          <DialogContent className="">
                            <DialogHeader>
                              <DialogTitle>Powerups</DialogTitle>
                              <DialogDescription>
                                These are the powerups you have collected.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button>Close</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 mb-1 w-full">
                      <div className="flex gap-0.5 flex-1">
                        {"SKATE".split("").map((letter, index) => (
                          <div
                            key={index}
                            className={`flex-1 min-w-0 text-center font-medium text-sm border rounded px-0.5 sm:px-1 md:px-1.5 lg:px-2 ${
                              player.letters > index
                                ? "text-red-500/90 border-red-200 dark:text-red-300/90 dark:border-red-800/60 bg-red-100/70 dark:bg-red-900/20"
                                : "border-border"
                            }`}
                          >
                            {letter}
                          </div>
                        ))}
                      </div>
                      {player.id === gameState.currentLeaderId &&
                        gameState.leaderConsecutiveWins > 0 && (
                          <div className="absolute right-0 text-sm text-orange-600 dark:text-orange-400 font-medium">
                            🔥{gameState.leaderConsecutiveWins}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between h-full flex-shrink-0 ml-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Trophy className="w-3 h-3 lg:w-5 lg:h-5" />
                      <span className="text-xs sm:text-sm md:text-base font-medium">
                        {player.score}
                      </span>
                    </div>
                  </div>
                </div>
              );

              return (
                <div key={player.id}>
                  {player.id === gameState.currentPlayerId ? (
                    <motion.div
                      key={`current-${player.id}`}
                      initial={{
                        scale: 1,
                        opacity: 0.8,
                        y: 4,
                        rotate: -0.5,
                        transition: {
                          duration: 0.5,
                          ease: "easeOut",
                        },
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        y: 0,
                        rotate: 0,
                        boxShadow: "0 8px 24px -6px rgba(0, 0, 0, 0.12)",
                        transition: {
                          duration: 0.5,
                          ease: "easeOut",
                        },
                      }}
                      whileHover={{
                        y: -2,
                        scale: 1,
                        boxShadow: "0 12px 30px -8px rgba(0, 0, 0, 0.15)",
                        transition: {
                          duration: 0.2,
                          ease: "easeOut",
                        },
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      whileTap={{
                        scale: 1,
                        backgroundColor: "#00000040",
                        transition: {
                          duration: 0.05,
                          ease: "easeOut",
                        },
                      }}
                      className="relative z-10"
                    >
                      <Card className="p-2 h-18 shadow-md ring-1 ring-green-500 border-green-500 bg-green-100 dark:bg-green-800/30 dark:border-green-800">
                        {cardContent}
                      </Card>
                    </motion.div>
                  ) : (
                    <Card
                      className={`p-2 h-18 select-none  ${
                        player.isEliminated
                          ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 opacity-60"
                          : "bg-background border-gray-200 dark:border-gray-700 hover:shadow-sm"
                      }`}
                    >
                      {cardContent}
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InGamePlayerCards;
