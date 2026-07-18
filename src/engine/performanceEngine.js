let performanceHistory = [];
let learningHistory = {
  math: [],
  reading: [],
  writing: [],
};

/* =========================
   📊 PERFORMANCE TRACKING
========================= */

export const recordPerformance = (correct) => {
  performanceHistory.push(correct ? 1 : 0);

  if (performanceHistory.length > 20) {
    performanceHistory.shift();
  }
};

/* =========================
   🧠 PERFORMANCE SCORE (0–100)
========================= */

export const getPerformanceScore = () => {
  if (performanceHistory.length === 0) return 50;

  const sum = performanceHistory.reduce((a, b) => a + b, 0);
  return (sum / performanceHistory.length) * 100;
};

/* =========================
   📚 LEARNING TRACKING
========================= */

export const recordLearning = (type, correct) => {
  if (!learningHistory[type]) {
    learningHistory[type] = [];
  }

  learningHistory[type].push(correct ? 1 : 0);

  if (learningHistory[type].length > 30) {
    learningHistory[type].shift();
  }
};

/* =========================
   📈 LEARNING BIAS (weak areas)
========================= */

export const getLearningBias = () => {
  const types = ["math", "reading", "writing"];

  const scores = types.map((t) => {
    const history = learningHistory[t] || [];
    if (history.length === 0) return 0.5;

    const recent = history.slice(-10);
    return recent.reduce((a, b) => a + b, 0) / recent.length;
  });

  const weakestIndex = scores.indexOf(Math.min(...scores));
  return types[weakestIndex];
};