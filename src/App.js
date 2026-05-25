import { useState, useEffect } from "react";

/* =========================
   🎮 LITERACY QUESTION BANK
========================= */
const questions = [
  // === COMPREHENSION ===
  {
    stat: "comprehension",
    difficulty: "easy",
    type: "passage",
    passage: "The cat sat on the mat. It was warm and sunny.",
    question: "Where did the cat sit?",
    answers: [
      { text: "On the mat", correct: true },
      { text: "On the chair", correct: false },
      { text: "Outside", correct: false },
    ],
  },
  {
    stat: "comprehension",
    difficulty: "medium",
    type: "passage",
    passage: "Maya loved to draw. Every day after school, she would sketch for hours. Her favorite subject was the old oak tree in her backyard.",
    question: "What can you infer about Maya?",
    answers: [
      { text: "She is patient and creative", correct: true },
      { text: "She dislikes school", correct: false },
      { text: "She only draws trees", correct: false },
    ],
  },

  // === COMPOSITION ===
  {
    stat: "composition",
    difficulty: "easy",
    type: "grammar",
    question: "Fix the sentence: 'The dog run fast.'",
    answers: [
      { text: "The dog runs fast.", correct: true },
      { text: "The dog running fast.", correct: false },
      { text: "The dog ran fastly.", correct: false },
    ],
  },
  {
    stat: "composition",
    difficulty: "medium",
    type: "grammar",
    question: "Which sentence is correctly punctuated?",
    answers: [
      { text: "After dinner, we went for a walk.", correct: true },
      { text: "After dinner we went for a walk.", correct: false },
      { text: "After, dinner we went for a walk.", correct: false },
    ],
  },

  // === VOCABULARY ===
  {
    stat: "vocabulary",
    difficulty: "easy",
    type: "definition",
    question: "What does 'happy' mean?",
    answers: [
      { text: "Feeling joy", correct: true },
      { text: "Feeling sad", correct: false },
      { text: "Feeling tired", correct: false },
    ],
  },
  {
    stat: "vocabulary",
    difficulty: "medium",
    type: "context",
    question: "In the sentence 'The ephemeral sunset faded quickly,' what does 'ephemeral' mean?",
    answers: [
      { text: "Short-lived", correct: true },
      { text: "Beautiful", correct: false },
      { text: "Colorful", correct: false },
    ],
  },

  // === ANALYSIS ===
  {
    stat: "analysis",
    difficulty: "medium",
    type: "rhetoric",
    question: "In the ad: '9 out of 10 doctors recommend X,' what technique is used?",
    answers: [
      { text: "Appeal to authority", correct: true },
      { text: "Emotional story", correct: false },
      { text: "Rhetorical question", correct: false },
    ],
  },
  {
    stat: "analysis",
    difficulty: "hard",
    type: "rhetoric",
    question: "A speech opens with: 'Imagine a world without hunger.' This is an example of:",
    answers: [
      { text: "Pathos (emotional appeal)", correct: true },
      { text: "Logos (logical appeal)", correct: false },
      { text: "Ethos (credibility appeal)", correct: false },
    ],
  },

  // === EXPRESSION ===
  {
    stat: "expression",
    difficulty: "easy",
    type: "creative",
    question: "Which sentence is more vivid?",
    answers: [
      { text: "The flower was red and pretty.", correct: false },
      { text: "The crimson rose blazed like a sunset in the garden.", correct: true },
      { text: "The flower existed in the garden.", correct: false },
    ],
  },

  // === STAMINA ===
  {
    stat: "stamina",
    difficulty: "easy",
    type: "focus",
    question: "Read this aloud in your mind: 'The quick brown fox jumps over the lazy dog.' What is special about this sentence?",
    answers: [
      { text: "It uses every letter of the alphabet", correct: true },
      { text: "It is a famous quote", correct: false },
      { text: "It rhymes", correct: false },
    ],
  },
];

/* =========================
   🏆 RANK SYSTEM
========================= */
const ranks = [
  { name: "Novice Scribe", minXP: 0, icon: "📝", color: "#9ca3af" },
  { name: "Apprentice Bard", minXP: 50, icon: "🎵", color: "#22c55e" },
  { name: "Journeyman Scholar", minXP: 150, icon: "📜", color: "#3b82f6" },
  { name: "Adept Wordsmith", minXP: 300, icon: "⚔️", color: "#a855f7" },
  { name: "Master Scholar", minXP: 500, icon: "👑", color: "#f59e0b" },
];

const getRank = (totalXP) => {
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (totalXP >= ranks[i].minXP) return ranks[i];
  }
  return ranks[0];
};

/* =========================
   🗺️ REGIONS
========================= */
const regions = [
  { name: "Phonic Forest", stat: "comprehension", minLevel: 1, icon: "🌲" },
  { name: "Syntax Citadel", stat: "composition", minLevel: 5, icon: "🏰" },
  { name: "Vocabulary Valley", stat: "vocabulary", minLevel: 5, icon: "📚" },
  { name: "Analysis Peaks", stat: "analysis", minLevel: 10, icon: "⛰️" },
  { name: "Creative Spires", stat: "expression", minLevel: 15, icon: "🎨" },
  { name: "Stamina Plains", stat: "stamina", minLevel: 1, icon: "⚡" },
];

/* =========================
   🔊 STORAGE + SOUND
========================= */
const saveGame = (data) => {
  localStorage.setItem("levelup_rpg", JSON.stringify(data));
};

const loadGame = () => {
  try {
    return JSON.parse(localStorage.getItem("levelup_rpg")) || null;
  } catch {
    return null;
  }
};

const soundCache = {};
const playSound = (file) => {
  try {
    if (!soundCache[file]) {
      soundCache[file] = new Audio(`/sounds/${file}`);
      soundCache[file].volume = 0.5;
    }
    const audio = soundCache[file];
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {}
};

/* =========================
   🎲 UTILITIES
========================= */
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const getXP = (difficulty) => {
  if (difficulty === "easy") return 10;
  if (difficulty === "medium") return 20;
  return 30;
};

const getStatLevel = (xp) => Math.floor(xp / 50) + 1;

/* =========================
   🎮 APP: LEVELUP RPG
========================= */
export default function App() {
  const saved = loadGame();

  const [state, setState] = useState(saved?.state || "menu");
  const [pool, setPool] = useState([]);
  const [current, setCurrent] = useState(null);

  // RPG STATS
  const [stats, setStats] = useState(
    saved?.stats || {
      comprehension: 0,
      composition: 0,
      vocabulary: 0,
      analysis: 0,
      expression: 0,
      stamina: 0,
    }
  );

  const [totalXP, setTotalXP] = useState(saved?.totalXP || 0);
  const [streak, setStreak] = useState(saved?.streak || 0);
  const [bestStreak, setBestStreak] = useState(saved?.bestStreak || 0);
  const [questionsAnswered, setQuestionsAnswered] = useState(saved?.questionsAnswered || 0);

  // COMBAT
  const [bossHP, setBossHP] = useState(saved?.bossHP || 100);
  const [playerHP, setPlayerHP] = useState(saved?.playerHP || 100);

  // OFFLINE DETECTION
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // DERIVED
  const currentRank = getRank(totalXP);
  const totalLevel = Math.floor(totalXP / 50) + 1;

  /* =========================
     💾 AUTO SAVE
  ========================= */
  useEffect(() => {
    saveGame({
      state,
      stats,
      totalXP,
      streak,
      bestStreak,
      questionsAnswered,
      bossHP,
      playerHP,
    });
  }, [state, stats, totalXP, streak, bestStreak, questionsAnswered, bossHP, playerHP]);

  /* =========================
     📡 OFFLINE LISTENER
  ========================= */
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /* =========================
     🧹 RESET SAVE
  ========================= */
  const clearSave = () => {
    localStorage.removeItem("levelup_rpg");
    setState("menu");
    setPool([]);
    setCurrent(null);
    setStats({ comprehension: 0, composition: 0, vocabulary: 0, analysis: 0, expression: 0, stamina: 0 });
    setTotalXP(0);
    setStreak(0);
    setBestStreak(0);
    setQuestionsAnswered(0);
    setBossHP(100);
    setPlayerHP(100);
  };

  /* =========================
     ▶ START GAME
  ========================= */
  const startGame = () => {
    const shuffled = shuffle(questions);
    setPool(shuffled);
    setCurrent(shuffled[0]);
    setBossHP(100 + totalLevel * 10);
    setPlayerHP(100);
    setState("game");
  };

  /* =========================
     🎯 ANSWER SYSTEM
  ========================= */
  const answer = (correct) => {
    if (!current) return;

    if (correct) {
      playSound("correct.mp3");

      const bonus = streak >= 2 ? 5 : 0;
      const gained = getXP(current.difficulty) + bonus;

      setStats((prev) => ({
        ...prev,
        [current.stat]: prev[current.stat] + gained,
      }));

      setTotalXP((p) => p + gained);
      setStreak((p) => {
        const newStreak = p + 1;
        setBestStreak((b) => Math.max(b, newStreak));
        return newStreak;
      });
      setQuestionsAnswered((p) => p + 1);
    } else {
      playSound("wrong.mp3");
      setStreak(0);
    }

    setTimeout(() => {
      const newPool = pool.slice(1);

      if (newPool.length === 0) {
        playSound("boss.mp3");
        setState("boss");
        return;
      }

      setPool(newPool);
      setCurrent(newPool[0]);
    }, 250);
  };

  /* =========================
     👾 BOSS FIGHT
  ========================= */
  const attackBoss = () => {
    playSound("boss.mp3");

    const baseDmg = 20;
    const statBonus = Math.floor(stats[current?.stat || "comprehension"] / 100);
    const streakBonus = streak >= 3 ? 10 : 0;
    const dmg = baseDmg + statBonus + streakBonus;

    const newBoss = Math.max(0, bossHP - dmg);
    const newPlayer = Math.max(0, playerHP - 15);

    setBossHP(newBoss);
    setPlayerHP(newPlayer);

    if (newBoss <= 0) {
      playSound("win.mp3");
      setState("win");
    }

    if (newPlayer <= 0) {
      playSound("wrong.mp3");
      setState("lose");
    }
  };

  /* =========================
     🔄 RESTART
  ========================= */
  const restart = () => {
    playSound("correct.mp3");
    setState("menu");
    setPool([]);
    setCurrent(null);
    setBossHP(100);
    setPlayerHP(100);
  };

  /* =========================
     🎨 UI
  ========================= */
  return (
    <div style={styles.app}>
      <button onClick={clearSave} style={styles.resetBtn}>
        Reset
      </button>

      {/* MENU */}
      {state === "menu" && (
        <div style={styles.center}>
          <div style={styles.rankBadge}>
            <span style={{ fontSize: 40 }}>{currentRank.icon}</span>
            <div style={{ fontSize: 14, color: currentRank.color, fontWeight: "bold" }}>
              {currentRank.name}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Level {totalLevel} • {totalXP} XP
            </div>
          </div>

          <h1 style={styles.title}>⚡ LEVELUP</h1>
          <p style={styles.subtitle}>Literacy RPG • Offline Mobile Game</p>

          {/* STAT RADAR */}
          <div style={styles.statPanel}>
            {Object.entries(stats).map(([stat, xp]) => (
              <div key={stat} style={styles.statRow}>
                <span style={styles.statName}>
                  {stat === "comprehension" && "📖"}
                  {stat === "composition" && "✍️"}
                  {stat === "vocabulary" && "🗣️"}
                  {stat === "analysis" && "🔍"}
                  {stat === "expression" && "🎭"}
                  {stat === "stamina" && "⚡"}
                  {" "}
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </span>
                <div style={styles.statBarBg}>
                  <div
                    style={{
                      ...styles.statBarFill,
                      width: `${Math.min(100, (xp % 50) / 50 * 100)}%`,
                      background: currentRank.color,
                    }}
                  />
                </div>
                <span style={styles.statLevel}>Lv.{getStatLevel(xp)}</span>
              </div>
            ))}
          </div>

          {/* REGIONS */}
          <div style={styles.regionPanel}>
            <h3 style={{ margin: "10px 0", fontSize: 14, opacity: 0.8 }}>🗺️ Regions</h3>
            {regions.map((r) => {
              const unlocked = getStatLevel(stats[r.stat]) >= r.minLevel;
              return (
                <div
                  key={r.name}
                  style={{
                    ...styles.regionRow,
                    opacity: unlocked ? 1 : 0.4,
                  }}
                >
                  <span>{r.icon}</span>
                  <span style={{ flex: 1, textAlign: "left", marginLeft: 8 }}>
                    {r.name}
                  </span>
                  {!unlocked && <span style={{ fontSize: 11 }}>🔒 Lv.{r.minLevel}</span>}
                </div>
              );
            })}
          </div>

          <button style={styles.primaryBtn} onClick={startGame}>
            START QUEST
          </button>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.5 }}>
            Best Streak: {bestStreak} • Questions: {questionsAnswered}
          </div>
        </div>
      )}

      {/* GAME */}
      {state === "game" && current && (
        <div style={styles.center}>
          <div style={styles.hud}>
            <div>
              <span style={{ fontSize: 20 }}>{currentRank.icon}</span>
              <div style={{ fontSize: 11 }}>{currentRank.name}</div>
            </div>
            <div>🔥 {streak}</div>
            <div>⚡ {totalXP}</div>
          </div>

          <div style={styles.card}>
            <div style={styles.statTag}>
              {current.stat === "comprehension" && "📖 Comprehension"}
              {current.stat === "composition" && "✍️ Composition"}
              {current.stat === "vocabulary" && "🗣️ Vocabulary"}
              {current.stat === "analysis" && "🔍 Analysis"}
              {current.stat === "expression" && "🎭 Expression"}
              {current.stat === "stamina" && "⚡ Stamina"}
              {" • "}
              <span style={{ textTransform: "capitalize" }}>{current.difficulty}</span>
            </div>

            {current.passage && (
              <div style={styles.passage}>{current.passage}</div>
            )}

            <h2 style={styles.question}>{current.question}</h2>

            {current.answers.map((a, i) => (
              <button
                key={i}
                style={styles.answerBtn}
                onClick={() => answer(a.correct)}
              >
                {a.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BOSS */}
      {state === "boss" && (
        <div style={styles.center}>
          <h1>👾 SYNTAX GOLEM</h1>
          <p style={{ opacity: 0.7, marginBottom: 10 }}>
            Boss HP scales with your level!
          </p>

          <div style={styles.bar}>
            <div style={{ ...styles.hp, width: `${bossHP}%` }} />
          </div>
          <div style={{ fontSize: 12, marginBottom: 10 }}>
            Boss HP: {bossHP}
          </div>

          <div style={styles.bar}>
            <div style={{ ...styles.playerHp, width: `${playerHP}%` }} />
          </div>
          <div style={{ fontSize: 12, marginBottom: 20 }}>
            Your HP: {playerHP}
          </div>

          <div style={{ fontSize: 14, marginBottom: 10 }}>
            {streak >= 3 ? "🔥 STREAK BONUS ACTIVE!" : `Streak: ${streak}`}
          </div>

          <button style={styles.primaryBtn} onClick={attackBoss}>
            CAST SPELL
          </button>
        </div>
      )}

      {/* WIN / LOSE */}
      {(state === "win" || state === "lose") && (
        <div style={styles.center}>
          <div style={{ fontSize: 50, marginBottom: 10 }}>
            {state === "win" ? "🏆" : "💀"}
          </div>
          <h1>{state === "win" ? "VICTORY!" : "DEFEATED"}</h1>

          {state === "win" && (
            <div style={{ margin: "15px 0", fontSize: 14 }}>
              <div>+{getXP("hard")} XP earned!</div>
              <div>Current Rank: {currentRank.icon} {currentRank.name}</div>
            </div>
          )}

          <button style={styles.primaryBtn} onClick={restart}>
            {state === "win" ? "NEXT QUEST" : "TRY AGAIN"}
          </button>
        </div>
      )}

      {/* OFFLINE BANNER */}
      {isOffline && (
        <div style={styles.offlineBanner}>
          <span>📡</span>
          <span>Offline Mode — Progress saved locally</span>
        </div>
      )}
    </div>
  );
}

/* =========================
   🎨 STYLES (Responsive)
========================= */
const styles = {
  app: {
    minHeight: "100dvh",
    background: "linear-gradient(180deg, #0b1020, #111827)",
    color: "white",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    WebkitTextSizeAdjust: "100%",
    position: "relative",
  },

  center: {
    width: "100%",
    maxWidth: "100%",
    textAlign: "center",
    padding: "0 8px",
    boxSizing: "border-box",
  },

  title: {
    fontSize: "clamp(24px, 5vw, 36px)",
    marginBottom: 6,
    fontWeight: 800,
    letterSpacing: "0.05em",
  },

  subtitle: {
    opacity: 0.7,
    marginBottom: 20,
    fontSize: "clamp(12px, 2.5vw, 16px)",
  },

  rankBadge: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: "15px 20px",
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    maxWidth: 320,
    margin: "0 auto 20px",
  },

  statPanel: {
    background: "#1f2937",
    borderRadius: 16,
    padding: "12px 15px",
    marginBottom: 15,
    textAlign: "left",
    maxWidth: 400,
    margin: "0 auto 15px",
  },

  statRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: "5px 0",
    fontSize: "clamp(11px, 2vw, 13px)",
  },

  statName: {
    width: "clamp(90px, 25vw, 110px)",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },

  statBarBg: {
    flex: 1,
    height: 8,
    background: "#374151",
    borderRadius: 4,
    overflow: "hidden",
    minWidth: 60,
  },

  statBarFill: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.5s ease",
  },

  statLevel: {
    width: 35,
    textAlign: "right",
    fontSize: 11,
    opacity: 0.7,
    flexShrink: 0,
  },

  regionPanel: {
    background: "#1f2937",
    borderRadius: 16,
    padding: "12px 15px",
    marginBottom: 20,
    maxWidth: 400,
    margin: "0 auto 20px",
  },

  regionRow: {
    display: "flex",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #374151",
    fontSize: "clamp(12px, 2.2vw, 14px)",
    gap: 8,
  },

  hud: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 14px",
    background: "#1f2937",
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    gap: 8,
    maxWidth: 420,
    margin: "0 auto 15px",
  },

  card: {
    background: "#1f2937",
    padding: "clamp(16px, 4vw, 24px)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    textAlign: "left",
    maxWidth: 600,
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },

  statTag: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 600,
  },

  passage: {
    background: "#111827",
    padding: 12,
    borderRadius: 8,
    fontSize: "clamp(13px, 2.5vw, 15px)",
    lineHeight: 1.6,
    marginBottom: 12,
    fontStyle: "italic",
    opacity: 0.9,
    borderLeft: "3px solid #22c55e",
  },

  question: {
    fontSize: "clamp(16px, 3.5vw, 20px)",
    marginBottom: 16,
    lineHeight: 1.4,
    fontWeight: 600,
  },

  answerBtn: {
    display: "block",
    width: "100%",
    margin: "8px 0",
    padding: "clamp(12px, 3vw, 16px)",
    borderRadius: 12,
    border: "none",
    fontSize: "clamp(14px, 3vw, 16px)",
    background: "#374151",
    color: "white",
    cursor: "pointer",
    transition: "transform 0.1s, background 0.2s, box-shadow 0.2s",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    minHeight: 44,
  },

  primaryBtn: {
    marginTop: 20,
    padding: "clamp(14px, 3vw, 18px)",
    width: "100%",
    maxWidth: 400,
    borderRadius: 14,
    border: "none",
    fontSize: "clamp(14px, 3vw, 17px)",
    fontWeight: "bold",
    background: "#22c55e",
    color: "black",
    cursor: "pointer",
    transition: "transform 0.1s, filter 0.2s",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    minHeight: 44,
  },

  resetBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 8,
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    zIndex: 10,
    minHeight: 32,
  },

  bar: {
    width: "100%",
    maxWidth: 400,
    height: 14,
    background: "#333",
    borderRadius: 10,
    overflow: "hidden",
    margin: "8px auto",
  },

  hp: {
    height: "100%",
    background: "linear-gradient(90deg, #ef4444, #dc2626)",
    transition: "width 0.3s ease",
  },

  playerHp: {
    height: "100%",
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    transition: "width 0.3s ease",
  },

  offlineBanner: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "#f59e0b",
    color: "#111827",
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    textAlign: "center",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
};