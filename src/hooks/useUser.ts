"use client";
import { useEffect, useState } from "react";
import { LocalUser } from "@/types/localUser";
import { getLocalUser, createLocalUser, setLocalStorageUser } from "@/lib/localStorage";

const useLocalUser = () => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const storedUser = getLocalUser();
      if (storedUser) {
        setUser(storedUser);
      } else {
        // Create a default user for offline play
        const defaultUser = createLocalUser("P1");
        setUser(defaultUser);
      }
      setIsLoaded(true);
    };

    loadUser();
  }, []);

  const updateUser = (username: string) => {
    const updatedUser = createLocalUser(username);
    setUser(updatedUser);
    setLocalStorageUser(updatedUser); // Save to localStorage
    return updatedUser;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('skate-deck-user');
    }
  };

  return { user, isLoaded, updateUser, logout };
};

export default useLocalUser;
