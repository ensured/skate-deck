import { useState, useEffect, useCallback } from "react";

export const useTextToSpeech = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsAvailable(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        const defaultVoice =
          availableVoices.find((voice) => voice.lang.startsWith("en")) ||
          availableVoices[0];
        setSelectedVoice(defaultVoice);
        setIsAvailable(true);
      }
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const checkVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      console.log("Available voices:", allVoices);
    };

    checkVoices();

    window.speechSynthesis.onvoiceschanged = checkVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!isAvailable || !selectedVoice) {
          const error = new Error(
            "Speech synthesis not available or no voice selected"
          );
          console.warn(error.message);
          reject(error);
          return;
        }

        try {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.voice = selectedVoice;
          utterance.volume = 1;
          utterance.rate = 1;
          utterance.pitch = 1;

          utterance.onstart = () => {
            console.log("Speech started");
            setIsSpeaking(true);
            setIsPaused(false);
          };

          utterance.onend = () => {
            console.log("Speech finished");
            setIsSpeaking(false);
            setIsPaused(false);
            resolve();
          };

          utterance.onerror = (event) => {
            const isNonCriticalError =
              event.error === "interrupted" ||
              (event.error === "synthesis-failed" &&
                window.speechSynthesis.speaking);

            if (!isNonCriticalError) {
              console.error("SpeechSynthesis error:", event);
              reject(event);
            } else {
              resolve(); // Resolve on non-critical errors
            }
            setIsSpeaking(false);
            setIsPaused(false);
          };

          window.speechSynthesis.speak(utterance);
        } catch (error) {
          console.error("Error in speak function:", error);
          reject(error);
        }
      });
    },
    [isAvailable, selectedVoice]
  );

  const pause = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const setVoice = (voiceName: string) => {
    const voice = voices.find((v) => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
    }
  };

  return {
    isAvailable,
    voices,
    selectedVoice,
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    stop,
    setVoice,
  };
};
