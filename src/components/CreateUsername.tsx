"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { createUser, getUserByClerkId } from "@/actions/actions";
import { Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "./ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export function CreateUsername({ userId }: { userId: string }) {
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { success, error: createError } = await createUser(
        userId,
        username.trim()
      );

      if (createError) {
        setError(createError);
        toast.error(createError);
      } else if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md p-6 mx-auto mt-10 border rounded-lg">
        <Skeleton className="h-[12.4rem] w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md p-6 mx-auto mt-10 border rounded-lg">
        <div className="mb-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!isSuccess ? (
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
                disabled={isLoading || isSubmitting || isSuccess}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading || isSubmitting || !username.trim() || isSuccess
              }
            >
              {isLoading || isSubmitting ? "Creating..." : "Create Username"}
            </Button>
          </form>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md p-6 mx-auto mt-10 border rounded-lg text-center bg-card text-card-foreground"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 10,
              }}
              className="flex justify-center mb-4"
            >
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center ">
                <CheckCircle className="w-6 h-6 animate-pulse" />
              </div>
            </motion.div>
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.22 }}
              className="text-xl font-semibold text-foreground mb-2"
            >
              Welcome, {username}!
            </motion.h2>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-primary mb-6"
            >
              Your username has been created successfully!
            </motion.p>
            <motion.p
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.11 }}
              className="text-primary flex items-center justify-center "
            >
              <Loader2 className="animate-spin text-muted" />
            </motion.p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
