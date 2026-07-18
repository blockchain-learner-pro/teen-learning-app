import { getDifficultyLevel, shuffle } from "../utils/gameMath";
import { getPerformanceScore } from "../engine/performanceEngine";

// Learning history tracking (recordLearning) lives in
// engine/performanceEngine.js - re-export it here so existing imports
// of `recordLearning` from this file keep working, without keeping a
// second, separate history array that could drift out of sync.
export { recordLearning } from "../engine/performanceEngine";

/* =========================
   🔢 MATH
   Operation and number range scale with difficulty level.
========================= */
const mathGenerator = (level) => {
  const max = level * 10;
  const a = Math.floor(Math.random() * max) + 1;
  const b = Math.floor(Math.random() * max) + 1;

  const ops =
    level === 1
      ? ["+"]
      : level === 2
      ? ["+", "-"]
      : ["+", "-", "x"];

  const op = ops[Math.floor(Math.random() * ops.length)];

  let question;
  let answer;

  if (op === "+") {
    question = `Solve: ${a} + ${b}`;
    answer = a + b;
  } else if (op === "-") {
    // keep subtraction non-negative for readability
    const hi = Math.max(a, b);
    const lo = Math.min(a, b);
    question = `Solve: ${hi} - ${lo}`;
    answer = hi - lo;
  } else {
    // smaller numbers for multiplication so it stays approachable
    const smallA = Math.floor(Math.random() * (level * 4)) + 1;
    const smallB = Math.floor(Math.random() * (level * 4)) + 1;
    question = `Solve: ${smallA} x ${smallB}`;
    answer = smallA * smallB;
  }

  const wrongOffsets = shuffle([1, -1, 2, -2, 3, -3]).slice(0, 2);
  const wrongAnswers = wrongOffsets.map((offset) =>
    Math.max(0, answer + offset)
  );

  const answers = shuffle([
    { text: `${answer}`, correct: true },
    ...wrongAnswers.map((wa) => ({ text: `${wa}`, correct: false })),
  ]);

  return {
    type: "math",
    difficulty: level,
    stat: "comprehension",
    question,
    answers,
  };
};

/* =========================
   📖 READING
   Built-in fallback bank, used if the editable questions.json
   file (in /public) is missing or invalid.
========================= */
const DEFAULT_READING_BANK = [
  {
    passage:
      "The old lighthouse keeper climbed the spiral stairs every evening, rain or shine, to light the lamp that guided ships safely past the rocks.",
    question: "What is the main idea?",
    correct: "The keeper reliably lit the lamp to keep ships safe.",
    wrong: [
      "The keeper disliked climbing stairs.",
      "Ships avoided the lighthouse on purpose.",
      "The lamp was broken most nights.",
    ],
  },
  {
    passage:
      "Maria practiced the violin for an hour every day after school, even when she felt tired, because she had a recital coming up in June.",
    question: "Why did Maria keep practicing?",
    correct: "She had an upcoming recital to prepare for.",
    wrong: [
      "She didn't enjoy playing the violin.",
      "Her teacher forced her to practice.",
      "She wanted to skip school.",
    ],
  },
  {
    passage:
      "After the storm knocked out power for three days, the neighbors set up a shared grill in the street so no one's food would go to waste.",
    question: "What does this passage mainly show?",
    correct: "People working together during a hard situation.",
    wrong: [
      "A neighborhood argument over food.",
      "A planned block party.",
      "People ignoring the power outage.",
    ],
  },
  {
    passage:
      "Even though the trail was steep and the fog made it hard to see, the hikers kept moving, checking their map at every fork in the path.",
    question: "What best describes the hikers?",
    correct: "Careful and persistent despite difficult conditions.",
    wrong: [
      "Lost and about to give up.",
      "Unprepared for the hike.",
      "Racing each other to the top.",
    ],
  },
];

/* =========================
   ✍️ WRITING
   Built-in fallback prompts, same idea as above.
========================= */
const DEFAULT_WRITING_PROMPTS = [
  "Write about your day.",
  "Describe a place you'd love to visit and why.",
  "Write about a time you learned something new.",
  "If you could have any superpower, what would it be and why?",
  "Describe your favorite hobby and what you enjoy about it.",
  "Write about a challenge you overcame.",
];

/* =========================
   🔄 LOADING THE EDITABLE QUESTION BANK
   Reads /questions.json (in the public folder) at startup so it
   can be edited without touching any code or rebuilding the app.
   If the file is missing, unreachable, or malformed, we quietly
   keep using the built-in defaults above instead of crashing.
========================= */
let activeReadingBank = DEFAULT_READING_BANK;
let activeWritingPrompts = DEFAULT_WRITING_PROMPTS;
let bankLoaded = false;

const isValidReadingItem = (item) =>
  item &&
  typeof item.passage === "string" &&
  typeof item.question === "string" &&
  typeof item.correct === "string" &&
  Array.isArray(item.wrong) &&
  item.wrong.every((w) => typeof w === "string") &&
  item.wrong.length >= 1;

export const loadQuestionBank = async () => {
  if (bankLoaded) return;
  bankLoaded = true;

  try {
    const response = await fetch("questions.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (Array.isArray(data.reading) && data.reading.every(isValidReadingItem) && data.reading.length > 0) {
      activeReadingBank = data.reading;
    } else if (data.reading) {
      console.warn(
        "questions.json: 'reading' section looks malformed, using built-in defaults instead."
      );
    }

    if (
      Array.isArray(data.writing) &&
      data.writing.every((p) => typeof p === "string") &&
      data.writing.length > 0
    ) {
      activeWritingPrompts = data.writing;
    } else if (data.writing) {
      console.warn(
        "questions.json: 'writing' section looks malformed, using built-in defaults instead."
      );
    }
  } catch (err) {
    // Missing file, bad JSON syntax, network hiccup, etc.
    // Fall back silently to the defaults - nothing breaks for the player.
    console.warn(
      "Couldn't load questions.json, using built-in default questions instead.",
      err
    );
  }
};

const readingGenerator = (level) => {
  const bank = activeReadingBank;
  const item = bank[Math.floor(Math.random() * bank.length)];

  const answers = shuffle([
    { text: item.correct, correct: true },
    ...shuffle(item.wrong)
      .slice(0, 2)
      .map((text) => ({ text, correct: false })),
  ]);

  return {
    type: "reading",
    difficulty: level,
    stat: "comprehension",
    question: `${item.passage}\n\n${item.question}`,
    answers,
  };
};

const writingGenerator = (level) => {
  const bank = activeWritingPrompts;
  const prompt = bank[Math.floor(Math.random() * bank.length)];

  return {
    type: "writing",
    difficulty: level,
    stat: "expression",
    prompt,
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
  if (roll < 0.5) type = "math";
  else type = "reading";

  const question =
    type === "math"
      ? mathGenerator(level)
      : writingGenerator(level);

  return {
    ...question,
    type,
  };
};
