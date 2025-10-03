import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Lock, Trash2, Crown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

interface PlayerInputProps {
  username: string;
}

export function PlayerInput({
  username,

}: PlayerInputProps) {
  const handleRemove = (e: React.MouseEvent | React.TouchEvent) => {

  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

  };

  const handleNameChange = (value: string) => {

  };

  return (
    <div className={cn("relative group")}>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400/30 to-indigo-400/30 dark:from-purple-500/20 dark:to-indigo-500/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300 ease-out" />

        <div className="relative">
          <div className="relative">
            <div className="relative overflow-visible">
              <Input
                className={cn(

                )}
                placeholder={username ?? "Enter username"}
                value={username}
                onChange={(e) => handleNameChange(e.target.value)}
                onKeyDown={handleKeyDown}
                inputMode="text"
                autoCapitalize="words"
                autoCorrect="off"
                readOnly={true}
              />
              {/* {creatorIndex === currentIndex && (
                <div className="absolute -right-1 -top-2 z-50">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-yellow-400/40 rounded-lg blur-sm animate-pulse" />
                    <Badge
                      variant="secondary"
                      className="relative h-5 px-2 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 border border-amber-200 dark:border-amber-400/50 rounded-full shadow-sm text-[11px] font-medium text-amber-900 dark:text-amber-50 whitespace-nowrap"
                    >
                      <Crown className="h-2.5 w-2.5 flex-shrink-0" />
                      <span>Creator</span>
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            {creatorIndex === currentIndex && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50">
                <Lock className="h-4 w-4" />
              </div>
            )}
            {name && creatorIndex !== currentIndex && (
              <button
                type="button"
                onClick={handleRemove}
                onTouchStart={handleRemove}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2",
                  "h-10 w-10 flex items-center justify-center",
                  "text-muted-foreground hover:text-destructive",
                  "rounded-full hover:bg-destructive/10 dark:hover:bg-destructive/20",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive/50",
                  "transition-colors duration-200 z-10 cursor-pointer user-select-none"
                )}
                aria-label={`Remove player ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )} */}
            </div>
          </div>
        </div>

        {/* {error && (
            <motion.p
              className="text-sm text-destructive px-2 mt-1"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {error}
            </motion.p>
          )} */}
      </motion.div>
    </div>
  );
}
