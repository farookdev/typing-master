"use server";

import fs from "fs/promises";
import path from "path";

export interface LessonProgress {
  completed: boolean;
  stars: number;
  accuracy: number;
  wpm: number;
  attempts: number;
  bestTime: number;
  completedAt?: string;
}

export interface UserProgress {
  username: string;
  createdAt: string;
  lastActive: string;
  totalPracticeTime: number;
  currentLevel: number;
  lessons: Record<string, LessonProgress>;
  achievements: string[];
  statistics: {
    totalKeysPressed: number;
    correctKeys: number;
    totalWords: number;
    averageWPM: number;
    averageAccuracy: number;
    practiceStreak: number;
  };
}

const dataDir = path.join(process.cwd(), "data", "users");

export async function saveUserProgress(
  username: string,
  progressData: UserProgress,
) {
  const sanitized = username.replace(/[^a-zA-Z0-9_-]/g, "");
  const filePath = path.join(dataDir, `${sanitized}.json`);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(progressData, null, 2));
  return { success: true };
}

export async function loadUserProgress(
  username: string,
): Promise<UserProgress | null> {
  const sanitized = username.replace(/[^a-zA-Z0-9_-]/g, "");
  const filePath = path.join(dataDir, `${sanitized}.json`);
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function createNewUser(username: string): Promise<UserProgress> {
  const progress: UserProgress = {
    username,
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
  await saveUserProgress(username, progress);
  return progress;
}

export async function getLessonsData() {
  const filePath = path.join(process.cwd(), "data", "lessons.json");
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data);
}
