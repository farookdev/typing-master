import { UserProgress } from "./progressManager";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_steps",
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "👣",
  },
  {
    id: "home_row_hero",
    name: "Home Row Hero",
    description: "Complete all home row lessons",
    icon: "🏠",
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Reach 20 WPM in any lesson",
    icon: "⚡",
  },
  {
    id: "accuracy_master",
    name: "Accuracy Master",
    description: "Complete 5 lessons with 100% accuracy",
    icon: "🎯",
  },
  {
    id: "top_row_explorer",
    name: "Top Row Explorer",
    description: "Complete all top row lessons",
    icon: "🗺️",
  },
  {
    id: "full_keyboard",
    name: "Full Keyboard",
    description: "Complete all bottom row lessons",
    icon: "⌨️",
  },
  {
    id: "number_ninja",
    name: "Number Ninja",
    description: "Complete all number lessons",
    icon: "🔢",
  },
  {
    id: "typing_master",
    name: "Typing Master",
    description: "Complete all lessons",
    icon: "🏆",
  },
  {
    id: "star_collector",
    name: "Star Collector",
    description: "Earn 30 stars total",
    icon: "⭐",
  },
  {
    id: "perfect_ten",
    name: "Perfect Ten",
    description: "Get 3 stars on 10 different lessons",
    icon: "💎",
  },
];

export function checkNewAchievements(progress: UserProgress): string[] {
  const newAchievements: string[] = [];
  const lessons = progress.lessons;
  const completedIds = Object.keys(lessons).filter(
    (id) => lessons[id].completed,
  );
  const totalStars = Object.values(lessons).reduce(
    (sum, l) => sum + (l.stars || 0),
    0,
  );
  const threeStarCount = Object.values(lessons).filter(
    (l) => l.stars === 3,
  ).length;
  const perfectCount = Object.values(lessons).filter(
    (l) => l.accuracy === 100,
  ).length;
  const maxWpm = Math.max(0, ...Object.values(lessons).map((l) => l.wpm || 0));

  if (completedIds.length >= 1 && !progress.achievements.includes("first_steps"))
    newAchievements.push("first_steps");

  const homeRowIds = ["1", "2", "3", "4", "5", "6", "7", "8"];
  if (
    homeRowIds.every((id) => completedIds.includes(id)) &&
    !progress.achievements.includes("home_row_hero")
  )
    newAchievements.push("home_row_hero");

  const topRowIds = ["9", "10", "11", "12", "13", "14", "15", "16"];
  if (
    topRowIds.every((id) => completedIds.includes(id)) &&
    !progress.achievements.includes("top_row_explorer")
  )
    newAchievements.push("top_row_explorer");

  const bottomRowIds = ["17", "18", "19", "20", "21", "22"];
  if (
    bottomRowIds.every((id) => completedIds.includes(id)) &&
    !progress.achievements.includes("full_keyboard")
  )
    newAchievements.push("full_keyboard");

  const numberIds = ["23", "24", "25"];
  if (
    numberIds.every((id) => completedIds.includes(id)) &&
    !progress.achievements.includes("number_ninja")
  )
    newAchievements.push("number_ninja");

  if (completedIds.length >= 35 && !progress.achievements.includes("typing_master"))
    newAchievements.push("typing_master");

  if (maxWpm >= 20 && !progress.achievements.includes("speed_demon"))
    newAchievements.push("speed_demon");

  if (perfectCount >= 5 && !progress.achievements.includes("accuracy_master"))
    newAchievements.push("accuracy_master");

  if (totalStars >= 30 && !progress.achievements.includes("star_collector"))
    newAchievements.push("star_collector");

  if (threeStarCount >= 10 && !progress.achievements.includes("perfect_ten"))
    newAchievements.push("perfect_ten");

  return newAchievements;
}
