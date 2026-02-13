"use client";

import { motion } from "framer-motion";

const KEYBOARD_ROWS = [
  [
    { key: "`", shift: "~", w: 1 },
    { key: "1", shift: "!", w: 1 },
    { key: "2", shift: "@", w: 1 },
    { key: "3", shift: "#", w: 1 },
    { key: "4", shift: "$", w: 1 },
    { key: "5", shift: "%", w: 1 },
    { key: "6", shift: "^", w: 1 },
    { key: "7", shift: "&", w: 1 },
    { key: "8", shift: "*", w: 1 },
    { key: "9", shift: "(", w: 1 },
    { key: "0", shift: ")", w: 1 },
    { key: "-", shift: "_", w: 1 },
    { key: "=", shift: "+", w: 1 },
    { key: "Backspace", label: "←", w: 2 },
  ],
  [
    { key: "Tab", label: "Tab", w: 1.5 },
    { key: "q", w: 1 },
    { key: "w", w: 1 },
    { key: "e", w: 1 },
    { key: "r", w: 1 },
    { key: "t", w: 1 },
    { key: "y", w: 1 },
    { key: "u", w: 1 },
    { key: "i", w: 1 },
    { key: "o", w: 1 },
    { key: "p", w: 1 },
    { key: "[", shift: "{", w: 1 },
    { key: "]", shift: "}", w: 1 },
    { key: "\\", shift: "|", w: 1.5 },
  ],
  [
    { key: "CapsLock", label: "Caps", w: 1.75 },
    { key: "a", w: 1 },
    { key: "s", w: 1 },
    { key: "d", w: 1 },
    { key: "f", w: 1 },
    { key: "g", w: 1 },
    { key: "h", w: 1 },
    { key: "j", w: 1 },
    { key: "k", w: 1 },
    { key: "l", w: 1 },
    { key: ";", shift: ":", w: 1 },
    { key: "'", shift: '"', w: 1 },
    { key: "Enter", label: "Enter", w: 2.25 },
  ],
  [
    { key: "ShiftLeft", label: "Shift", w: 2.25 },
    { key: "z", w: 1 },
    { key: "x", w: 1 },
    { key: "c", w: 1 },
    { key: "v", w: 1 },
    { key: "b", w: 1 },
    { key: "n", w: 1 },
    { key: "m", w: 1 },
    { key: ",", shift: "<", w: 1 },
    { key: ".", shift: ">", w: 1 },
    { key: "/", shift: "?", w: 1 },
    { key: "ShiftRight", label: "Shift", w: 2.75 },
  ],
  [
    { key: "Space", label: "", w: 8 },
  ],
];

const FINGER_COLORS: Record<string, string> = {
  "left-pinky": "#EC4899",
  "left-ring": "#A855F7",
  "left-middle": "#3B82F6",
  "left-index": "#10B981",
  "right-index": "#10B981",
  "right-middle": "#3B82F6",
  "right-ring": "#A855F7",
  "right-pinky": "#EC4899",
  thumb: "#F97316",
};

const KEY_TO_FINGER: Record<string, string> = {
  "`": "left-pinky", "1": "left-pinky", "q": "left-pinky", "a": "left-pinky", "z": "left-pinky",
  "2": "left-ring", "w": "left-ring", "s": "left-ring", "x": "left-ring",
  "3": "left-middle", "e": "left-middle", "d": "left-middle", "c": "left-middle",
  "4": "left-index", "5": "left-index", "r": "left-index", "t": "left-index",
  "f": "left-index", "g": "left-index", "v": "left-index", "b": "left-index",
  "6": "right-index", "7": "right-index", "y": "right-index", "u": "right-index",
  "h": "right-index", "j": "right-index", "n": "right-index", "m": "right-index",
  "8": "right-middle", "i": "right-middle", "k": "right-middle", ",": "right-middle",
  "9": "right-ring", "o": "right-ring", "l": "right-ring", ".": "right-ring",
  "0": "right-pinky", "-": "right-pinky", "=": "right-pinky",
  "p": "right-pinky", "[": "right-pinky", "]": "right-pinky", "\\": "right-pinky",
  ";": "right-pinky", "'": "right-pinky",
  "/": "right-pinky",
  " ": "thumb",
};

interface KeyboardDisplayProps {
  activeKey: string | null;
  targetKey: string | null;
  lastKeyCorrect: boolean | null;
  showFingerHints: boolean;
}

export default function KeyboardDisplay({
  activeKey,
  targetKey,
  lastKeyCorrect,
  showFingerHints,
}: KeyboardDisplayProps) {
  const normalizedTarget = targetKey?.toLowerCase() ?? null;

  function getKeyState(keyDef: { key: string; shift?: string }) {
    const k = keyDef.key.toLowerCase();
    const isTarget =
      normalizedTarget === k ||
      normalizedTarget === keyDef.shift?.toLowerCase() ||
      (normalizedTarget === " " && keyDef.key === "Space");
    const isActive =
      activeKey?.toLowerCase() === k ||
      (activeKey === " " && keyDef.key === "Space");
    return { isTarget, isActive };
  }

  return (
    <div className="w-full max-w-3xl mx-auto select-none">
      <div className="flex flex-col gap-1.5 p-3 bg-gray-800 rounded-2xl shadow-xl">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5 justify-center">
            {row.map((keyDef) => {
              const { isTarget, isActive } = getKeyState(keyDef);
              const finger = KEY_TO_FINGER[keyDef.key.toLowerCase()] || KEY_TO_FINGER[keyDef.key];
              const fingerColor = finger ? FINGER_COLORS[finger] : undefined;
              const isHomeRow = ["a", "s", "d", "f", "j", "k", "l", ";"].includes(keyDef.key);
              const displayLabel = keyDef.key === "Space" ? "" : (keyDef.label || keyDef.key);

              return (
                <motion.div
                  key={keyDef.key}
                  className="relative rounded-lg flex flex-col items-center justify-center text-sm font-bold transition-colors cursor-default"
                  style={{
                    width: `${keyDef.w * 48}px`,
                    height: "48px",
                    backgroundColor: isActive
                      ? lastKeyCorrect === false
                        ? "#EF4444"
                        : lastKeyCorrect === true
                          ? "#10B981"
                          : "#6B7280"
                      : isTarget
                        ? "#FCD34D"
                        : showFingerHints && fingerColor
                          ? `${fingerColor}22`
                          : "#374151",
                    color: isTarget ? "#1F2937" : "#E5E7EB",
                    borderBottom: isHomeRow ? "3px solid #FCD34D" : "3px solid #1F2937",
                    boxShadow: isTarget
                      ? "0 0 16px rgba(252,211,77,0.6)"
                      : "none",
                  }}
                  animate={
                    isActive && lastKeyCorrect === false
                      ? { x: [0, -4, 4, -4, 4, 0] }
                      : isTarget
                        ? { scale: [1, 1.05, 1] }
                        : {}
                  }
                  transition={
                    isTarget
                      ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.3 }
                  }
                >
                  {keyDef.shift && (
                    <span className="text-[10px] opacity-50 leading-none">
                      {keyDef.shift}
                    </span>
                  )}
                  <span className={`leading-none ${keyDef.key.length === 1 ? "uppercase" : "text-xs"}`}>
                    {displayLabel}
                  </span>
                  {showFingerHints && fingerColor && isTarget && (
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: fingerColor }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
