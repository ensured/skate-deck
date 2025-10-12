"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./button";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <Button
        onClick={scrollToTop}
        className={`${
          isVisible
            ? "opacity-100 scale-100 cursor-pointer"
            : "opacity-0 scale-50 pointer-events-none cursor-default"
        } transition-all   duration-300 ease-in-out rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg backdrop-blur-sm`}
        variant="default"
        size="icon"
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
