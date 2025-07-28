'use client';

import { Loader2, RotateCcw, Target, Users } from "lucide-react";
import { Card, CardTitle, CardHeader, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";

const gameStateCardSkeleton = () => {
    return (
        <div className="flex justify-center flex-col items-center gap-6 w-full">
            <Skeleton className=" h-[150px] !bg-black/20 w-full border border-blue-500/40">
                <div className="h-full w-full flex justify-center items-center">

                </div>

            </Skeleton>
            <Skeleton className="h-[258px] !bg-black/20 w-full border border-border/20">
                <div className="h-full w-full flex justify-center items-center">


                </div>

            </Skeleton>
            <div className="w-full flex justify-center items-center">
                <Skeleton className="text-center h-[40px] w-[145px] bg-black/20 border border-border/20" />
            </div>

        </div>
    )
}

export default gameStateCardSkeleton