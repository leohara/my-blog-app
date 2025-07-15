"use client";

import { useMemo } from "react";

import { HEADER_CONSTANTS } from "./constants";

const { ANIMATION_TIMING } = HEADER_CONSTANTS;

interface AnimatedTextProps {
  text: string;
  isHovered: boolean;
}

export function AnimatedText({ text, isHovered }: AnimatedTextProps) {
  // Memoize character splitting to avoid recalculation on every render
  const characters = useMemo(() => text.split(""), [text]);

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
