"use client";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { ClerkUser } from "@/types/user";
import { getUserByClerkId } from "@/actions/actions";

const useUser = () => {
  const { userId, isLoaded } = useAuth();
  const [clerkUser, setUser] = useState<ClerkUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        const user = await getUserByClerkId(userId);
        console.log(user);
        setUser(user);
      }
    };
    fetchUser();
  }, [isLoaded, userId]);

  return { clerkUser, isLoaded };
};

export default useUser;
