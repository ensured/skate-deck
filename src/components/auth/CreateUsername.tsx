"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { createUser, getUserByClerkId } from "@/actions/actions";
import { Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";
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
  }, [userId, router]);

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
                onChange={(e) =>
                  setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))
                }
                disabled={isLoading || isSubmitting || isSuccess}
                className="w-full"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth entrance
            }}
            className="w-full max-w-md p-8 mx-auto mt-10 border rounded-2xl bg-gradient-to-br from-primary/5 via-background to-purple-500/5 shadow-2xl backdrop-blur-sm"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15,
                mass: 0.8,
              }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                {/* Pulsing ring effect */}
                <motion.div
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.8, 0, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full bg-green-400/30"
                />
              </div>
            </motion.div>

            {/* Welcome Message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.4,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="text-center space-y-2"
            >
              <motion.h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Welcome, {username}!
              </motion.h2>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="text-muted-foreground"
              >
                Your username has been created successfully!
              </motion.p>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 1.2,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="flex justify-center items-center mt-6 space-x-2 text-primary/70"
            >
              <Loader2 className="animate-spin w-4 h-4" />
              <span className="text-sm">Redirecting to game...</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
