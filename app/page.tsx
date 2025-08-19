// app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Play, RotateCcw, Target, X, Users, Check, ArrowDown } from "lucide-react";
import gameStateCardSkeleton from "@/components/gameStateCardSkeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { difficultyColors } from "@/lib/tricks";
import { SKATE_LETTERS } from "@/lib/tricks";
import { useSkateboardGame } from "@/components/useSkateboardGame";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";

export default function SkateboardCardGame() {
  const {
    gameState,
    setGameState,
    localStorageLoading,
    newPlayerName,
    setNewPlayerName,
    currentPlayer,
    activePlayers,
    playersToAttempt,
    addPlayer,
    removePlayer,
    startGame,
    landTrick,
    missTrick,
    resetGame,
    newGame,
    handleSkillCardClick,
    handleTrickSelect
  } = useSkateboardGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="text-center mb-8">
          <h1 className="text-white font-bold text-balance text-[clamp(1.9rem,3.8vw,3.3rem)] leading-tight mb-2">
            The S.K.A.T.E Deck
          </h1>
          <p className="text-gray-300 text-[clamp(0.875rem,2.5vw,1.25rem)] leading-snug">
            Tricks, Flicks, and Epic Picks! 🛹
          </p>

        </div>

        {localStorageLoading && gameStateCardSkeleton()}

        {gameState.showTrickPicker && (
          <AlertDialog open={true}>
            <AlertDialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-xl font-semibold mb-4">
                  Pick Your Trick
                </AlertDialogTitle>
              </AlertDialogHeader>
              <div className="grid grid-cols-1 gap-3 mb-4">
                {gameState.trickPickerOptions?.map((trick) => (
                  <Button
                    key={trick.id}
                    onClick={() => handleTrickSelect(trick)}
                    className="bg-blue-800 hover:bg-blue-700 border border-blue-500/50 text-white p-4 rounded-lg text-left"
                  >
                    <div className="font-bold text-lg">{trick.name}</div>
                  </Button>
                ))}
              </div>
              {/* Only show close button when modal overlay is not active */}
              {!gameState.modalOverlay && (
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setGameState((prev) => ({ ...prev, showTrickPicker: false }))}
                    className="w-full bg-gray-600 hover:bg-gray-500"
                  >
                    Cancel
                  </AlertDialogCancel>
                </AlertDialogFooter>
              )}
            </AlertDialogContent>
          </AlertDialog>
        )}



        {!gameState.gameStarted ? (
          <div className="space-y-6">
            {!localStorageLoading && (
              <Card className="bg-black/20 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Players
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Enter player name"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addPlayer()}
                      className="bg-gray-800 border-gray-600 text-white"
                      maxLength={20}
                    />
                    <Button
                      onClick={addPlayer}
                      disabled={!newPlayerName.trim() || gameState.players.length >= 8}
                      className="w-full sm:w-auto px-4 py-3 text-base rounded-md shadow-md bg-blue-600 hover:bg-blue-700 transition"
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm">{gameState.players.length}/8 players • Need at least 2 to start</p>
                </CardContent>
              </Card>
            )}
            {gameState.players.length > 0 && (
              <Card className="bg-black/20 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Players ({gameState.players.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {gameState.players.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                        <span className="text-white font-medium">
                          {index + 1}. {player.name}
                        </span>
                        <Button
                          onClick={() => removePlayer(player.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {gameState.players.length >= 2 && (
              <div className="text-center">
                <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
                  <Play className="h-5 w-5 mr-2" />
                  Start Game
                </Button>
              </div>
            )}
          </div>
        ) : gameState.gamePhase === "game-over" ? (
          <div className="text-center space-y-6">
            <Card className="bg-black/50 border-yellow-600 max-w-md mx-auto transition-all duration-300">
              <CardContent className="p-4 sm:p-6 md:p-8">

                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
                <p className="text-xl text-yellow-400 mb-4">{gameState.winner} Wins!</p>
                <p className="text-gray-300 mb-6">Completed {gameState.roundNumber - 1} rounds</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Play Again
                  </Button>
                  <Button
                    onClick={newGame}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
                  >
                    New Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-blue-600 hover:border-blue-400 transition-all duration-300 p-4 sm:p-6 text-white rounded-xl shadow-md cursor-pointer"

              onClick={() => setGameState((prev) => ({ ...prev, showTurnModal: true }))}
            >
              <div className="text-center space-y-3">
                <div className="flex justify-center items-center gap-4 text-sm sm:text-base text-gray-300 font-medium">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-blue-400" />
                    Round <span className="font-semibold text-white">{gameState.roundNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="font-semibold text-white">{activePlayers.length}</span> players left
                  </div>
                </div>

                <div>
                  <p className="uppercase text-xs tracking-wide text-gray-400 mb-1">Current Trick</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-300">{gameState.currentTrick?.name}</h2>
                </div>

                <div className="text-sm sm:text-base text-gray-400 mt-4">
                  {gameState.trickLeaderLanded ? (
                    <p>
                      <span className="font-semibold text-white">{playersToAttempt.length}</span>{" "}
                      player{playersToAttempt.length !== 1 ? "s" : ""} need to attempt
                    </p>
                  ) : (
                    <p>
                      <span className="font-semibold text-yellow-400">{currentPlayer?.name}</span>{" "}
                      to set the trick
                    </p>
                  )}
                </div>
              </div>
            </Card>


            <AlertDialog
              open={gameState.showTurnModal}
              onOpenChange={(isOpen) => setGameState((prev) => ({ ...prev, showTurnModal: isOpen }))}
            >
              <AlertDialogContent className="bg-gray-900 border-gray-600 text-white max-w-md transition-all duration-300">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-center">
                    <span className="text-2xl text-yellow-400 flex items-center justify-center gap-2">
                      {currentPlayer?.name}'s Turn
                    </span>
                  </AlertDialogTitle>
                </AlertDialogHeader>

                {gameState.currentTrick && (
                  <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-blue-500 transition-all duration-300">
                      <CardHeader className="text-center">
                        <CardTitle className="text-white text-2xl">{gameState.currentTrick.name}</CardTitle>
                        <Badge
                          className={`${difficultyColors[gameState.currentTrick?.difficulty ?? "Beginner"]} text-white w-fit mx-auto`}
                        >
                          {gameState.currentTrick?.difficulty ?? "N/A"}
                        </Badge>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-gray-300 mb-4">{gameState.currentTrick.description}</p>
                      </CardContent>
                    </Card>

                    <div className="flex gap-8 justify-between px-8">
                      <Button
                        onClick={landTrick}
                        className="bg-green-600 hover:bg-green-700 flex-1 h-24 transition-all duration-300"
                        size="lg"
                      >
                        <Check className="!h-10 !w-10" />
                      </Button>
                      <Button
                        onClick={missTrick}
                        className="bg-red-600/80 hover:bg-red-700/80 flex-1 h-24 transition-all duration-300"
                        size="lg"
                      >
                        <X className="!h-10 !w-10" />
                      </Button>
                    </div>

                    {(currentPlayer?.extraTries || 0) > 0 && (
                      <p className="text-center text-gray-300 text-sm">
                        Extra Tries Remaining: {currentPlayer?.extraTries}
                      </p>
                    )}

                    {currentPlayer?.skillCards && currentPlayer.skillCards.length > 0 && (
                      <div>
                        <Popover>
                          <PopoverTrigger asChild className="w-full flex justify-center items-center h-full">
                            <Button variant={"default"} className="text-center text-lg font-semibold !border !border-green-500/60">
                              Skill Cards <ArrowDown />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="bg-gray-900 border border-green-500/60 p-3 sm:p-4 rounded-lg w-[90vw] max-w-sm">
                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                              {currentPlayer.skillCards.map((card, index) => (
                                <div
                                  key={index}
                                  onClick={() => handleSkillCardClick(card.id)}
                                  className="cursor-pointer bg-purple-900/50 hover:bg-purple-800/50 transition-all duration-300 border border-purple-600 rounded-md p-2 sm:p-3 text-center"
                                >
                                  <div className="text-lg sm:text-xl mb-1">{card.icon}</div>
                                  <div className="text-xs sm:text-sm text-white font-semibold truncate">{card.name}</div>
                                  <div className="text-[10px] sm:text-xs text-gray-300 leading-tight line-clamp-2">
                                    {card.description}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </PopoverContent>

                        </Popover>
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Your current letters:</p>
                      <div className="flex gap-1 justify-center">
                        {SKATE_LETTERS.map((letter, index) => (
                          <div
                            key={letter}
                            className={`w-8 h-8 rounded border-2 flex items-center justify-center font-bold transition-all duration-300 ${index < (currentPlayer?.letters.length || 0)
                              ? "bg-red-600 border-red-500 text-white"
                              : "bg-gray-700 border-gray-600 text-gray-400"
                              }`}
                          >
                            {letter}
                          </div>
                        ))}
                      </div>
                      {gameState.currentPlayerIndex === gameState.leaderIndex && (
                        <p className="text-gray-400 text-sm mt-2">
                          Consecutive Tricks: {currentPlayer?.consecutiveTricks || 0}/3
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </AlertDialogContent>
            </AlertDialog>

            <Card className="bg-black/20 border-gray-600 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white text-base sm:text-lg">Players Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {gameState.players.map((player) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded border text-sm transition-all duration-300 ${player.isEliminated
                        ? "bg-red-900/20 border-red-600"
                        : player.id === currentPlayer?.id
                          ? "bg-blue-900/30 border-blue-500"
                          : "bg-gray-800 border-gray-600"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium truncate ${player.isEliminated ? "text-red-400" : "text-white"}`}>
                          {player.name}
                        </span>
                        <div className="flex gap-1">
                          {player.id === currentPlayer?.id && !player.isEliminated && (
                            <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5">Current</Badge>
                          )}
                          {player.isEliminated && <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0.5">Out</Badge>}
                          {!player.isEliminated &&
                            player.hasAttemptedCurrentTrick &&
                            gameState.trickLeaderLanded && (
                              <Badge className="bg-green-600 text-white text-[10px] px-1.5 py-0.5">✓</Badge>
                            )}
                        </div>
                      </div>

                      {/* Letters */}
                      <div className="flex gap-1 flex-wrap">
                        {SKATE_LETTERS.map((letter, index) => (
                          <div
                            key={letter}
                            className={`w-6 h-6 text-xs rounded border flex items-center justify-center font-bold transition-all duration-300 ${index < player.letters.length
                              ? "bg-red-600 border-red-500 text-white"
                              : "bg-gray-700 border-gray-600 text-gray-400"
                              }`}
                          >
                            {letter}
                          </div>
                        ))}
                      </div>

                      {/* Conditionally show Consecutive Tricks */}
                      {player.consecutiveTricks > 0 && (
                        <p className="text-gray-400 text-xs mt-2">🔥 {player.consecutiveTricks} in a row</p>
                      )}

                      {/* Conditionally show Skill Cards */}
                      {player.skillCards.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {player.skillCards.map((card, index) => (
                            <div
                              key={index}
                              className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded flex items-center gap-1"
                            >
                              <span className="text-sm">{card.icon}</span>
                              <span className="truncate max-w-[60px]">{card.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={resetGame}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 bg-transparent transition-all duration-300"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Game
              </Button>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};
