import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollText } from "lucide-react";
import { GameState } from "@/types/game";

const InGameHeader = ({
  gameState,
  getDeckStatus,
}: {
  gameState: GameState;
  getDeckStatus: () => { remaining: number; total?: number };
}) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 -mb-1">
      <Badge variant="default" className="text-sm">
        Players ({gameState.players.length})
      </Badge>
      <Badge variant="default" className="text-sm">
        Status: {gameState.status.toUpperCase()}
      </Badge>
      <Badge variant="default" className="text-sm">
        Round {gameState.round}
      </Badge>
      <Badge variant="default" className="text-sm">
        {getDeckStatus().remaining}/{getDeckStatus().total} cards
      </Badge>
      <Dialog>
        <DialogTrigger asChild className="cursor-pointer">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-sm !bg-accent/95"
          >
            <ScrollText className="h-3.5 w-3.5" />
            Log ({gameState.gameLog.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5" />
              Game Log
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2 p-1">
            {gameState.gameLog.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <ScrollText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  No events yet...
                </p>
              </div>
            ) : (
              gameState.gameLog.slice(-50).map((log, index) => (
                <div
                  key={index}
                  className="text-sm p-3 bg-muted/50 rounded-lg border hover:bg-muted transition-colors"
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InGameHeader;
