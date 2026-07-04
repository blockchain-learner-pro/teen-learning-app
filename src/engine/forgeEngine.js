import { playSound } from "../utils/audio";
import { SOUNDS } from "../utils/sounds";

/**
 * Submit a writing response and award XP.
 */
export const submitForgeFlow = ({
  forgeContent = "",
  currentPrompt,
  setStats,
  setTotalXP,
  setLibrary,
  setLastXP,
  setState,
}) => {
  if (!currentPrompt) {
    return {
      success: false,
      wordCount: 0,
      xp: 0,
    };
  }

  /* =========================
     WORD COUNT
  ========================= */

  const words = forgeContent
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const wordCount = words.length;

  /* =========================
     TOO SHORT
  ========================= */

  if (wordCount < currentPrompt.minWords) {
    playSound(SOUNDS.lose);

    return {
      success: false,
      wordCount,
      xp: 0,
    };
  }

  /* =========================
     XP CALCULATION
  ========================= */

  const baseXP = 25;

  const wordBonus =
    Math.min(wordCount, currentPrompt.maxWords || wordCount) / 10;

  const tierMultiplier = currentPrompt.tier || 1;

  const totalGained = Math.floor(
    (baseXP + wordBonus) * tierMultiplier
  );

  /* =========================
     UPDATE STATS
  ========================= */

  if (setStats) {
    setStats((prev) => ({
      ...prev,
      expression:
        (prev.expression || 0) + Math.floor(totalGained * 0.6),

      composition:
        (prev.composition || 0) + Math.floor(totalGained * 0.4),
    }));
  }

  if (setTotalXP) {
    setTotalXP((prev) => prev + totalGained);
  }

  if (setLastXP) {
    setLastXP(totalGained);
  }

  /* =========================
     SAVE WRITING
  ========================= */

  const newStory = {
    id: Date.now(),
    promptId: currentPrompt.id ?? null,
    title: currentPrompt.title || "Untitled",
    content: forgeContent,
    wordCount,
    date: new Date().toLocaleDateString(),
    xpEarned: totalGained,
  };

  if (setLibrary) {
    setLibrary((prev) => [newStory, ...prev]);
  }

  playSound(SOUNDS.completion);

  if (setState) {
    setState("forge-review");
  }

  return {
    success: true,
    wordCount,
    xp: totalGained,
    story: newStory,
  };
};