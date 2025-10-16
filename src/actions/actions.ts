"use server";
import { prisma } from "@/db";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";

export const getUserByClerkId = async (clerkId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      clerkId: clerkId,
    },
  });
  return user;
};

export const createUser = async (clerkId: string, username: string) => {
  try {
    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { success: false, error: "Username already taken" };
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        clerkId,
        username,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
};

export const isUsernameTaken = async (username: string) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  return existingUser !== null;
};

export const changeUsername = async (oldUsername: string, username: string) => {
  try {
    const headersList = await headers();
    const ip = (headersList.get("x-forwarded-for") || "127.0.0.1")
      .split(",")[0]
      .trim();

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.reset).toLocaleTimeString();
      return { 
        success: false, 
        error: `Rate limit exceeded. Try again after ${resetTime}.`,
        remaining: rateLimit.remaining 
      };
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { success: false, error: "Username already taken", remaining: rateLimit.remaining };
    }

    // Update username
    const user = await prisma.user.update({
      where: {
        username: oldUsername,
      },
      data: {
        username,
      },
    });

    return { success: true, user, remaining: rateLimit.remaining };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to change username",
    };
  }
};
