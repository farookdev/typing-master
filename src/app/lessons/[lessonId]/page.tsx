"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import KeyboardDisplay from "@/components/KeyboardDisplay";
import TypingArea from "@/components/TypingArea";
import FingerGuide from "@/components/FingerGuide";
import ProgressBar from "@/components/ProgressBar";
import StatsDisplay from "@/components/StatsDisplay";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";
import { playCorrectSound, playWrongSound, playCompleteSound, playStarSound } from "@/lib/sounds";
import { checkNewAchievements, ACHIEVEMENTS } from "@/lib/achievements";
import type { UserProgress, LessonProgress } from "@/lib/progressManager";

interface Exercise {
  type: string;
  text: string;
  hints: boolean;
  minAccuracy?: number;
}

interface Lesson {
  id: number;
  level: number;
  title: string;
  description: string;
  targetKeys: string[];
  exercises: Exercise[];
  unlockRequirement: { lessonId: number; minStars: number } | null;
}

interface LessonsData {
  lessons: Lesson[];
  levels: { id: number; name: string; description: string; lessons: number[] }[];
}

type Phase = "intro" | "typing" | "results";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = parseInt(params.lessonId as string);

  const [lessonsData, setLessonsData] = useState<LessonsData | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [corrections, setCorrections] = useState<boolean[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [lastKeyCorrect, setLastKeyCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [locked, setLocked] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load data
  useEffect(() => {
    fetch("/api/lessons")
      .then((r) => r.json())
      .then((data: LessonsData) => {
        setLessonsData(data);
        const found = data.lessons.find((l: Lesson) => l.id === lessonId);
        setLesson(found || null);
      });

    const currentUser = localStorage.getItem("typing-master-current-user");
    if (!currentUser) {
      router.push("/");
      return;
    }

    const stored = localStorage.getItem(`typing-progress-${currentUser}`);
    if (stored) {
      setUserProgress(JSON.parse(stored));
    } else {
      const newProgress: UserProgress = {
        username: currentUser,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        totalPracticeTime: 0,
        currentLevel: 1,
        lessons: {},
        achievements: [],
        statistics: {
          totalKeysPressed: 0,
          correctKeys: 0,
          totalWords: 0,
          averageWPM: 0,
          averageAccuracy: 0,
          practiceStreak: 0,
        },
      };
      setUserProgress(newProgress);
    }
  }, [lessonId, router]);

  // Check if locked
  useEffect(() => {
    if (!lesson || !userProgress || !lessonsData) return;
    if (!lesson.unlockRequirement) {
      setLocked(false);
      return;
    }
    const req = lesson.unlockRequirement;
    const prevLesson = userProgress.lessons[req.lessonId.toString()];
    if (!prevLesson || !prevLesson.completed || prevLesson.stars < req.minStars) {
      setLocked(true);
    } else {
      setLocked(false);
    }
  }, [lesson, userProgress, lessonsData]);

  const currentExercise = lesson?.exercises[exerciseIndex];
  const text = currentExercise?.text || "";

  // Timer
  useEffect(() => {
    if (phase === "typing" && startTime > 0) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, startTime]);

  // Focus container for key events
  useEffect(() => {
    if (phase === "typing") {
      containerRef.current?.focus();
    }
  }, [phase, exerciseIndex]);

  const finishExercise = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsedSec = Math.max(1, (Date.now() - startTime) / 1000);
    const words = text.split(" ").length;
    const calcWpm = Math.round((words / elapsedSec) * 60);
    const calcAccuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 0;

    if (exerciseIndex < (lesson?.exercises.length ?? 1) - 1) {
      // Move to next exercise
      setExerciseIndex((prev) => prev + 1);
      setTypedChars([]);
      setCorrections([]);
      setCurrentIndex(0);
      setCombo(0);
      setTotalCorrect(0);
      setTotalTyped(0);
      setStartTime(Date.now());
      setElapsed(0);
    } else {
      // Lesson complete
      setWpm(calcWpm);
      setFinalAccuracy(calcAccuracy);

      let stars = 1;
      if (calcAccuracy >= 85) stars = 2;
      if (calcAccuracy >= 95) stars = 3;
      setEarnedStars(stars);

      // Save progress
      const currentUser = localStorage.getItem("typing-master-current-user")!;
      const progress: UserProgress = {
        ...userProgress!,
        lastActive: new Date().toISOString(),
        lessons: {
          ...userProgress!.lessons,
          [lessonId.toString()]: {
            completed: true,
            stars: Math.max(
              stars,
              userProgress?.lessons[lessonId.toString()]?.stars || 0,
            ),
            accuracy: calcAccuracy,
            wpm: calcWpm,
            attempts:
              (userProgress?.lessons[lessonId.toString()]?.attempts || 0) + 1,
            bestTime: Math.min(
              elapsedSec,
              userProgress?.lessons[lessonId.toString()]?.bestTime || Infinity,
            ),
            completedAt: new Date().toISOString(),
          } as LessonProgress,
        },
        statistics: {
          ...userProgress!.statistics,
          totalKeysPressed:
            userProgress!.statistics.totalKeysPressed + totalTyped,
          correctKeys: userProgress!.statistics.correctKeys + totalCorrect,
          totalWords: userProgress!.statistics.totalWords + words,
        },
      };

      // Check achievements
      const newAch = checkNewAchievements(progress);
      if (newAch.length > 0) {
        progress.achievements = [...progress.achievements, ...newAch];
        setNewAchievements(newAch);
      }

      // Recalculate averages
      const completedLessons = Object.values(progress.lessons).filter(
        (l) => l.completed,
      );
      if (completedLessons.length > 0) {
        progress.statistics.averageWPM = Math.round(
          completedLessons.reduce((s, l) => s + l.wpm, 0) /
            completedLessons.length,
        );
        progress.statistics.averageAccuracy = Math.round(
          completedLessons.reduce((s, l) => s + l.accuracy, 0) /
            completedLessons.length,
        );
      }

      // Determine current level
      if (lessonsData) {
        for (const level of lessonsData.levels) {
          const allDone = level.lessons.every(
            (lid) => progress.lessons[lid.toString()]?.completed,
          );
          if (!allDone) {
            progress.currentLevel = level.id;
            break;
          }
          if (level.id === lessonsData.levels.length) {
            progress.currentLevel = level.id;
          }
        }
      }

      localStorage.setItem(
        `typing-progress-${currentUser}`,
        JSON.stringify(progress),
      );
      setUserProgress(progress);

      if (stars === 3) {
        setShowConfetti(true);
        if (soundEnabled) playCompleteSound();
      } else if (soundEnabled) {
        playStarSound();
      }

      setPhase("results");
    }
  }, [
    startTime,
    text,
    totalCorrect,
    totalTyped,
    exerciseIndex,
    lesson,
    userProgress,
    lessonId,
    lessonsData,
    soundEnabled,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (phase !== "typing") return;
      if (e.key === "Tab" || e.key === "Escape") {
        e.preventDefault();
        return;
      }
      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta" || e.key === "CapsLock") {
        return;
      }
      e.preventDefault();

      if (currentIndex >= text.length) return;

      // Start timer on first keypress
      if (currentIndex === 0 && startTime === 0) {
        setStartTime(Date.now());
      }

      const expected = text[currentIndex];
      const typed = e.key;
      const isCorrect = typed === expected;

      setActiveKey(typed);
      setLastKeyCorrect(isCorrect);
      setTimeout(() => {
        setActiveKey(null);
        setLastKeyCorrect(null);
      }, 150);

      setTypedChars((prev) => [...prev, typed]);
      setCorrections((prev) => [...prev, isCorrect]);
      setTotalTyped((prev) => prev + 1);

      if (isCorrect) {
        setTotalCorrect((prev) => prev + 1);
        setCombo((prev) => {
          const next = prev + 1;
          setMaxCombo((m) => Math.max(m, next));
          return next;
        });
        if (soundEnabled) playCorrectSound();
      } else {
        setCombo(0);
        if (soundEnabled) playWrongSound();
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex >= text.length) {
        setTimeout(() => finishExercise(), 300);
      }
    },
    [phase, currentIndex, text, startTime, soundEnabled, finishExercise],
  );

  const accuracy =
    totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;
  const currentWpm =
    elapsed > 0 ? Math.round((text.split(" ").length * (currentIndex / text.length)) / (elapsed / 60)) : 0;

  if (!lesson || !lessonsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-2xl text-purple-600 font-bold"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading lesson...
        </motion.div>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-xl max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-purple-800 mb-2">
            Lesson Locked
          </h2>
          <p className="text-purple-600 mb-6">
            Complete Lesson {lesson.unlockRequirement!.lessonId} with at least{" "}
            {lesson.unlockRequirement!.minStars} star
            {lesson.unlockRequirement!.minStars > 1 ? "s" : ""} to unlock this
            lesson.
          </p>
          <button
            onClick={() =>
              router.push(
                `/lessons/${lesson.unlockRequirement!.lessonId}`,
              )
            }
            className="px-6 py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition"
          >
            Go to Lesson {lesson.unlockRequirement!.lessonId}
          </button>
        </motion.div>
      </div>
    );
  }

  const level = lessonsData.levels.find((lv) =>
    lv.lessons.includes(lessonId),
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Confetti active={showConfetti} />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => router.push("/progress")}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition"
        >
          <span className="text-xl">←</span> Lessons
        </button>
        <div className="text-center">
          <div className="text-xs text-purple-400 font-medium">
            {level?.name || `Level ${lesson.level}`}
          </div>
          <div className="text-sm font-bold text-purple-700">
            Lesson {lessonId}: {lesson.title}
          </div>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-2xl opacity-60 hover:opacity-100 transition"
          title={soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      </header>

      {/* Phase: Intro */}
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            className="flex-1 flex items-center justify-center p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-xl max-w-lg text-center">
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⌨️
              </motion.div>
              <h2 className="text-3xl font-extrabold text-purple-800 mb-2">
                {lesson.title}
              </h2>
              <p className="text-lg text-purple-600 mb-4">
                {lesson.description}
              </p>
              {lesson.targetKeys.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-purple-500 mb-2">
                    Keys to learn:
                  </p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {lesson.targetKeys.map((k) => (
                      <span
                        key={k}
                        className="inline-flex items-center justify-center w-12 h-12 bg-yellow-200 text-purple-800 font-bold text-xl rounded-lg shadow border-b-2 border-yellow-400"
                      >
                        {k.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-sm text-purple-400 mb-4">
                {lesson.exercises.length} exercise
                {lesson.exercises.length > 1 ? "s" : ""} to complete
              </div>
              <motion.button
                onClick={() => {
                  setPhase("typing");
                  setExerciseIndex(0);
                  setTypedChars([]);
                  setCorrections([]);
                  setCurrentIndex(0);
                  setCombo(0);
                  setMaxCombo(0);
                  setTotalCorrect(0);
                  setTotalTyped(0);
                  setStartTime(0);
                  setElapsed(0);
                }}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Lesson
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Phase: Typing */}
        {phase === "typing" && (
          <motion.div
            key="typing"
            className="flex-1 flex flex-col items-center justify-center gap-4 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Progress and stats */}
            <div className="w-full max-w-3xl">
              <ProgressBar
                current={exerciseIndex + 1}
                total={lesson.exercises.length}
                label={
                  currentExercise?.type === "test"
                    ? "Test"
                    : "Practice"
                }
              />
            </div>

            <StatsDisplay
              wpm={currentWpm}
              accuracy={accuracy}
              combo={combo}
              elapsed={elapsed}
            />

            {/* Typing area */}
            <TypingArea
              text={text}
              typedChars={typedChars}
              currentIndex={currentIndex}
              corrections={corrections}
            />

            {/* Finger guide */}
            <FingerGuide
              targetKey={currentIndex < text.length ? text[currentIndex] : null}
              show={currentExercise?.hints ?? true}
            />

            {/* Keyboard */}
            <KeyboardDisplay
              activeKey={activeKey}
              targetKey={currentIndex < text.length ? text[currentIndex] : null}
              lastKeyCorrect={lastKeyCorrect}
              showFingerHints={currentExercise?.hints ?? true}
            />

            <p className="text-sm text-purple-400 mt-2">
              Just start typing — no need to click!
            </p>
          </motion.div>
        )}

        {/* Phase: Results */}
        {phase === "results" && (
          <motion.div
            key="results"
            className="flex-1 flex items-center justify-center p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-xl max-w-lg w-full text-center">
              <motion.h2
                className="text-3xl font-extrabold text-purple-800 mb-4"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
              >
                {earnedStars === 3
                  ? "Amazing!"
                  : earnedStars === 2
                    ? "Great Job!"
                    : "Good Try!"}
              </motion.h2>

              <StarRating stars={earnedStars} size="lg" animate />

              <div className="grid grid-cols-2 gap-4 mt-6 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-blue-500">Speed</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {wpm} WPM
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="text-sm text-emerald-500">Accuracy</div>
                  <div className="text-2xl font-bold text-emerald-700">
                    {finalAccuracy}%
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="text-sm text-orange-500">Best Combo</div>
                  <div className="text-2xl font-bold text-orange-700">
                    {maxCombo}x
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-purple-500">Time</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}
                  </div>
                </div>
              </div>

              {/* New achievements */}
              {newAchievements.length > 0 && (
                <motion.div
                  className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-sm text-yellow-600 font-semibold mb-2">
                    New Achievement{newAchievements.length > 1 ? "s" : ""}!
                  </div>
                  {newAchievements.map((achId) => {
                    const ach = ACHIEVEMENTS.find((a) => a.id === achId);
                    return ach ? (
                      <div key={achId} className="flex items-center gap-2 justify-center">
                        <span className="text-2xl">{ach.icon}</span>
                        <span className="font-bold text-yellow-800">
                          {ach.name}
                        </span>
                      </div>
                    ) : null;
                  })}
                </motion.div>
              )}

              <div className="flex gap-3">
                <motion.button
                  onClick={() => {
                    setPhase("intro");
                    setShowConfetti(false);
                    setNewAchievements([]);
                  }}
                  className="flex-1 py-3 bg-purple-100 text-purple-700 font-bold rounded-xl hover:bg-purple-200 transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Retry
                </motion.button>
                {lessonId < lessonsData.lessons.length && (
                  <motion.button
                    onClick={() => {
                      setShowConfetti(false);
                      setNewAchievements([]);
                      router.push(`/lessons/${lessonId + 1}`);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next Lesson →
                  </motion.button>
                )}
              </div>

              <button
                onClick={() => router.push("/progress")}
                className="mt-3 text-sm text-purple-500 hover:text-purple-700 underline transition"
              >
                View All Progress
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
