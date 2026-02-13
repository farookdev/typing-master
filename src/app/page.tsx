"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [recentUsers, setRecentUsers] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("typing-master-users");
    if (stored) {
      try {
        setRecentUsers(JSON.parse(stored));
      } catch {}
    }
  }, []);

  function handleStart() {
    const trimmed = username.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters!");
      return;
    }
    if (trimmed.length > 20) {
      setError("Name must be less than 20 characters!");
      return;
    }
    const users = Array.from(new Set([trimmed, ...recentUsers])).slice(0, 5);
    localStorage.setItem("typing-master-users", JSON.stringify(users));
    localStorage.setItem("typing-master-current-user", trimmed);
    router.push("/lessons/1");
  }

  function selectUser(name: string) {
    setUsername(name);
    localStorage.setItem("typing-master-current-user", name);
    const users = Array.from(new Set([name, ...recentUsers])).slice(0, 5);
    localStorage.setItem("typing-master-users", JSON.stringify(users));
    router.push("/lessons/1");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo / Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <div className="text-7xl mb-4">⌨️</div>
          <h1 className="text-4xl font-extrabold text-purple-800 mb-2">
            Typing Master
          </h1>
          <p className="text-lg text-purple-600">
            Learn touch typing the fun way!
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-xl border border-purple-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <label className="block text-lg font-semibold text-purple-700 mb-3">
            What&apos;s your name?
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="Type your name..."
            className="w-full px-5 py-3.5 text-lg rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white text-purple-900 placeholder-purple-300 transition"
            maxLength={20}
            autoFocus
          />
          {error && (
            <motion.p
              className="text-red-500 text-sm mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}
          <motion.button
            onClick={handleStart}
            className="w-full mt-4 py-3.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Typing!
          </motion.button>

          {recentUsers.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-purple-500 mb-2">Recent learners:</p>
              <div className="flex flex-wrap gap-2">
                {recentUsers.map((name) => (
                  <motion.button
                    key={name}
                    onClick={() => selectUser(name)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {name}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          className="mt-8 grid grid-cols-3 gap-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: "🎮", label: "35 Lessons" },
            { icon: "⭐", label: "Earn Stars" },
            { icon: "🏆", label: "Achievements" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-white/50 rounded-2xl p-4 backdrop-blur"
            >
              <div className="text-3xl mb-1">{f.icon}</div>
              <div className="text-sm font-medium text-purple-700">
                {f.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
