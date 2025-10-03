"use client";

import React from 'react';
import useGame from "@/hooks/useGame";
import { PlayerSetupForm } from "./PlayerSetupForm";
import { CreateUsername } from "./CreateUsername";
import { TrickCard } from "./TrickCard";
import { difficultyColors } from "@/types/tricks";
import { Player } from "@/types/game";
import { GameLog } from "./GameLog";
import { Players } from "./Players";

interface GameBoardProps {
    hasUsername: boolean;
}

const GameBoard = ({ hasUsername }: GameBoardProps) => {
    const {
        addPlayer,
        removePlayer,
        shufflePlayers,
        resetPlayers,
        startGame,
        handlePlayerAction,
        gameState,
        setGameStatus,
        clerkUser,
        isLoaded,
        hasInitialized
    } = useGame();

    // If user doesn't have a username, show the CreateUsername component
    if (!hasUsername) {
        return <CreateUsername userId={clerkUser?.id || ''} />;
    }

    if (gameState.status === 'lobby') {
        return (
            <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full p-4">
                <PlayerSetupForm
                    hasInitialized={hasInitialized}
                    isLoaded={isLoaded}
                    username={gameState.clerkUser?.username || ""}
                    players={gameState.players}
                    onAddPlayer={addPlayer}
                    onRemovePlayer={removePlayer}
                    onShufflePlayers={shufflePlayers}
                    onResetPlayers={resetPlayers}
                    onStartGame={startGame}
                />
            </div>
        );
    }

    if (gameState.status === 'game-over') {
        // Sort players by letters (ascending) and then by score (descending)
        const sortedPlayers = [...gameState.players].sort((a, b) => {
            if (a.letters !== b.letters) {
                return a.letters - b.letters;
            }
            return b.score - a.score;
        });

        const winner = sortedPlayers[0];

        return (
            <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full p-6">
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-bold text-primary">🏆 Game Over! 🏆</h2>
                    {winner && (
                        <div className="text-2xl font-semibold mt-2">
                            Winner: <span className="text-primary">{winner.name}</span> with only {winner.letters} letters!
                        </div>
                    )}
                </div>

                <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4 text-center">Final Standings</h3>
                        <div className="space-y-3">
                            {sortedPlayers.map((player, index) => (
                                <div
                                    key={player.id}
                                    className={`flex items-center justify-between p-4 rounded-lg ${index === 0
                                        ? 'bg-primary/10 border-2 border-primary/30'
                                        : 'bg-muted/50 hover:bg-muted/70 transition-colors'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${index === 0
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted-foreground/20 text-foreground/80'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {player.name}
                                                {index === 0 && <span className="ml-2 text-sm text-primary font-semibold">🏆 WINNER</span>}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {player.letters} {player.letters === 1 ? 'letter' : 'letters'} • {player.score} points
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                            {player.letters > 0 ? 'GRIND'.slice(0, player.letters) : 'CLEAN!'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center mt-2">
                    <button
                        onClick={() => setGameStatus('lobby')}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-lg"
                    >
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full p-4">
            {/* Left column - Players */}
            <div className="lg:col-span-1">
                <Players players={gameState.players} currentPlayerId={gameState.currentPlayerId} currentLeaderId={gameState.currentLeaderId} />
            </div>

            {/* Middle column - Game board */}
            <div className="lg:col-span-2 space-y-6">
                {/* Current Trick */}
                {gameState.currentTrick && (
                    <div className="space-y-4">
                        <div className="bg-card rounded-lg p-6 shadow-lg border-2 border-primary/20">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-primary">
                                    {gameState.currentPlayerId === clerkUser?.id ? '👑 Your Turn' : '🛹 Current Trick'}
                                </h3>
                                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                                    <span className="font-medium">{gameState.currentTrick.points} pts</span>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[gameState.currentTrick.difficulty as keyof typeof difficultyColors]?.bg || 'bg-gray-100'
                                            } ${difficultyColors[gameState.currentTrick.difficulty as keyof typeof difficultyColors]?.text || 'text-gray-800'
                                            }`}
                                    >
                                        {gameState.currentTrick.difficulty}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{gameState.currentTrick.name}</h3>
                            <p className="text-muted-foreground">{gameState.currentTrick.description}</p>

                            {/* Debug Info */}
                            {/* <div className="rounded text-xs text-muted-foreground">
                                <div>Player ID: {gameState.currentPlayerId}</div>
                            </div> */}

                            {/* Action Buttons */}
                            {gameState.currentPlayerId && (
                                <div className="mt-6 flex gap-4">
                                    <button
                                        onClick={() => handlePlayerAction('landed')}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        🛹 Landed It!
                                    </button>
                                    <button
                                        onClick={() => handlePlayerAction('missed')}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        ❌ Missed It
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Game Log */}
                {/* <GameLog logs={gameState.gameLog} className="mt-6" /> */}
            </div>
        </div>
    );
};

export default GameBoard;