"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

interface TypingAreaProps {
  text: string;
  typedChars: string[];
  currentIndex: number;
  corrections: boolean[];
}

export default function TypingArea({
  text,
  typedChars,
  currentIndex,
  corrections,
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (cursorRef.current && containerRef.current) {
      const container = containerRef.current;
      const cursor = cursorRef.current;
      const containerRect = container.getBoundingClientRect();
      const cursorRect = cursor.getBoundingClientRect();
      if (cursorRect.bottom > containerRect.bottom - 20) {
        container.scrollTop += cursorRect.top - containerRect.top - 40;
      }
    }
  }, [currentIndex]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        ref={containerRef}
        className="relative bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg border-2 border-purple-200 min-h-[120px] max-h-[200px] overflow-y-auto"
        style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
      >
        <p className="text-2xl leading-relaxed tracking-wide flex flex-wrap">
          {text.split("").map((char, i) => {
            const isTyped = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isCorrect = corrections[i];

            return (
              <span key={i} className="relative inline-block">
                {isCurrent && (
                  <motion.span
                    ref={cursorRef}
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-600"
                    animate={{ opacity: [1, 0] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                )}
                <span
                  className={`
                    ${isCurrent ? "bg-yellow-200 text-purple-900 font-bold scale-110 inline-block px-0.5 rounded" : ""}
                    ${isTyped && isCorrect ? "text-emerald-500" : ""}
                    ${isTyped && !isCorrect ? "text-red-500 underline decoration-2 decoration-red-400" : ""}
                    ${!isTyped && !isCurrent ? "text-gray-400" : ""}
                    ${char === " " ? "w-3 inline-block" : ""}
                  `}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
                <AnimatePresence>
                  {isTyped && isCorrect && i === currentIndex - 1 && (
                    <motion.span
                      className="absolute -top-2 left-1/2 text-xs text-emerald-400 pointer-events-none"
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 0, y: -20 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      +1
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}
