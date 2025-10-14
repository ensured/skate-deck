"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";

interface GameLogProps {
  logs: string[];
}

export function GameLog({ logs }: GameLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const displayLogs = isExpanded ? logs : logs.slice(-5);
  const hasLogs = logs.length > 0;

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (isExpanded) {
      const container = document.getElementById("game-log-container");
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [logs, isExpanded]);

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-24 right-6 z-50 flex items-center gap-2"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          variant="outline"
          size="icon"
          className="rounded-full w-10 h-10 shadow-md bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/100 transition-all"
        >
          <MessageSquare className="h-4 w-4" />
          {hasLogs && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
              {logs.length > 9 ? "9+" : logs.length}
            </span>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed top-32 right-6 z-50 w-full max-w-xs"
    >
      <Card className="shadow-xl border-border/50 overflow-hidden w-full">
        <CardHeader className="pb-2 pt-3 pr-10 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Game Log
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? "Show Less" : `Show All (${logs.length})`}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 p-0 absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          {!hasLogs ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No game events yet
            </p>
          ) : (
            <div
              id="game-log-container"
              className="max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            >
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {displayLogs.map((log, index) => (
                    <motion.div
                      key={`${log}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm pb-2 border-b last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground text-xs mt-0.5 flex-shrink-0">
                          {new Date().toLocaleTimeString()}
                        </span>
                        <span>{log}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
