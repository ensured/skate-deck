import { Skeleton } from "./ui/skeleton";

export function TurnTransitionSkeleton() {
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-2xl mx-auto">
            <div className="p-6 space-y-6">
                <div className="space-y-1.5">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-6 w-36 mx-auto" />
                </div>
                <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
                    <Skeleton className="h-7 w-36 mx-auto" />
                    <Skeleton className="h-9 w-56 mx-auto" />
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-5 w-full max-w-xs mx-auto" />
                        <Skeleton className="h-5 w-5/6 mx-auto" />
                    </div>
                </div>
                <div className="flex justify-center gap-4 pt-2">
                    <Skeleton className="h-10 w-28 rounded-md" />
                    <Skeleton className="h-10 w-28 rounded-md" />
                </div>
            </div>
        </div>
    );
}
