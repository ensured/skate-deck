"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const TTS = () => {
  const [speechText, setSpeechText] = useState("");
  const {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isAvailable,
    voices,
    selectedVoice,
    setVoice,
  } = useTextToSpeech();

  // Add this effect to announce game state changes
  useEffect(() => {
    if (!isAvailable) return;

    speak("this is a test of the emergency broadcast system");
  }, [isAvailable, speak]);

  return (
    <div className="space-y-4 p-4">
      {isAvailable && (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <Input
            type="text"
            value={speechText}
            onChange={(e) => setSpeechText(e.target.value)}
            placeholder="Type something to speak..."
            className="w-full mb-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && speechText.trim()) {
                speak(speechText);
              }
            }}
          />
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                onClick={() => speak(speechText)}
                disabled={!speechText.trim()}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Speak
              </Button>
              {isSpeaking && (
                <Button
                  onClick={isPaused ? resume : pause}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  {isPaused ? "Resume" : "Pause"}
                </Button>
              )}
              <Button
                onClick={() => {
                  stop();
                  setSpeechText("");
                }}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={!isSpeaking && !speechText}
              >
                {isSpeaking ? "Stop" : "Clear"}
              </Button>
              {voices.length > 0 && (
                <select
                  className="text-sm p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 w-full sm:w-auto"
                  value={selectedVoice?.name || ""}
                  onChange={(e) => setVoice(e.target.value)}
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TTS;
