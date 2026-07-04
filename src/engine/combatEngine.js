// src/engine/combatEngine.js

import { playSound } from "../utils/audio";
import { SOUNDS } from "../utils/sounds";

/**
 * Handles boss fight attack logic.
 */
export const attackBossFlow = ({
  stats = {},
  streak = 0,
  bossHP = 100,
  playerHP = 100,
  current,
  setBossHP,
  setPlayerHP,
  setState,
}) => {
  playSound(SOUNDS.boss);

  /* =========================
     DAMAGE CALCULATION
  ========================= */

  const statName = current?.stat || "comprehension";

  const statValue = stats[statName] || 0;

  const baseDamage = 20;
  const statBonus = Math.floor(statValue / 100);
  const streakBonus = streak >= 3 ? 10 : 0;

  const damageToBoss =
    baseDamage +
    statBonus +
    streakBonus;

  const bossDamage = 15;

  const newBossHP = Math.max(0, bossHP - damageToBoss);
  const newPlayerHP = Math.max(0, playerHP - bossDamage);

  /* =========================
     UPDATE STATE
  ========================= */

  if (setBossHP) {
    setBossHP(newBossHP);
  }

  if (setPlayerHP) {
    setPlayerHP(newPlayerHP);
  }

  /* =========================
     WIN / LOSE
  ========================= */

  if (newBossHP <= 0) {
    playSound(SOUNDS.completion);

    if (setState) {
      setState("win");
    }

    return {
      result: "win",
      bossHP: newBossHP,
      playerHP: newPlayerHP,
      damage: damageToBoss,
    };
  }

  if (newPlayerHP <= 0) {
    playSound(SOUNDS.lose);

    if (setState) {
      setState("lose");
    }

    return {
      result: "lose",
      bossHP: newBossHP,
      playerHP: newPlayerHP,
      damage: damageToBoss,
    };
  }

  return {
    result: "continue",
    bossHP: newBossHP,
    playerHP: newPlayerHP,
    damage: damageToBoss,
  };
};