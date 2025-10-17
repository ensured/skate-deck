"use client";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { ClerkUser } from "@/types/clerkUser";
import { getUserByClerkId } from "@/actions/actions";

const useClerkUser = () => {
  const { userId, isLoaded: isClerkUserLoaded } = useAuth();
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
  }, [isClerkUserLoaded, userId]);

  return { clerkUser, isClerkUserLoaded };
};

export default useClerkUser;
