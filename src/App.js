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
   🔊 SOUND SYSTEM (FIXED)
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
  } catch (e) {}
};

/* =========================
   🎲 SHUFFLE
========================= */
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

/* =========================
   ⚡ XP SYSTEM
========================= */
const getXP = (difficulty) => {
  if (difficulty === "easy") return 10;
  if (difficulty === "medium") return 20;
  return 30;
};

/* =========================
   🎮 APP
========================= */
export default function App() {
  const [state, setState] = useState("menu");
  const [pool, setPool] = useState([]);
  const [current, setCurrent] = useState(null);
  
  const [gameData] = useState(() => loadGame() || {});

  const [score, setScore] = useState(gameData.score || 0);
  const [xp, setXp] = useState(gameData.xp || 0);
  const [combo, setCombo] = useState(gameData.combo || 0);

  // ADD TJOS HERE
  const [level, setLevel] = useState(1);
  // 2. clear save function (removes localStorage + resets app)
  const clearSave = () => {
    localStorage.removeItem("teen_game");
    restart();
  };

  const [bossHP, setBossHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);

  // ADD THIS RIGHT HERE
  useEffect(() => {
    saveGame({ score, xp, combo });
  }, [score, xp, combo]);

  /* START GAME */
  const startGame = () => {
    const shuffled = shuffle(questions);
    setPool(shuffled);
    setCurrent(shuffled[0]);
    setState("game");
  };

  /* ANSWER SYSTEM */
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

  /* BOSS FIGHT */
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

  /* RESET */
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

  return (
    <div style={styles.bg}>

      <button onClick={clearSave}>
        Reset Save
      </button>

      {/* MENU */}
      {state === "menu" && (
        <div style={styles.center}>
          <h1>⚡ QUIZ BATTLE</h1>
          <button style={styles.btn} onClick={startGame}>
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
            <h2>{current.question}</h2>

            {current.answers.map((a, i) => (
              <button
                key={i}
                style={styles.answer}
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
          <h1>👾 BOSS FIGHT</h1>

          <div style={styles.bar}>
            <div style={{ ...styles.hp, width: `${bossHP}%` }} />
          </div>

          <p>Boss HP: {bossHP}</p>
          <p>Player HP: {playerHP}</p>

          <button style={styles.btn} onClick={attackBoss}>
            ⚔️ ATTACK
          </button>
        </div>
      )}

      {/* WIN */}
      {state === "win" && (
        <div style={styles.center}>
          <h1>🏆 YOU WIN</h1>
          <button style={styles.btn} onClick={restart}>
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* LOSE */}
      {state === "lose" && (
        <div style={styles.center}>
          <h1>💀 YOU LOSE</h1>
          <button style={styles.btn} onClick={restart}>
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================
   📱 MOBILE GAME STYLES
========================= */
const styles = {
  bg: {
    fontFamily: "Arial",
    background: "#0b1020",
    minHeight: "100vh",
    color: "white",

    maxWidth: 420,
    margin: "0 auto",
    padding: 12,

    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  center: {
    width: "100%",
    textAlign: "center",
  },

  hud: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: 15,
  },

  card: {
    background: "#1f2937",
    padding: 18,
    borderRadius: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
  },

  answer: {
    display: "block",
    margin: "10px auto",
    padding: 14,
    width: "92%",
    fontSize: 16,
    background: "#374151",
    color: "white",
    border: "none",
    borderRadius: 12,
  },

  btn: {
    padding: 16,
    marginTop: 20,
    width: "90%",
    background: "#22c55e",
    border: "none",
    borderRadius: 12,
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },

  bar: {
    width: "90%",
    height: 18,
    background: "#333",
    margin: "10px auto",
    borderRadius: 10,
    overflow: "hidden",
  },

  hp: {
    height: "100%",
    background: "red",
    transition: "0.3s",
  },
};