import React from 'react';
import { Player } from '@/types/game';
import { Crown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayersProps {
  players: Player[];
  currentPlayerId: string | null;
  currentLeaderId: string | null;
}
const GAME_LETTERS = ['G', 'R', 'I', 'N', 'D'];
export const Players: React.FC<PlayersProps> = ({
  players,
  currentPlayerId,
  currentLeaderId,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Players</h3>
      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border-2 transition-colors',
              player.id === currentPlayerId
                ? 'border-primary bg-primary/10'
                : 'border-border/50 hover:border-border/80',
              player.isEliminated && 'opacity-60'
            )}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                {player.id === currentLeaderId && (
                  <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 rounded-full p-0.5">
                    <Crown className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{player.name}</span>
                  {player.isEliminated && (
                    <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">
                      ELIMINATED
                    </span>
                  )}
                </div>
                {player.consecutiveWins > 0 && (
                  <div className="flex items-center text-xs text-amber-500 mt-0.5">
                    <span className="font-medium">🔥 {player.consecutiveWins} streak</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{player.score} pts</div>
              {player.letters > 0 && (
                <div className="text-xs text-muted-foreground flex justify-end space-x-1 mt-0.5">
                  {GAME_LETTERS.slice(0, player.letters).map((letter) => (
                    <span key={letter} className="font-mono font-bold">
                      {letter}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Players;
