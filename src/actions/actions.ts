"use server";
import { prisma } from "@/db";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";
import { formatDistance, subDays } from "date-fns";

export const isUsernameTaken = async (username: string) => {
  const existingUsers = await prisma.user.findMany({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
  });

  return existingUsers.length > 0;
};

export const getUserByClerkId = async (clerkId: string) => {
  console.log("Getting user by clerkId:", clerkId);
  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkId,
      },
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createUser = async (clerkId: string, username: string) => {
  try {
    const isNameTaken = await isUsernameTaken(username);
    if (isNameTaken) {
      return { success: false, error: "Username already taken" };
    }

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

export const changeUsername = async (clerkId: string, username: string) => {
  try {
    const headersList = await headers();
    const ip = (headersList.get("x-forwarded-for") || "127.0.0.1")
      .split(",")[0]
      .trim();

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Rate limit exceeded. Try again ${formatDistance(
          rateLimit.reset,
          new Date(),
          { addSuffix: true }
        )}.`,
        remaining: rateLimit.remaining,
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkId },
    });

    if (existingUser) {
      const conflictingUsers = await prisma.user.findMany({
        where: {
          username: {
            equals: username,
            mode: "insensitive",
          },
          clerkId: {
            not: clerkId,
          },
        },
      });

      if (conflictingUsers.length > 0) {
        return {
          success: false,
          error: "Username already taken",
          remaining: rateLimit.remaining,
        };
      }
    }

    const user = await prisma.user.update({
      where: {
        clerkId: clerkId,
      },
      data: {
        username: username,
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
