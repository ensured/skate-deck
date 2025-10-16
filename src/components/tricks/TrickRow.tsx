"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useWindowSize } from "@uidotdev/usehooks";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Pro";

type Trick = {
  id: string;
  name: string;
  difficulty: Difficulty;
  points: number;
  description: string;
};

export const TrickRow = ({ trick }: { trick: Trick }) => {
  const difficulty = trick.difficulty as Difficulty;
  const { bg, text } = difficultyColors[difficulty];

  const { width } = useWindowSize();

  return (
    <tr className="hover:bg-accent border-border border-t w-full ">
      <td className="py-1.5 font-medium ">
        <div className="flex items-center w-full ">
          <Dialog>
            <DialogTrigger asChild className="!px-3">
              <Button
                variant="ghost"
                size={"sm"}
                className="flex mx-1 justify-start cursor-pointer  dark:hover:!bg-background/30 hover:!bg-background "
                aria-label="View description"
              >
                <span className="text-lg">
                  {width && width < 640 && trick.name.length > 22
                    ? `${trick.name.slice(0, 22)}...`
                    : trick.name}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{trick.name}</DialogTitle>
              </DialogHeader>
              <div className="py-4 text-xl sm:text-2xl flex w-full">
                <p>{trick.description}</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </td>
      <td className="py-1.5">
        <div className="flex justify-center ">
          <Badge
            className={`${bg} ${text} hover:${bg} hover:opacity-90 `}
            variant="secondary"
          >
            {trick.difficulty}
          </Badge>
        </div>
      </td>
      <td className="py-1.5 pr-4.5 text-right font-medium">
        {trick.points} pts
      </td>
    </tr>
  );
};

const difficultyColors: Record<Difficulty, { bg: string; text: string }> = {
  Beginner: {
    bg: "bg-green-500/20",
    text: "text-green-600 dark:text-green-400",
  },
  Intermediate: {
    bg: "bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  Advanced: {
    bg: "bg-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  Pro: { bg: "bg-red-500/20", text: "text-red-600 dark:text-red-400" },
} as const;
