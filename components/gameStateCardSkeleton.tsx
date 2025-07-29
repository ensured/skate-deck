'use client';
import { Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

const gameStateCardSkeleton = () => {
    return (
        <div className="flex justify-center flex-col items-center gap-6 w-full">
            <Skeleton className="h-[420px] 2xl:h-[357px] w-full bg-black/20 border border-gray-600 rounded-lg">
                <div className="h-full w-full flex justify-center items-center">
                    <Loader2 className="animate-spin size-10 text-white/80" />
                </div>
            </Skeleton>
            <div className="w-full flex justify-center items-center">
                <Skeleton className="text-center h-[46px] w-[175px] bg-black/20 border border-border/20" />
            </div>
        </div>
    )
}

export default gameStateCardSkeleton