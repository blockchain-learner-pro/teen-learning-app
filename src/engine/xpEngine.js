import { getXP } from "../utils/gameMath";

/**
 * Handles XP, streaks and stat progression after each answer.
 */
export const processAnswerXP = ({
  correct,
  streak = 0,
  current,
  setStats,
  setTotalXP,
  setStreak,
  setBestStreak,
  setQuestionsAnswered,
}) => {
  /* =========================
     ❌ Wrong Answer
  ========================= */

  if (!correct) {
    if (setStreak) {
      setStreak(0);
    }

    return {
      gained: 0,
      newStreak: 0,
    };
  }

  /* =========================
     ⭐ XP Calculation
  ========================= */

  const difficulty = current?.difficulty || 1;

  const baseXP = getXP(difficulty, streak);

  const gained = baseXP;

  /* =========================
     📊 Update Skill Stats
  ========================= */

  if (current?.stat && setStats) {
    setStats((prev) => ({
      ...prev,
      [current.stat]: (prev[current.stat] || 0) + gained,
    }));
  }

  /* =========================
     💎 Total XP
  ========================= */

  if (setTotalXP) {
    setTotalXP((prev) => prev + gained);
  }

  /* =========================
     🔥 Combo / Streak
  ========================= */

  let newStreak = streak + 1;

  if (setStreak) {
    setStreak((prev) => {
      newStreak = prev + 1;

      if (setBestStreak) {
        setBestStreak((best) => Math.max(best, newStreak));
      }

      return newStreak;
    });
  }

  /* =========================
     📈 Questions Answered
  ========================= */

  if (setQuestionsAnswered) {
    setQuestionsAnswered((prev) => prev + 1);
  }

  return {
    gained,
    newStreak,
  };
};
