import { useState, useEffect } from "react";

/* =========================
   🎮 QUESTIONS
========================= */
const questions = [
  { difficulty: "easy", question: "What is 2 + 2?", answers: [
    { text: "3", correct: false },
    { text: "4", correct: true },
    { text: "5", correct: false },
  ]},
  { difficulty: "easy", question: "What color is the sky?", answers: [
    { text: "Blue", correct: true },
    { text: "Green", correct: false },
    { text: "Red", correct: false },
  ]},
  { difficulty: "medium", question: "What is 10 x 2?", answers: [
    { text: "20", correct: true },
    { text: "15", correct: false },
    { text: "25", correct: false },
  ]},
  { difficulty: "medium", question: "Which is a programming language?", answers: [
    { text: "HTML", correct: false },
    { text: "Python", correct: true },
    { text: "Photoshop", correct: false },
  ]},
  { difficulty: "hard", question: "What does CPU stand for?", answers: [
    { text: "Central Processing Unit", correct: true },
    { text: "Computer Power Utility", correct: false },
    { text: "Core Program User", correct: false },
  ]},
  { difficulty: "hard", question: "Capital of New Zealand?", answers: [
    { text: "Auckland", correct: false },
    { text: "Wellington", correct: true },
    { text: "Hamilton", correct: false },
  ]},
];

/* =========================
   🔊 STORAGE + SOUND
========================= */
const saveGame = (data) => {
  localStorage.setItem("teen_game", JSON.stringify(data));
};

const loadGame = () => {
  try {
    return JSON.parse(localStorage.getItem("teen_game")) || null;
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

/* =========================
   🎮 APP (CLEAN STRUCTURE)
========================= */
export default function App() {
  const [state, setState] = useState("menu");
  const [pool, setPool] = useState([]);
  const [current, setCurrent] = useState(null);

  const [gameData] = useState(() => loadGame() || {});

  const [score, setScore] = useState(gameData.score || 0);
  const [xp, setXp] = useState(gameData.xp || 0);
  const [combo, setCombo] = useState(gameData.combo || 0);

  const [bossHP, setBossHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);

  /* =========================
     💾 AUTO SAVE
  ========================= */
  useEffect(() => {
    saveGame({ state, score, xp, combo, bossHP, playerHP });
  }, [state, score, xp, combo, bossHP, playerHP]);

  /* =========================
     🧹 RESET SAVE
  ========================= */
  const clearSave = () => {
    localStorage.removeItem("teen_game");
    setState("menu");
    setPool([]);
    setCurrent(null);
    setScore(0);
    setXp(0);
    setCombo(0);
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
    setState("game");
  };

  /* =========================
     🎯 ANSWER SYSTEM
  ========================= */
  const answer = (correct) => {
    if (!current) return;

    if (correct) {
      playSound("correct.mp3");

      const bonus = combo >= 2 ? 10 : 0;
      const gained = getXP(current.difficulty) + bonus;

      setXp((p) => p + gained);
      setScore((p) => p + 1);
      setCombo((p) => p + 1);
    } else {
      playSound("wrong.mp3");
      setCombo(0);
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

    const dmg = combo >= 3 ? 30 : 20;

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
    setScore(0);
    setXp(0);
    setCombo(0);
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
          <h1 style={styles.title}>⚡ QUIZ BATTLE</h1>
          <p style={styles.subtitle}>Offline Mobile Game</p>

          <button style={styles.primaryBtn} onClick={startGame}>
            START GAME
          </button>
        </div>
      )}

      {/* GAME */}
      {state === "game" && current && (
        <div style={styles.center}>
          <div style={styles.hud}>
            <div>⭐ {score}</div>
            <div>🔥 {combo}</div>
            <div>⚡ {xp}</div>
          </div>

          <div style={styles.card}>
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
          <h1>👾 BOSS</h1>

          <div style={styles.bar}>
            <div style={{ ...styles.hp, width: `${bossHP}%` }} />
          </div>

          <button style={styles.primaryBtn} onClick={attackBoss}>
            ATTACK
          </button>
        </div>
      )}

      {/* WIN / LOSE */}
      {(state === "win" || state === "lose") && (
        <div style={styles.center}>
          <h1>{state === "win" ? "🏆 YOU WIN" : "💀 YOU LOSE"}</h1>
          <button style={styles.primaryBtn} onClick={restart}>
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================
   🎨 STYLES
========================= */
const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0b1020, #111827)",
    color: "white",
    fontFamily: "system-ui, Arial",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  center: {
    width: "100%",
    maxWidth: 420,
    textAlign: "center",
  },

  title: { fontSize: 28, marginBottom: 6 },
  subtitle: { opacity: 0.7, marginBottom: 20 },

  hud: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 14px",
    background: "#1f2937",
    borderRadius: 12,
    marginBottom: 15,
  },

  card: {
    background: "#1f2937",
    padding: 20,
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },

  question: {
    fontSize: 18,
    marginBottom: 16,
  },

  answerBtn: {
    display: "block",
    width: "100%",
    margin: "10px 0",
    padding: 14,
    borderRadius: 12,
    border: "none",
    fontSize: 16,
    background: "#374151",
    color: "white",
  },

  primaryBtn: {
    marginTop: 20,
    padding: 16,
    width: "100%",
    borderRadius: 14,
    border: "none",
    fontSize: 16,
    fontWeight: "bold",
    background: "#22c55e",
    color: "black",
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
  },

  bar: {
    width: "100%",
    height: 14,
    background: "#333",
    borderRadius: 10,
    overflow: "hidden",
    margin: "10px 0",
  },

  hp: {
    height: "100%",
    background: "red",
    transition: "0.3s",
  },
};