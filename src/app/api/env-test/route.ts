import { NextResponse } from "next/server";
import { open } from "fs/promises";

export async function GET() {
  let file;
  try {
    file = await open(".env", "r");
    const text = await file.readFile("utf-8");

    const envKeys = text
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.startsWith("#"))
      .map((line) => line.split("=")[0]?.trim())
      .filter(Boolean); // Remove any undefined/empty keys

    return NextResponse.json({
      found_keys: envKeys.filter((key) => process.env[key]),
      missing_keys: envKeys.filter((key) => !process.env[key]),
      total_keys: envKeys.length,
    });
  } catch (error) {
    console.error("Error reading .env file:", error);
    return NextResponse.json(
      { error: "Failed to read environment variables" },
      { status: 500 }
    );
  } finally {
    if (file) {
      await file.close();
    }
  }
}
