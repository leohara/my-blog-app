"use client";

interface AnimatedTextProps {
  text: string;
  isHovered: boolean;
}

export function AnimatedText({ text, isHovered }: AnimatedTextProps) {
  return (
    <span className="relative inline-block">
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`inline-block transition-all duration-300 ${
            isHovered ? "animate-wave-motion" : ""
          }`}
          style={{
            animationDelay: isHovered ? `${index * 30}ms` : "0ms",
            color: isHovered ? undefined : "inherit",
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
