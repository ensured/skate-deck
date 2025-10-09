"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { createUser, getUserByClerkId } from "@/actions/actions";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateUsername({ userId }: { userId: string }) {
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Check if user already has a username when component mounts
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getUserByClerkId(userId);
        if (user?.username) {
          return true;
        }
      } catch (err) {
        console.error("Error checking user:", err);
        setError("Failed to check user status");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      const asyncCheckUser = async () => {
        const hasUsername = await checkUser();
        if (hasUsername) {
          router.push("/");
        }
      };
      asyncCheckUser();
    } else {
      setError("No user ID provided");
      setIsLoading(false);
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { success, error } = await createUser(userId, username.trim());

      if (error) {
        setError(error);
        toast.error(error);
      } else if (success) {
        toast.success("Username created successfully!");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError("An error occurred. Please try again.");
      toast.error("Failed to create username");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 mx-auto mb-4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-6 mx-auto mt-10 border rounded-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Create Your Username</h1>
        <p className="text-gray-500">Choose a username to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading || isSubmitting}
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isSubmitting || !username.trim()}
        >
          {isLoading || isSubmitting ? "Creating..." : "Create Username"}
        </Button>
      </form>
    </div>
  );
}
