import { trickCards } from "@/types/tricks";
import { TrickRow } from "@/components/tricks/TrickRow";
import type { Difficulty } from "@/components/tricks/TrickRow";

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Pro: 4,
} as const;

export default function TricksPage() {
  // Sort tricks on the server
  const sortedTricks = [...trickCards].sort(
    (a, b) =>
      DIFFICULTY_ORDER[a.difficulty as Difficulty] -
        DIFFICULTY_ORDER[b.difficulty as Difficulty] || b.points - a.points
  );

  return (
    <div className="mx-auto px-3 py-4 max-w-[44em] md:max-w-[88vw] transition-all duration-500 ease-in-out">
      <div className="mb-4 text-center">
        <h1 className="text-2xl  font-bold mb-2 text-primary/80 dark:text-primary">
          ({sortedTricks.length}) Skateboard Tricks
        </h1>
      </div>

      <div className="rounded-md border border-primary/20 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/20">
              <th className="w-[200px] text-left px-4 py-2">Trick</th>
              <th className="w-[120px] text-center px-4 py-2">Difficulty</th>
              <th className="w-[100px] text-right px-4 py-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {sortedTricks.map((trick) => (
              <TrickRow
                key={trick.id}
                trick={{
                  ...trick,
                  id: trick.id.toString(),
                  difficulty: trick.difficulty as
                    | "Beginner"
                    | "Intermediate"
                    | "Advanced"
                    | "Pro",
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
