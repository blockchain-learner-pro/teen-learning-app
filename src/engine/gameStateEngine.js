import { nextQuestionFlow } from "./gameFlow";
import { processAnswerXP } from "./xpEngine";
import {
  recordPerformance,
  getPerformanceScore,
  recordLearning,
} from "./performanceEngine";

/**
 * CENTRAL GAME BRAIN
 */
export const handleAnswer = ({
  correct,
  current,
  state,
  setState,
  pool,
  setPool,
  setCurrent,
  stats,
  setStats,
  setTotalXP,
  streak,
  setStreak,
  setBestStreak,
  setQuestionsAnswered,
}) => {

  // 🧠 track performance
  recordPerformance(correct);

  // 🧠 track learning per question type
  if (current?.type) {
    recordLearning(current.type, correct);
  }

  // XP system
  processAnswerXP({
    correct,
    streak,
    current,
    setStats,
    setTotalXP,
    setStreak,
    setBestStreak,
    setQuestionsAnswered,
  });

  // ❌ stop if wrong
  if (!correct) return;

  // 🧠 adaptive difficulty
  const skill = getPerformanceScore();

  const difficulty =
    skill > 80 ? 3 :
    skill > 60 ? 2 : 1;

  // 🎮 next question
  nextQuestionFlow({
    pool,
    setPool,
    setCurrent,
    setState,
    difficulty,
  });
};