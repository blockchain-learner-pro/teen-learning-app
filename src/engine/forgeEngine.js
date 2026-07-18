// src/engine/forgeEngine.js
//
// Pure logic for "Forge" (writing) submissions.
// Kept separate from any component so it can be tested and reused
// without dragging React/UI code along with it.

import { GAME_CONFIG } from "../config/gameConfig";

/**
 * Scores a written submission and returns the XP/stat update to apply.
 * Very simple heuristic for now: longer, more thoughtful answers score
 * a bit higher, capped so spamming text doesn't game the system.
 */
export const scoreForgeSubmission = (text = "") => {
  const trimmed = text.trim();
  const wordCount = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;

  const baseXP = GAME_CONFIG.xp.base[1] || 10;
  const lengthBonus = Math.min(Math.floor(wordCount / 10), 3) * 5;

  return {
    wordCount,
    xp: baseXP + lengthBonus,
  };
};

/**
 * Applies a forge (writing) submission: validates it, computes XP,
 * and returns everything the caller needs to update React state.
 * Returns { success: false } if the submission is empty.
 */
export const submitForgeFlow = ({ forgeContent, currentPrompt }) => {
  const trimmed = (forgeContent || "").trim();

  if (trimmed.length === 0) {
    return { success: false, reason: "empty" };
  }

  const { xp, wordCount } = scoreForgeSubmission(trimmed);

  return {
    success: true,
    xp,
    wordCount,
    entry: {
      prompt: currentPrompt?.prompt || null,
      text: trimmed,
      xp,
      submittedAt: Date.now(),
    },
  };
};
