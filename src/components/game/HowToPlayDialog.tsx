import { Button } from "../ui/button";

import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Play } from "lucide-react";
const HowToPlayDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-[90vw] !max-w-[696.9px] overflow-y-auto p-4">
        <div className="space-y-3">
          <div className="text-center">
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              S.K.A.T.E
            </DialogTitle>
            <p className="text-muted-foreground text-sm sm:text-base">
              A FFA Elimination Game
            </p>
          </div>

          <div className="space-y-3 text-sm sm:text-base">
            {/* Game Overview */}
            <div className="bg-muted/20 p-2 sm:p-3 rounded-lg">
              <h3 className="font-semibold text-base sm:text-lg mb-2 text-primary text-center">
                Quick Start
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="bg-muted/10 p-2 rounded-lg border border-muted/20">
                  <div className="font-medium text-sm text-primary/90">
                    1. Leader's Turn
                  </div>
                  <p className="text-xs sm:text-sm">
                    Each player takes turns being the <strong>Leader</strong>
                  </p>
                </div>
                <div className="bg-muted/10 p-2 rounded-lg border border-muted/20">
                  <div className="font-medium text-sm text-primary/90">
                    2. Draw & Attempt
                  </div>
                  <p className="text-xs sm:text-sm">
                    Leader draws a trick card and attempts it
                  </p>
                </div>
                <div className="bg-muted/10 p-2 rounded-lg border border-muted/20">
                  <div className="font-medium text-sm text-primary/90">
                    3. Follow the Leader
                  </div>
                  <p className="text-xs sm:text-sm">
                    Other players must match the trick in order
                  </p>
                </div>
                <div className="bg-muted/10 p-2 rounded-lg border border-muted/20">
                  <div className="font-medium text-sm text-primary/90">
                    4. Miss a Trick?
                  </div>
                  <p className="text-xs sm:text-sm">
                    Get a letter <span className="font-mono">(S-K-A-T-E)</span>
                  </p>
                </div>
                <div className="bg-muted/10 p-2 rounded-lg border border-muted/20">
                  <div className="font-medium text-sm text-primary/90">
                    5. 5 Strikes
                  </div>
                  <p className="text-xs sm:text-sm">
                    Collect all 5 letters and you're out!
                  </p>
                </div>
                <div className="dark:bg-emerald-500/40 bg-emerald-500/40 p-2 rounded-lg border border-emerald-700 dark:border-emerald-300">
                  <div className="font-medium text-sm ">🏆 Victory!</div>
                  <p className="text-xs sm:text-sm ">
                    Be the last player standing to win!
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Leader's Turn */}
              <div className="bg-muted/10 p-3 rounded-lg border border-muted/20">
                <DialogTitle className="font-semibold text-sm sm:text-base text-primary mb-1">
                  👑 Leader's Turn
                </DialogTitle>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-start gap-1.5">
                    <span className="text-green-500">✓</span>
                    <span>Land the trick: Stay as leader</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500">✗</span>
                    <span>Miss the trick: Get a letter & pass leader role</span>
                  </li>
                  <li className="text-xs text-muted-foreground mt-1">
                    After 3 successful trick landings, leader role passes to
                    next player
                  </li>
                </ul>
              </div>

              {/* Other Players */}
              <div className="bg-muted/10 p-3 rounded-lg border border-muted/20">
                <DialogTitle className="font-semibold text-sm sm:text-base text-primary mb-1">
                  🛹 Other Players
                </DialogTitle>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-start gap-1.5">
                    <span className="text-green-500">✓</span>
                    <span>Match the trick: Stay in the game</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500">✗</span>
                    <span>Miss the trick: Get a letter (S-K-A-T-E)</span>
                  </li>
                  <li className="text-xs text-muted-foreground mt-1">
                    5 letters and you're out of the game
                  </li>
                </ul>
              </div>

              {/* Scoring */}
              <div className="md:col-span-2 bg-muted/10 p-3 rounded-lg border border-muted/20">
                <DialogTitle className="font-semibold text-sm sm:text-base text-primary mb-2">
                  🏆 Winning
                </DialogTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <DialogTitle className="font-medium text-sm mb-1">
                      Elimination
                    </DialogTitle>
                    <div className="text-xs sm:text-sm space-y-1">
                      <p>Each miss gives you a letter:</p>
                      <div className="flex gap-1.5 text-center font-mono mt-1">
                        {["S", "K", "A", "T", "E"].map((letter, i) => (
                          <span
                            key={i}
                            className="bg-background px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border text-xs sm:text-sm"
                          >
                            {letter}
                          </span>
                        ))}
                      </div>
                      <p>Collect all 5 and you're out!</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Victory</h4>
                    <p className="text-xs sm:text-sm">
                      Be the last player remaining without collecting all 5
                      letters to win the game!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full h-10 sm:h-11 text-sm sm:text-base gap-2 mt-1"
          >
            <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Start Playing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowToPlayDialog;
