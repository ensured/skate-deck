import { NextResponse } from "next/server";
import { generateChatCompletionStream } from "@/app/ai/actions";
import { InferenceClientProviderApiError } from "@huggingface/inference";

export const runtime = "edge";

export async function POST(req: Request) {
  const { message } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generateChatCompletionStream(message)) {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ chunk })}\n\n`)
          );
        }
      } catch (error) {
        if (error instanceof InferenceClientProviderApiError) {
          if (
            error.message.includes(
              "You have exceeded your monthly included credits for Inference Providers"
            )
          ) {
            console.error(
              "You have exceeded your monthly included credits for Inference Providers"
            );
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
