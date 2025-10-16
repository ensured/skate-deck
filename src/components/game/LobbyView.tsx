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
import { useRef } from "react";

type LobbyViewProps = {
  gameState: GameState;
  startGame: (players: Player[]) => void;
  isHowToPlayOpen: boolean;
  setIsHowToPlayOpen: (open: boolean) => void;
  nameRef: RefObject<HTMLInputElement | null>;
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
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const editingInputRef = useRef<HTMLInputElement>(null);
  const [newPlayerNameInput, setNewPlayerNameInput] = useState(
    gameState.players[0].name
  );
  const [isChangeUsernameDialogOpen, setIsChangeUsernameDialogOpen] =
    useState(false);
  const newPlayerNameInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleStartEdit = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditingName(player.name);
    setTimeout(() => editingInputRef.current?.focus(), 0);
  };

  const handleSaveEdit = () => {
    if (editingPlayerId && editingName.trim()) {
      const trimmedName = editingName.trim();
      if (trimmedName.length < 3) {
        toast.error("Player name must be at least 3 characters", {
          position: "top-center",
          duration: 5000,
        });
        return;
      }
      const existingPlayer = gameState.players.find(
        (player) =>
          player.name.toLowerCase() === trimmedName.toLowerCase() &&
          player.id !== editingPlayerId
      );
      if (existingPlayer) {
        toast.error("Player name already exists");
        return;
      }
      updatePlayerName(editingPlayerId, trimmedName);
    }
    setEditingPlayerId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
    setEditingName("");
  };

  const handleChangeUsername = async (clerkId: string) => {
    setLoading(true);
    try {
      const result = await changeUsername(clerkId, newPlayerNameInput);

      if (result?.success) {
        toast.success("Username changed successfully");
        updatePlayerName(gameState.currentPlayerId, newPlayerNameInput);
        setIsChangeUsernameDialogOpen(false);
      } else if (result?.error) {
        const toastDescription = result?.error.includes("exceeded")
          ? ``
          : `${result.remaining} Remaining Attempt${
              result.remaining === 1 ? "" : "s"
            }`;
        toast.error(result.error, {
          description: toastDescription,
          duration: 5000,
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
      newPlayerNameInputRef.current?.focus();
    }
  };
  return (
    <div className="max-w-lg mx-auto animate-fade-in py-8 px-2 select-none">
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
                onChange={(e) =>
                  setName(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))
                }
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
            >
              {gameState.players.map((player, idx) => (
                <div key={idx} className="border-b border-border">
                  <div className="flex items-center justify-between py-0.5 px-2 w-full ">
                    <div className="flex items-center gap-1.5">
                      {editingPlayerId === player.id && !player.isCreator ? (
                        <Input
                          ref={editingInputRef}
                          value={editingName}
                          onChange={(e) =>
                            setEditingName(
                              e.target.value.replace(/[^a-zA-Z0-9]/g, "")
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit();
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                          onBlur={handleSaveEdit}
                          className="h-7 text-sm font-medium"
                          maxLength={20}
                          autoFocus
                        />
                      ) : (
                        <div
                          className="flex font-medium cursor-pointer hover:bg-accent/50 rounded px-1 py-0.5 transition-colors"
                          onClick={() => handleStartEdit(player)}
                        >
                          {player.name}
                        </div>
                      )}
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
                              className="cursor-pointer h-7 text-xs sm:text-sm border !border-border/50 hover:border-primary/50 transition-all"
                            >
                              Change Username
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Change Username</DialogTitle>
                              <DialogDescription>
                                Enter your new username.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="flex flex-col items-center gap-4">
                                <Label htmlFor="username">New Username</Label>
                                <Input
                                  id="username"
                                  type="text"
                                  ref={newPlayerNameInputRef}
                                  value={newPlayerNameInput}
                                  onChange={(e) =>
                                    setNewPlayerNameInput(
                                      e.target.value.replace(
                                        /[^a-zA-Z0-9]/g,
                                        ""
                                      )
                                    )
                                  }
                                  className="max-w-[20rem]"
                                />
                              </div>
                            </div>
                            <DialogFooter className="relative">
                              <DialogClose asChild className="cursor-pointer">
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button
                                onClick={() =>
                                  handleChangeUsername(player.clerkId!)
                                }
                                className="cursor-pointer"
                                disabled={
                                  loading ||
                                  newPlayerNameInput === player.name ||
                                  newPlayerNameInput.trim() === "" ||
                                  newPlayerNameInput.length < 3
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
                          nameRef.current?.focus();
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
