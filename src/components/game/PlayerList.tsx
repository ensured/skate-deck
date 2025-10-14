import React from "react";
import { Button } from "../ui/button";
import { Lock, Trash2, ArrowDown } from "lucide-react";

interface PlayerListProps {
  players: Array<{
    id: number;
    name: string;
    isCreator: boolean;
  }>;
  onRemovePlayer: (id: number) => void;
  scrolledAtTop: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  onRemovePlayer,
  scrolledAtTop,
  onScroll,
}) => {
  return (
    <div
      className="border rounded-lg max-h-[25.61em] overflow-y-auto shadow-sm relative"
      onScroll={onScroll}
    >
      {players.map((player) => (
        <div key={player.id} className="border-b border-border">
          <div className="flex items-center justify-between py-0.5 px-2 w-full">
            <div className="flex items-center gap-1.5">
              <div className="flex font-medium">{player.name}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={"ghost"}
                size="icon"
                className={`transition-all duration-100 ${
                  player.isCreator
                    ? "cursor-not-allowed text-black/50 dark:text-white/50"
                    : "cursor-pointer hover:text-red-400/90 dark:hover:text-red-600/60"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePlayer(player.id);
                }}
                disabled={players.length <= 1 || player.isCreator}
                title={
                  player.isCreator
                    ? "Cannot remove game owner"
                    : "Remove player"
                }
              >
                {player.isCreator ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-2 right-1/2 translate-x-1/2">
        {players.length > 10 && scrolledAtTop && (
          <p className="text-xs text-muted-foreground items-center gap-1 p-1 flex justify-center">
            <ArrowDown className="inline w-3 h-3 animate-[bounce_1.9s_ease-in-out_infinite]" />
            +{players.length - 10} more
          </p>
        )}
      </div>
    </div>
  );
};

export default PlayerList;
