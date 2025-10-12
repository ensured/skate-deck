import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HowToPlay() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">How to Play G.R.I.N.D</h1>
        <p className="text-xl text-muted-foreground">
          A trick-taking game where the last skater standing wins!
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Objective</CardTitle>
            <CardDescription>
              Be the last player remaining by avoiding collecting all letters in
              "G.R.I.N.D"
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setup</CardTitle>
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
                <strong>Game Word:</strong> G.R.I.N.D (5 letters = 5 strikes to
                elimination)
              </li>
              <li>
                <strong>Initial Leader:</strong> Randomly selected
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gameplay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Turn Structure</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Leader draws and attempts a trick</li>
                <li>All other players attempt the same trick in turn order</li>
                <li>Round ends when all players have attempted the trick</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Leader&apos;s Role</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Draws a card and sets the trick for all players</li>
                <li>
                  <strong>Success:</strong> +1 to consecutive streak
                </li>
                <li>
                  <strong>Failure:</strong> Receive a letter and pass leadership
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
                  <strong>Failure:</strong> Receive a letter from "G.R.I.N.D"
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scoring & Elimination</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Each miss gives 1 letter: G → R → I → N → D</li>
              <li>Collect all 5 letters and you&apos;re out!</li>
              <li>Last player remaining wins the game</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Button asChild size="lg">
            <Link href="/">Start Playing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
