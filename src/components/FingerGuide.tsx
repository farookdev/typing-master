"use client";

import { motion } from "framer-motion";

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
  ";": "right-pinky", "'": "right-pinky", "/": "right-pinky",
  " ": "thumb",
};

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

const FINGER_LABELS: Record<string, string> = {
  "left-pinky": "L Pinky",
  "left-ring": "L Ring",
  "left-middle": "L Middle",
  "left-index": "L Index",
  "right-index": "R Index",
  "right-middle": "R Middle",
  "right-ring": "R Ring",
  "right-pinky": "R Pinky",
  thumb: "Thumb",
};

interface FingerGuideProps {
  targetKey: string | null;
  show: boolean;
}

export default function FingerGuide({ targetKey, show }: FingerGuideProps) {
  if (!show || !targetKey) return null;

  const finger = KEY_TO_FINGER[targetKey.toLowerCase()] || KEY_TO_FINGER[targetKey];
  if (!finger) return null;

  const color = FINGER_COLORS[finger];
  const label = FINGER_LABELS[finger];
  const isLeft = finger.startsWith("left");
  const isThumb = finger === "thumb";

  const fingers = isThumb
    ? [
        { id: "left-thumb", active: true },
        { id: "right-thumb", active: true },
      ]
    : isLeft
      ? [
          { id: "left-pinky", active: finger === "left-pinky" },
          { id: "left-ring", active: finger === "left-ring" },
          { id: "left-middle", active: finger === "left-middle" },
          { id: "left-index", active: finger === "left-index" },
        ]
      : [
          { id: "right-index", active: finger === "right-index" },
          { id: "right-middle", active: finger === "right-middle" },
          { id: "right-ring", active: finger === "right-ring" },
          { id: "right-pinky", active: finger === "right-pinky" },
        ];

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className="flex items-end gap-1">
        {fingers.map((f) => (
          <motion.div
            key={f.id}
            className="rounded-t-full"
            style={{
              width: f.id.includes("thumb") ? 28 : f.id.includes("pinky") ? 16 : f.id.includes("ring") ? 20 : f.id.includes("middle") ? 22 : 20,
              height: f.id.includes("thumb") ? 28 : f.id.includes("pinky") ? 32 : f.id.includes("ring") ? 40 : f.id.includes("middle") ? 44 : 38,
              backgroundColor: f.active ? color : "#D1D5DB",
            }}
            animate={f.active ? { scale: [1, 1.1, 1] } : {}}
            transition={f.active ? { duration: 0.8, repeat: Infinity } : {}}
          />
        ))}
      </div>
      <div className="text-sm font-semibold" style={{ color }}>
        {label}
      </div>
    </div>
  );
}
