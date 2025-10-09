import { auth } from "@clerk/nextjs/server";
import { CreateUsername } from "../components/CreateUsername";
import { getUserByClerkId } from "@/actions/actions";
import GameBoard from "@/components/GameBoard";

export default async function Home() {
  const { userId, isAuthenticated } = await auth();

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to continue</h1>
        <p>You need to be signed in to access the game.</p>
      </div>
    </div>;
  }



  try {
    const user = await getUserByClerkId(userId);

    // If user doesn't exist or doesn't have a username, show the CreateUsername component
    if (!user || !user.username) {
      return <CreateUsername userId={userId} />;
    }

    // Only show the GameBoard if user is authenticated and has a username
    return <GameBoard hasUsername={user?.username ? true : false} />;
  } catch (error) {
    console.error('Error loading user:', error);
    return <div>Error loading user information. Please try again later.</div>;
  }
}
