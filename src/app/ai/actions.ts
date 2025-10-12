"use server";

import { InferenceClient } from "@huggingface/inference";

const hf = new InferenceClient(process.env.HF_TOKEN);

export async function* generateChatCompletionStream(message: string) {
  const stream = hf.chatCompletionStream({
    provider: "novita",
    model: "zai-org/GLM-4.6",
    temperature: 0.69,
    messages: [{ role: "user", content: message }],
    stream_options: {
      include_usage: true,
    },
  });

  for await (const chunk of stream) {
    if (chunk.choices?.[0]?.delta?.content) {
      yield chunk.choices[0].delta.content;
    }
  }
}

export async function* generateTTSStream(
  text: string,
  model: string = "hexgrad/Kokoro-82M"
) {
  try {
    // Generate audio using the specified model and provider
    const audio = await hf.textToSpeech({
      provider: "fal-ai",
      model: model,
      inputs: text,
    });

    if (!audio) {
      throw new Error("No audio data received from TTS service");
    }

    // Convert Blob to ArrayBuffer and then to Uint8Array for streaming
    const audioBuffer = await audio.arrayBuffer();
    const audioArray = new Uint8Array(audioBuffer);
    
    // Yield the audio data in chunks for streaming
    const chunkSize = 8192; // 8KB chunks
    for (let i = 0; i < audioArray.length; i += chunkSize) {
      const chunk = audioArray.slice(i, i + chunkSize);
      yield chunk;
    }
  } catch (error) {
    console.error("Error in TTS generation:", error);
    throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : String(error)}`);
  }
}
