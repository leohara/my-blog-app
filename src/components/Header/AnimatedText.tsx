"use client";

import { useMemo, memo } from "react";

import { HEADER_CONSTANTS } from "./constants";

const { ANIMATION_TIMING } = HEADER_CONSTANTS;

interface AnimatedTextProps {
  text: string;
  isHovered: boolean;
}

function AnimatedTextComponent({ text, isHovered }: AnimatedTextProps) {
  // Memoize character splitting to avoid recalculation on every render
  const characters = useMemo(() => text.split(""), [text]);

  // Performance warning for long text in development
  if (process.env.NODE_ENV === "development" && text.length > 20) {
    console.warn(
      `AnimatedText: Text with ${text.length} characters may impact performance. Consider using a simpler animation for longer text.`,
    );
  }

  return (
    <span className="relative inline-block">
      {characters.map((char, index) => (
        <span
          key={index}
          className={`inline-block transition-all duration-300 ${
            isHovered ? "animate-wave-motion" : ""
          }`}
          style={{
            animationDelay: isHovered
              ? `${index * ANIMATION_TIMING.TEXT_WAVE_DELAY}ms`
              : "0ms",
            color: isHovered ? undefined : "inherit",
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

// Memoize component to prevent unnecessary re-renders
export const AnimatedText = memo(AnimatedTextComponent);
