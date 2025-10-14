import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { RecycleIcon, RefreshCw, Settings } from "lucide-react";
import { useState } from "react";
import { useWindowSize } from "@uidotdev/usehooks";
import { useGame } from "@/hooks/useGame";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";

interface GameControlsSheetProps {
  gameState: any;
  isLobbyConfirmOpen: any;
  setIsLobbyConfirmOpen: any;
  reset: any;
  updatePowerUpChance: any;
  handleNewGame: any;
}

const GameControlsSheet = ({
  gameState,
  isLobbyConfirmOpen,
  setIsLobbyConfirmOpen,
  reset,
  updatePowerUpChance,
  handleNewGame,
}: GameControlsSheetProps) => {
  const [isGameControlsOpen, setIsGameControlsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const { width } = useWindowSize();
  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="relative group">
          {isGameControlsOpen && (
            <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          )}
          <Button
            onClick={() => setIsGameControlsOpen(!isGameControlsOpen)}
            size="lg"
            variant="default"
            className={`${
              width && width < 520 ? "w-14 h-14" : "w-15 h-15"
            } cursor-pointer relative rounded-full shadow-lg bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground border-2 border-background/30 dark:border-foreground/20 backdrop-blur-sm transition-all duration-300 ${
              isGameControlsOpen
                ? "ring-4 ring-ring/30 transform -translate-y-1"
                : "hover:shadow-xl hover:-translate-y-0.5"
            }`}
          >
            <Settings
              className={`${
                width && width < 520 ? "!w-6 !h-6" : "!w-6.5 !h-6.5"
              } transition-transform duration-300  ${
                isGameControlsOpen ? "rotate-180" : "group-hover:rotate-90"
              }`}
            />
          </Button>
          {/* Subtle tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg border border-border">
            Game Controls
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-b border-r border-border rotate-45 -mt-1"></div>
          </div>
        </div>
      </div>

      {/* Game Controls Sheet */}
      <Sheet open={isGameControlsOpen} onOpenChange={setIsGameControlsOpen}>
        <SheetContent side="bottom" className="py-6 rounded-t-2xl ">
          <SheetHeader className="pb-6 pt-2">
            <SheetTitle className="text-xl font-bold text-center  flex items-center justify-center gap-2">
              <Settings className="!w-6 !h-6" />
              Game Controls
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1 lg:w-[50%] sm:w-[60%] w-[90%] mx-auto">
            {/* 
                Power-up Chance Control (only shows at the beginning of the game until the first player makes a game action) 
                */}
            {gameState.round <= 1 &&
              gameState.currentPlayerId === gameState.players[0].id && (
                <div className=" grid grid-cols-2 gap-1 items-center border border-border/95 rounded-md p-4">
                  <div className="flex items-center justify-between col-span-1 p-2">
                    <Label
                      htmlFor="power-up-chance"
                      className="text-sm font-medium flex items-center  w-full justify-between"
                    >
                      <span>Power-up Chance: </span>
                      <span>
                        {Math.round(gameState.settings.powerUpChance * 100)}%
                      </span>
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground col-span-1 items-center p-2">
                    Chance for players with more letters to get a random
                    power-up (shield or choose trick)
                  </p>
                  <input
                    id="power-up-chance"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={gameState.settings.powerUpChance * 100}
                    onChange={(e) =>
                      updatePowerUpChance(Number(e.target.value) / 100)
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>
              )}

            {/* Game Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                  Game Actions
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <Dialog
                  open={isResetConfirmOpen}
                  onOpenChange={setIsResetConfirmOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 bg-white/80 dark:bg-gray-800/80 border-2 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-700 text-red-700 dark:text-red-300 font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <RecycleIcon className="w-4 h-4 mr-2" />
                      Reset Game
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Reset Game?
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        This will reset all players&apos; scores and letters
                        back to zero, and start a new game with a fresh deck.
                        This action cannot be undone.
                      </p>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsResetConfirmOpen(false)}
                        className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          reset();
                          setIsResetConfirmOpen(false);
                          setIsGameControlsOpen(false);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg cursor-pointer"
                      >
                        Reset Game
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isLobbyConfirmOpen}
                  onOpenChange={setIsLobbyConfirmOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 bg-white/80 dark:bg-gray-800/80 border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 dark:hover:border-blue-700 text-blue-700 dark:text-blue-300 font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group"
                      onClick={() => setIsResetConfirmOpen(true)}
                    >
                      <RefreshCw className="w-5 h-5 mr-2 transition-transform group-hover:rotate-180 duration-700" />
                      New Game
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        New Game?
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        This will reset all players&apos; scores and letters
                        back to zero, and start a new game with a fresh deck.
                        This action cannot be undone.
                      </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsResetConfirmOpen(false)}
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleNewGame}
                        className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg cursor-pointer"
                      >
                        Setup New Game
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default GameControlsSheet;
