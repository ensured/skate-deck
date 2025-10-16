import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  ArrowDown,
  Check,
  Loader2,
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
import { RefObject, useRef } from "react";
import { Player } from "@/types/player";
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
import { Label } from "../ui/label";
import { changeUsername } from "@/actions/actions";
import { useState } from "react";
import { toast } from "sonner";

type LobbyViewProps = {
  gameState: GameState;
  startGame: (players: Player[]) => void;
  isHowToPlayOpen: boolean;
  setIsHowToPlayOpen: (open: boolean) => void;
  nameRef: RefObject<HTMLInputElement | null>;
  playerRef: RefObject<HTMLDivElement | null>;
  name: string;
  setName: (name: string) => void;
  handleAddPlayer: () => void;
  shufflePlayers: boolean;
  toggleShufflePlayers: () => void;
  scrolledAtTop: boolean;
  setScrolledAtTop: (value: boolean) => void;
  removePlayer: (playerId: number) => void;
  updatePlayerName: (id: number, name: string) => void;
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
  handleAddPlayer,
  shufflePlayers,
  toggleShufflePlayers,
  scrolledAtTop,
  setScrolledAtTop,
  removePlayer,
  updatePlayerName,
}: LobbyViewProps) => {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isChangeUsernameDialogOpen, setIsChangeUsernameDialogOpen] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangeUsername = async (oldName: string) => {
    setLoading(true);
    try {
      const result = await changeUsername(oldName, newPlayerName);

      if (result.success) {
        toast.success("Username changed successfully");
        updatePlayerName(gameState.currentPlayerId, newPlayerName);
        setIsChangeUsernameDialogOpen(false);
      } else if (result.error) {
        toast.error("Error", {
          description: result.error,
          duration: 5000,
        });

        // If it's a rate limit error, show a more prominent message
        if (result.error.includes("Rate limit exceeded")) {
          toast.error("Too Many Requests", {
            description: result.error,
            duration: 5000,
            icon: <X className="w-4.5 h-4.5 text-red-500" />,
          });
        }

        if (result.error.includes("Username already taken")) {
          toast.error("Username already taken", {
            description: result.error,
            duration: 5000,
            icon: <X className="w-4.5 h-4.5 text-red-500" />,
          });
        }

        setIsChangeUsernameDialogOpen(false);
      }
    } catch (error) {
      // Handle any unexpected errors
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error("Error", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
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
                      {player.isCreator && (
                        <Dialog
                          onOpenChange={setIsChangeUsernameDialogOpen}
                          open={isChangeUsernameDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant={"ghost"}
                              className="cursor-pointer border !border-border/50 hover:border-primary/50 transition-all"
                            >
                              Change Username
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Change Username</DialogTitle>
                              <DialogDescription>
                                Enter your new username to change it.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="username">New Username</Label>
                                <Input
                                  id="username"
                                  type="text"
                                  value={newPlayerName}
                                  onChange={(e) =>
                                    setNewPlayerName(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <DialogFooter className="relative">
                              <DialogClose asChild className="cursor-pointer">
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button
                                onClick={() =>
                                  handleChangeUsername(player.name)
                                }
                                className="cursor-pointer"
                                disabled={
                                  loading ||
                                  newPlayerName === player.name ||
                                  newPlayerName.trim() === "" ||
                                  newPlayerName.length < 3
                                }
                              >
                                Save changes{" "}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
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
