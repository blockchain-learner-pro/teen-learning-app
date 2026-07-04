import { GAME_CONFIG } from "../config/gameConfig";

/* =========================
   🎲 UTILITIES
========================= */

export const shuffle = (arr) =>
  [...arr].sort(() => Math.random() - 0.5);

/* =========================
   XP SYSTEM
========================= */

export const getXP = (difficulty, combo = 0) => {
  const base = GAME_CONFIG.xp.base[difficulty] || 10;

  const bonus =
    combo >= GAME_CONFIG.xp.comboBonusAt
      ? GAME_CONFIG.xp.comboBonus
      : 0;

  return base + bonus;
};

/* =========================
   LEVEL SYSTEM
========================= */

export const getStatLevel = (xp) =>
  Math.floor(xp / GAME_CONFIG.progression.xpPerLevel) + 1;

/* =========================
   ADAPTIVE DIFFICULTY SYSTEM
   (FIXED: removed missing dependency)
========================= */

export const getDifficultyLevel = (stats, combo) => {
  const avg =
    (stats.comprehension +
      stats.expression +
      stats.composition) / 3;

  let level = 1;

  if (avg > 50) level = 2;
  if (avg > 120) level = 3;

  // combo boost
  if (combo >= 5) level += 1;

  return Math.min(level, GAME_CONFIG.difficulty.maxLevel);
};

/* =========================
   🧠 PERFORMANCE TRACKING
========================= */

let performanceHistory = [];

/**
 * Record each answer result
 */
export const recordPerformance = (correct) => {
  performanceHistory.push(correct ? 1 : 0);

  if (performanceHistory.length > 20) {
    performanceHistory.shift();
  }
};

/**
 * Calculate player skill score (0–100)
 */
export const getPerformanceScore = () => {
  if (performanceHistory.length === 0) return 50;

  const sum = performanceHistory.reduce((a, b) => a + b, 0);
  return (sum / performanceHistory.length) * 100;
};