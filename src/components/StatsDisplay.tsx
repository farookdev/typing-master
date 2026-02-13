"use client";

import { motion } from "framer-motion";

interface StatsDisplayProps {
  wpm: number;
  accuracy: number;
  combo: number;
  elapsed: number;
}

export default function StatsDisplay({
  wpm,
  accuracy,
  combo,
  elapsed,
}: StatsDisplayProps) {
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="flex gap-4 justify-center flex-wrap">
      <Stat label="WPM" value={wpm.toString()} color="text-blue-600" />
      <Stat
        label="Accuracy"
        value={`${accuracy}%`}
        color={accuracy >= 95 ? "text-emerald-600" : accuracy >= 80 ? "text-yellow-600" : "text-red-500"}
      />
      <Stat label="Time" value={timeStr} color="text-purple-600" />
      {combo > 2 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex flex-col items-center"
        >
          <span className="text-xs font-medium text-orange-500">Combo</span>
          <motion.span
            key={combo}
            className="text-xl font-bold text-orange-500"
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
          >
            {combo}x
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center bg-white/60 rounded-xl px-4 py-2 shadow">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
