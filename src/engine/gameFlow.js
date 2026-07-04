import { shuffle } from "../utils/gameMath";
import { playSound } from "../utils/audio";
import { SOUNDS } from "../utils/sounds";

/* =========================
   🎮 START GAME
========================= */

export const startGameFlow = ({
  questions,
  totalLevel = 1,
  setPool,
  setCurrent,
  setBossHP,
  setPlayerHP,
  setState,
}) => {
  const shuffled = shuffle(questions);

  setPool(shuffled);
  setCurrent(shuffled[0] || null);

  setBossHP(100 + totalLevel * 10);
  setPlayerHP(100);

  setState("game");
};

/* =========================
   ➡️ NEXT QUESTION
========================= */

export const nextQuestionFlow = ({
  pool,
  setPool,
  setCurrent,
  setState,
  difficulty,
}) => {
  // Filter questions by difficulty if supplied
  let availablePool = pool;

  if (difficulty !== undefined) {
    const filtered = pool.filter(
      (q) => (q.difficulty || 1) <= difficulty
    );

    if (filtered.length > 0) {
      availablePool = filtered;
    }
  }

  // Remove current question
  const newPool = availablePool.slice(1);

  // Boss fight when finished
  if (newPool.length === 0) {
    playSound(SOUNDS.boss);
    setState("boss");
    return;
  }

  // Next question
  setPool(newPool);
  setCurrent(newPool[0]);
};