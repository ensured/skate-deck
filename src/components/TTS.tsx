"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download } from "lucide-react";

const TTS = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Handle audio playback
  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error controlling audio:", error);
      setIsPlaying(false);
    }
  };

  // Handle audio download
  const handleDownload = () => {
    if (!audioUrl) return;

    const downloadLink = document.createElement("a");
    downloadLink.href = audioUrl;
    downloadLink.download = `tts-${Date.now()}.mp3`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Generate speech from text
  const speakText = async (textToSpeak: string) => {
    if (!textToSpeak.trim()) return;

    setIsLoading(true);
    
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }

    // Clear previous audio URL if it exists
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSpeak }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to generate speech');
      }

      if (!response.body) {
        throw new Error("No audio data received");
      }

      // Read the response as a blob
      const audioBlob = await response.blob();
      const newAudioUrl = URL.createObjectURL(audioBlob);
      
      // Create a new audio element
      const audio = new Audio();
      audio.src = newAudioUrl;
      audio.preload = "auto";
      
      // Set up event handlers
      const handleLoadedData = () => {
        audio.play().then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        }).catch(error => {
          console.error("Error playing audio:", error);
          setIsLoading(false);
        });
      };
      
      const handleError = () => {
        console.error("Audio error:", audio.error);
        setIsPlaying(false);
        setIsLoading(false);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
      };
      
      // Add event listeners
      audio.addEventListener('loadeddata', handleLoadedData);
      audio.addEventListener('error', handleError);
      audio.addEventListener('ended', handleEnded);
      
      // Clean up function
      const cleanup = () => {
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('ended', handleEnded);
      };
      
      // Store the audio element and URL
      audioRef.current = audio;
      setAudioUrl(newAudioUrl);
      
      // Return cleanup function
      return cleanup;
      
    } catch (error) {
      console.error("Error in TTS generation:", error);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    speakText(text);
  };

  return (
    <div className="space-y-4 p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to speak..."
          className="flex-1 p-2 border rounded"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          {isLoading ? "Generating..." : "Generate"}
        </button>
      </form>

      <div className="p-4 border rounded">
        <h2 className="text-lg font-semibold mb-4">Audio Preview</h2>
        {audioUrl ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    disabled={isLoading}
                    className={`p-3 rounded-full ${isPlaying ? 'bg-blue-600' : 'bg-blue-500'} text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {text.slice(0, 50)}{text.length > 50 ? '...' : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isPlaying ? 'Now Playing' : 'Ready to play'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {text ? 'Click "Generate" to create audio' : 'Enter text above to generate speech'}
            </p>
          </div>
        )}
      </div>

      {/* Text Preview */}
      <div className="p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Text Preview</h2>
        <div className="p-4 bg-gray-50 rounded">
          {text || 'No text entered yet'}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Quick Examples:</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Hello, how are you today?",
            "This is a text-to-speech example.",
            "The quick brown fox jumps over the lazy dog.",
          ].map((example) => (
            <button
              key={example}
              onClick={() => {
                setText(example);
                speakText(example);
              }}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              {example.slice(0, 20)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TTS;
