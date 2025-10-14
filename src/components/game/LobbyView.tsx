import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  ArrowDown,
  Check,
  Lock,
  Play,
  Trash2,
  UserPlus,
  Users2,
  X,
} from "lucide-react";
import { BookOpen } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { GameState } from "@/types/game";
import HowToPlayDialog from "./HowToPlayDialog";
import { RefObject } from "react";
import { Player } from "@/types/player";

type LobbyViewProps = {
  gameState: GameState;
  startGame: (players: Player[]) => void;
  isHowToPlayOpen: boolean;
  setIsHowToPlayOpen: (open: boolean) => void;
  nameRef: RefObject<HTMLInputElement | null>;
  playerRef: RefObject<HTMLDivElement | null>;
  name: string;
  setName: (name: string) => void;
  isGameStarting: boolean;
  handleAddPlayer: () => void;
  shufflePlayers: boolean;
  toggleShufflePlayers: () => void;
  scrolledAtTop: boolean;
  setScrolledAtTop: (value: boolean) => void;
  removePlayer: (playerId: number) => void;
};

const LobbyView = ({
  gameState,
  startGame,
  isHowToPlayOpen,
  setIsHowToPlayOpen,
  nameRef,
  playerRef,
  name,
  setName,
  isGameStarting,
  handleAddPlayer,
  shufflePlayers,
  toggleShufflePlayers,
  scrolledAtTop,
  setScrolledAtTop,
  removePlayer,
}: LobbyViewProps) => {
  return (
    <div className="max-w-lg mx-auto animate-fade-in py-8 px-2">
      <Card className="border border-primary/15 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-background border-b items-center pt-8">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Game Lobby
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {gameState.players.length === 0 ? (
                    <Skeleton className="h-5 w-26" />
                  ) : (
                    `${gameState.players.length} player${
                      gameState.players.length !== 1 ? "s" : ""
                    } in lobby`
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsHowToPlayOpen(true)}
              className="cursor-pointer flex items-center gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              How to Play
            </Button>
            <HowToPlayDialog
              open={isHowToPlayOpen}
              onOpenChange={setIsHowToPlayOpen}
            />
          </div>
        </CardHeader>
        <CardContent className="px-6 space-y-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                ref={nameRef}
                placeholder="Enter player name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                className=" text-base"
                maxLength={20}
              />
            </div>
            <Button
              onClick={handleAddPlayer}
              disabled={!name.trim()}
              className="cursor-pointer px-6 text-base font-medium bg-gradient-to-r dark:from-primary from-primary/85 to-purple-600 hover:opacity-90 transition-opacity"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-end gap-1.5 items-center">
              {gameState.players.length > 1 && (
                <>
                  <div
                    className={`flex items-center gap-1.5 text-primary cursor-pointer p-2 rounded-md hover:bg-primary/5`}
                    onClick={toggleShufflePlayers}
                  >
                    Shuffle Players
                    {shufflePlayers ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <Button
                      onClick={() => startGame(gameState.players)}
                      size="lg"
                      className="cursor-pointer bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
                    >
                      <Play className="!w-5 !h-5" />
                      Start Game
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div
              className=" border rounded-lg max-h-[25.61em] overflow-y-auto shadow-sm relative"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                setScrolledAtTop(target.scrollTop === 0);
              }}
              ref={playerRef}
            >
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  ref={playerRef}
                  className="border-b border-border"
                >
                  <div className="flex items-center justify-between py-0.5 px-2 w-full ">
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
                          removePlayer(player.id);
                        }}
                        disabled={
                          gameState.players.length <= 1 || player.isCreator
                        }
                        title={
                          player.isCreator
                            ? "Cannot remove game owner"
                            : "Remove player"
                        }
                      >
                        {player.isCreator ? (
                          <Lock className="w-4 h-4 " />
                        ) : (
                          <Trash2 className="w-4 h-4 " />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="absolute bottom-2 right-1/2 translate-x-1/2 ">
                {gameState.players.length > 10 && scrolledAtTop && (
                  <p className="text-xs text-muted-foreground items-center gap-1 p-1 flex justify-center">
                    <ArrowDown className="inline w-3 h-3 animate-[bounce_1.9s_ease-in-out_infinite]" />
                    +{gameState.players.length - 10} more
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LobbyView;
