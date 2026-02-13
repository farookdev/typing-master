"use client";

import { motion } from "framer-motion";

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const sizes = {
  sm: "text-lg",
  md: "text-3xl",
  lg: "text-5xl",
};

export default function StarRating({
  stars,
  maxStars = 3,
  size = "md",
  animate = false,
}: StarRatingProps) {
  return (
    <div className="flex gap-1 justify-center">
      {Array.from({ length: maxStars }, (_, i) => (
        <motion.span
          key={i}
          className={sizes[size]}
          initial={animate ? { scale: 0, rotate: -180 } : {}}
          animate={animate ? { scale: 1, rotate: 0 } : {}}
          transition={
            animate
              ? { delay: i * 0.2, type: "spring", stiffness: 300, damping: 15 }
              : {}
          }
        >
          {i < stars ? (
            <span className="drop-shadow-lg" style={{ filter: "drop-shadow(0 0 4px #FCD34D)" }}>
              ⭐
            </span>
          ) : (
            <span className="opacity-30 grayscale">⭐</span>
          )}
        </motion.span>
      ))}
    </div>
  );
}
