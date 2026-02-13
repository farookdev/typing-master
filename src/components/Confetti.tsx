"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#FCD34D", "#10B981", "#3B82F6", "#EC4899", "#A855F7", "#F97316"];

interface ConfettiProps {
  active: boolean;
  count?: number;
}

export default function Confetti({ active, count = 40 }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        size: 6 + Math.random() * 8,
      })),
    [count],
  );

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: typeof window !== "undefined" ? window.innerHeight + 50 : 900,
            rotate: p.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}
