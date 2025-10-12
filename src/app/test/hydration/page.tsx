// Server Component
import { Suspense } from "react";
import { Inter } from "next/font/google";
import ServerUserList from "./ServerUserList";
import ClientCounter from "./ClientCounter";
import { Skeleton } from "@/components/ui/skeleton";

const inter = Inter({ subsets: ["latin"] });

export default function HydrationDemo() {
  return (
    <main className={`min-h-screen p-8 ${inter.className}`}>
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold mb-2">Partial Hydration Demo</h1>
          <p className="text-gray-600">
            This page demonstrates partial hydration in Next.js. The user list
            is server-rendered, while the counter is hydrated on the client.
          </p>
        </header>

        <Suspense fallback={<Skeleton className="h-52" />}>
          <ServerUserList />
        </Suspense>

        <ClientCounter />
      </div>
    </main>
  );
}
