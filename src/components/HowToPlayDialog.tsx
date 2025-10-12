import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import Link from "next/link";
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
      <DialogContent className="!max-w-[96%] max-h-[96%] md:!max-w-[75%] xl:!max-w-[50%] overflow-y-auto thin-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-4xl">How to Play</DialogTitle>
        </DialogHeader>
        <div className="text-center mb-12 ">
          <p className="text-xl text-muted-foreground">
            A trick-taking game where the last skater standing wins!
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Objective</CardTitle>
              <CardDescription>
                Be the last player remaining by avoiding collecting all letters
                in "S.K.A.T.E"
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Players:</strong> 2+ players
                </li>
                <li>
                  <strong>Cards:</strong> 98 unique trick cards
                </li>
                <li>
                  <strong>Game Word:</strong> S.K.A.T.E (5 letters = 5 strikes
                  to elimination)
                </li>
                <li>
                  <strong>Initial Leader:</strong> Randomly selected
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Gameplay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <h3 className="font-semibold text-lg mb-2">Turn Structure</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Leader draws and attempts a trick</li>
                  <li>
                    All other players attempt the same trick in turn order
                  </li>
                  <li>Round ends when all players have attempted the trick</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Leader&apos;s Role
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Draws a card and sets the trick for all players</li>
                  <li>
                    <strong>Success:</strong> +1 to consecutive streak
                  </li>
                  <li>
                    <strong>Failure:</strong> Receive a letter and pass
                    leadership
                  </li>
                  <li>
                    After 3 successful tricks, leadership passes to next player
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Follow Mode</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Must attempt the leader&apos;s trick in turn order</li>
                  <li>
                    <strong>Success:</strong> No penalty, earn points
                  </li>
                  <li>
                    <strong>Failure:</strong> Receive a letter from "S.K.A.T.E"
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Scoring & Elimination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc pl-5 space-y-2">
                <li>Each miss gives 1 letter: S → K → A → T → E</li>
                <li>Collect all 5 letters and you&apos;re out!</li>
                <li>Last player remaining wins the game</li>
              </ul>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 pt-4 pb-6 -mx-6 px-6 mt-8">
            <div className="flex justify-end">
              <Button
                asChild
                size="lg"
                className="gap-2 rounded-full h-12 shadow-lg"
                onClick={() => onOpenChange(false)}
              >
                <Link href="/">
                  <Play className="h-5 w-5" />
                  Start Playing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowToPlayDialog;
