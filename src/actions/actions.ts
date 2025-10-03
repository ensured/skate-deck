"use server";
import { prisma } from "@/db";

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
      throw new Error("Username already taken");
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
