// src/engine/hintEngine.js
//
// Generates a helpful (but not answer-revealing) clue based on the
// current question. Used by the mascot's hint bubble.

const mathHint = (current) => {
  const match = current.question?.match(/Solve: (-?\d+)\s*([+\-x])\s*(-?\d+)/);
  if (!match) return "Take it one step at a time - you've got this!";

  const [, a, op, b] = match;

  if (op === "+") {
    return `Try adding ${a} and ${b} in your head, or count up from the bigger number.`;
  }
  if (op === "-") {
    return `Try counting down from ${a} by ${b}, or think of it as "${a} take away ${b}".`;
  }
  return `Multiplying ${a} x ${b} is the same as adding ${a} to itself ${b} times.`;
};

const readingHint = () =>
  "Re-read the passage and ask: what is it mostly about, not just one small detail?";

const writingHint = () =>
  "There's no wrong answer here - just write a few honest sentences about it.";

export const getHint = (current) => {
  if (!current) return "Let's see what's next!";

  switch (current.type) {
    case "math":
      return mathHint(current);
    case "reading":
      return readingHint();
    case "writing":
      return writingHint();
    default:
      return "Take your time - you've got this!";
  }
};

// A short encouragement to show after a wrong answer, separate from
// the on-demand hint above.
const ENCOURAGEMENTS = [
  "No worries, mistakes help you learn!",
  "So close - try the next one!",
  "Shake it off, you've got this!",
];

export const getEncouragement = () =>
  ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
