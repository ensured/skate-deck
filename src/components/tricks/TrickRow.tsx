import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Pro";

type Trick = {
  id: string;
  name: string;
  difficulty: Difficulty;
  points: number;
  description: string;
};

const TrickDescription = ({ description }: { description: string }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0 ml-2 hover:bg-transparent"
        aria-label="View description"
      >
        <Info className="h-4 w-4 text-muted-foreground" />
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Description</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p>{description}</p>
      </div>
    </DialogContent>
  </Dialog>
);

export const TrickRow = ({ trick }: { trick: Trick }) => {
  const difficulty = trick.difficulty as Difficulty;
  const { bg, text } = difficultyColors[difficulty];

  return (
    <tr className="hover:bg-accent border-border border-t">
      <td className="px-4 py-3 font-medium">
        <div className="flex items-center">
          <span className="hidden sm:inline">{trick.name}</span>
          <span className="sm:hidden">{trick.name}</span>
          <TrickDescription description={trick.description} />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-center">
          <Badge
            className={`${bg} ${text} hover:${bg} hover:opacity-90`}
            variant="secondary"
          >
            {trick.difficulty}
          </Badge>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-medium">{trick.points} pts</td>
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
