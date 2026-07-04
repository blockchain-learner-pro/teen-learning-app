import { getDifficultyLevel } from "../utils/gameMath";
import { getPerformanceScore } from "../engine/performanceEngine";

/* memory */
let sessionHistory = [];

export const recordLearning = (type, correct) => {
  sessionHistory.push({ type, correct });
  if (sessionHistory.length > 30) sessionHistory.shift();
};

/* generators */
const mathGenerator = (level) => {
  const max = level * 10;
  const a = Math.floor(Math.random() * max) + 1;
  const b = Math.floor(Math.random() * max) + 1;

  const answer = a + b;

  return {
    type: "math",
    difficulty: level,
    question: `Solve: ${a} + ${b}`,
    answers: [
      { text: `${answer}`, correct: true },
      { text: `${answer + 2}`, correct: false },
      { text: `${answer - 1}`, correct: false },
    ],
  };
};

const readingGenerator = (level) => {
  return {
    type: "reading",
    difficulty: level,
    question: "What is the main idea?",
    answers: [
      { text: "Correct idea", correct: true },
      { text: "Wrong", correct: false },
    ],
  };
};

const writingGenerator = (level) => {
  return {
    type: "writing",
    difficulty: level,
    prompt: "Write about your day",
  };
};

export const generateQuestions = (stats, combo) => {
  const skill = getPerformanceScore();
  const baseLevel = getDifficultyLevel(stats, combo);

  const level =
    skill > 80 ? Math.min(baseLevel + 1, 3) :
    skill < 40 ? Math.max(baseLevel - 1, 1) :
    baseLevel;

  const roll = Math.random();

  let type;
  if (roll < 0.4) type = "math";
  else if (roll < 0.8) type = "reading";
  else type = "writing";

  const question =
    type === "math"
      ? mathGenerator(level)
      : type === "reading"
      ? readingGenerator(level)
      : writingGenerator(level);

  return {
    ...question,
    type,
  };
};