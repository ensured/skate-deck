import { auth } from "@clerk/nextjs/server";
import { CreateUsername } from "../components/auth/CreateUsername";
import { getUserByClerkId } from "@/actions/actions";
import { GameBoard } from "@/components/game/GameBoard";
import { UserButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId, isAuthenticated } = await auth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please sign in to continue
          </h1>
          <UserButton />
          <p>You need to be signed in to access the game.</p>
        </div>
      </div>
    );
  }

  try {
    const user = await getUserByClerkId(userId);

    // If user doesn't exist or doesn't have a username, show the CreateUsername component
    if (!user || !user.username) {
      return <CreateUsername userId={userId} />;
    }

    return <GameBoard />;
  } catch (error) {
    console.error("Error loading user:", error);
    return <div>Error loading user information. Please try again later.</div>;
  }
}
