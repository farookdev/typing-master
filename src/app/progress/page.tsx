"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";
import { ACHIEVEMENTS } from "@/lib/achievements";
import type { UserProgress } from "@/lib/progressManager";

interface Lesson {
  id: number;
  level: number;
  title: string;
  description: string;
}

interface Level {
  id: number;
  name: string;
  description: string;
  lessons: number[];
}

interface LessonsData {
  lessons: Lesson[];
  levels: Level[];
}

export default function ProgressPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [lessonsData, setLessonsData] = useState<LessonsData | null>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("typing-master-current-user");
    if (!user) {
      router.push("/");
      return;
    }
    setUsername(user);

    const stored = localStorage.getItem(`typing-progress-${user}`);
    if (stored) setProgress(JSON.parse(stored));

    fetch("/api/lessons")
      .then((r) => r.json())
      .then(setLessonsData);
  }, [router]);

  if (!lessonsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-purple-600 font-bold">Loading...</div>
      </div>
    );
  }

  const totalLessons = lessonsData.lessons.length;
  const completedCount = progress
    ? Object.values(progress.lessons).filter((l) => l.completed).length
    : 0;
  const totalStars = progress
    ? Object.values(progress.lessons).reduce((s, l) => s + (l.stars || 0), 0)
    : 0;
  const overallPct = Math.round((completedCount / totalLessons) * 100);

  function isLessonUnlocked(lesson: Lesson): boolean {
    if (!lesson) return false;
    const full = lessonsData!.lessons.find((l) => l.id === lesson.id);
    if (!full) return false;
    const req = (full as unknown as { unlockRequirement: { lessonId: number; minStars: number } | null }).unlockRequirement;
    if (!req) return true;
    if (!progress) return false;
    const prev = progress.lessons[req.lessonId.toString()];
    return prev?.completed && prev.stars >= req.minStars;
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-purple-600 hover:text-purple-800 font-medium transition"
        >
          ← Home
        </button>
        <h1 className="text-lg font-bold text-purple-800">My Progress</h1>
        <div className="w-16" />
      </header>

      <div className="max-w-3xl mx-auto px-6">
        {/* Stats Overview */}
        <motion.div
          className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-4">
            <div className="text-sm text-purple-500">Welcome back,</div>
            <div className="text-2xl font-extrabold text-purple-800">
              {username}
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#E9D5FF"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={264}
                  initial={{ strokeDashoffset: 264 }}
                  animate={{
                    strokeDashoffset: 264 - (264 * overallPct) / 100,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-extrabold text-purple-800">
                  {overallPct}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-700">
                {completedCount}
              </div>
              <div className="text-xs text-purple-400">Lessons Done</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {totalStars}
              </div>
              <div className="text-xs text-purple-400">Stars Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {progress?.statistics.averageWPM || 0}
              </div>
              <div className="text-xs text-purple-400">Avg WPM</div>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        {progress && progress.achievements.length > 0 && (
          <motion.div
            className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-bold text-purple-800 mb-4">
              Achievements
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map((ach) => {
                const earned = progress.achievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`flex items-center gap-2 p-3 rounded-xl ${
                      earned ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50 opacity-40"
                    }`}
                  >
                    <span className="text-2xl">{ach.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-purple-800">
                        {ach.name}
                      </div>
                      <div className="text-xs text-purple-400">
                        {ach.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Lesson Levels */}
        {lessonsData.levels.map((level, li) => (
          <motion.div
            key={level.id}
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + li * 0.05 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg shadow">
                {level.id}
              </div>
              <div>
                <h3 className="font-bold text-purple-800">{level.name}</h3>
                <p className="text-xs text-purple-400">{level.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {level.lessons.map((lid) => {
                const lesson = lessonsData.lessons.find((l) => l.id === lid)!;
                const lp = progress?.lessons[lid.toString()];
                const unlocked = isLessonUnlocked(lesson);

                return (
                  <motion.button
                    key={lid}
                    onClick={() => unlocked && router.push(`/lessons/${lid}`)}
                    className={`flex items-center gap-3 p-4 rounded-2xl text-left transition ${
                      unlocked
                        ? "bg-white/80 hover:bg-white shadow hover:shadow-lg cursor-pointer"
                        : "bg-gray-100/50 cursor-not-allowed"
                    }`}
                    whileHover={unlocked ? { scale: 1.02 } : {}}
                    whileTap={unlocked ? { scale: 0.98 } : {}}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                        lp?.completed
                          ? "bg-emerald-100 text-emerald-600"
                          : unlocked
                            ? "bg-purple-100 text-purple-600"
                            : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {lp?.completed ? "✓" : unlocked ? lid : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-semibold text-sm truncate ${
                          unlocked ? "text-purple-800" : "text-gray-400"
                        }`}
                      >
                        {lesson.title}
                      </div>
                      {lp?.completed && (
                        <div className="flex items-center gap-2">
                          <StarRating stars={lp.stars} size="sm" />
                          <span className="text-xs text-gray-400">
                            {lp.wpm} WPM
                          </span>
                        </div>
                      )}
                      {!lp?.completed && unlocked && (
                        <div className="text-xs text-purple-400">
                          {lesson.description}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
