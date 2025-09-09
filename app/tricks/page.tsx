"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { trickCards } from "@/lib/tricks";

type SortConfig = {
    key: keyof typeof trickCards[0] | null;
    direction: 'asc' | 'desc';
};

export default function TricksPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: null,
        direction: 'asc'
    });

    const handleSort = (key: keyof typeof trickCards[0]) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedTricks = [...trickCards].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredTricks = sortedTricks.filter(trick =>
        Object.values(trick).some(
            value => String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getSortIcon = (key: string) => {
        if (sortConfig.key !== key) return null;
        return (
            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortConfig.direction === 'desc' ? 'transform rotate-180' : ''
                }`} />
        );
    };

    return (
        <div className=" py-8 px-4 flex justify-center items-center w-full">
            <div className="flex flex-col space-y-4 w-full container">
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Tricks</h1>
                    <p className="text-muted-foreground">
                        Browse all available skateboard tricks
                    </p>
                </div>

                <div className="flex items-center">
                    <Input
                        placeholder="Search tricks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <div className="rounded-md border w-full flex justify-center items-center">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('name')}
                                        className="p-0 hover:bg-transparent"
                                    >
                                        Name
                                        {getSortIcon('name')}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('difficulty')}
                                        className="p-0 hover:bg-transparent"
                                    >
                                        Difficulty
                                        {getSortIcon('difficulty')}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('points')}
                                        className="p-0 hover:bg-transparent"
                                    >
                                        Points
                                        {getSortIcon('points')}
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTricks.map((trick) => (
                                <TableRow key={trick.id}>
                                    <TableCell className="font-medium">{trick.name}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trick.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            trick.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                trick.difficulty === 'Advanced' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {trick.difficulty}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">{trick.points}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
