import { useState, useEffect, useRef } from "react";

import { loadGame, saveGame } from "../utils/storage";
import { shuffle } from "../utils/gameMath";

import { playSound, playMusic, stopMusic } from "../utils/audio";
import { SOUNDS } from "../utils/sounds";

import { processAnswerXP } from "../engine/xpEngine";
import {
  recordPerformance,
  getPerformanceScore,
  recordLearning,
} from "../engine/performanceEngine";
import { generateQuestions } from "../utils/questionGenerator";

import GameHUD from "../components/hud/GameHUD";

const LOOT_TABLE = [
  "Arcane Tome",
  "Training Ring",
  "Lucky Pencil",
  "Rune Shield",
  "Mystic Badge",
];

const BOSS_NAMES = ["Shadow Wizard", "Dark Knight", "Void Mage", "Chaos Sprite"];
const BOSS_ICONS = ["🧙", "⚔️", "✨", "👹"];

export default function App() {
  const saved = loadGame();

  const [state, setState] = useState("menu");
  const [pool, setPool] = useState([]);
  const [current, setCurrent] = useState(null);

  const [score, setScore] = useState(saved?.score || 0);
  const [xp, setXp] = useState(saved?.xp || 0);
  const [combo, setCombo] = useState(saved?.combo || 0);

  const [stats, setStats] = useState({
    comprehension: 0,
    expression: 0,
    composition: 0,
  });

  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [shake, setShake] = useState(false);
  const [slowMotion, setSlowMotion] = useState(false);
  const [screenPulse, setScreenPulse] = useState(false);
  const [levelPulse, setLevelPulse] = useState(false);
  const [bossHp, setBossHp] = useState(1000);
  const [playerHp, setPlayerHp] = useState(100);
  const [loot, setLoot] = useState(null);
  const [combatText, setCombatText] = useState(null);
  
  const [energy, setEnergy] = useState(120);
  const [gold, setGold] = useState(320);
  const [gems, setGems] = useState(15);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [bossIndex, setBossIndex] = useState(0);

  const level = Math.floor(xp / 50) + 1;
  const xpToNextLevel = 50;
  const xpProgress = ((xp % xpToNextLevel) / xpToNextLevel) * 100;
  const bossLevel = Math.min(5, Math.floor(level / 2) + 1);
  const maxBossHp = 1000;
  const bossPhase = bossHp > 600 ? "Phase 1" : bossHp > 300 ? "Phase 2" : "Phase 3";
  const bossName = BOSS_NAMES[bossIndex % BOSS_NAMES.length];
  const bossIcon = BOSS_ICONS[bossIndex % BOSS_ICONS.length];
  const prevLevelRef = useRef(level);
  const maxQuestions = 10;

  useEffect(() => {
    saveGame({ score, xp, combo });
  }, [score, xp, combo]);

  useEffect(() => {
    if (state === "win") {
      stopMusic();
      playSound("win.mp3");
    }

    if (state === "lose") {
      stopMusic();
      playSound("lose.mp3");
    }

    if (state === "menu") {
      stopMusic();
    }
  }, [state]);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setLevelPulse(true);
      setScreenPulse(true);
      const timer = setTimeout(() => {
        setLevelPulse(false);
        setScreenPulse(false);
      }, 800);
      return () => clearTimeout(timer);
    }

    prevLevelRef.current = level;
  }, [level]);

  const startGame = () => {
    const generatedPool = Array.from({ length: 10 }, () =>
      generateQuestions(stats, combo)
    );

    const shuffled = shuffle(generatedPool);

    setPool(shuffled);
    setCurrent(shuffled[0]);
    setState("game");
    setBossHp(maxBossHp);
    setPlayerHp(100);
    setLoot(null);
    setFeedback(null);
    setShake(false);
    setSlowMotion(false);
    setCombatText(null);
    setQuestionIndex(0);
    setFeedbackMsg("");
    setBossIndex(Math.floor(Math.random() * BOSS_NAMES.length));

    playMusic("battle.mp3");
  };

  const answer = (correct) => {
    if (locked) return;

    setLocked(true);
    setFeedback(correct ? "correct" : "wrong");

    recordPerformance(correct);

    if (current?.type) {
      recordLearning(current.type, correct);
    }

    processAnswerXP({
      correct,
      streak: combo,
      current,
      setStats,
      setTotalXP: setXp,
      setStreak: setCombo,
      setBestStreak: () => {},
      setQuestionsAnswered: () => {},
    });

    if (!correct) {
      setShake(true);
      setCombatText({ text: "-15 HP", type: "player" });
      setFeedbackMsg("Try again...");
      setPlayerHp((prev) => {
        const next = Math.max(0, prev - 15);

        if (next <= 0) {
          setTimeout(() => {
            setState("lose");
            setCurrent(null);
            setPool([]);
          }, 250);
        }

        return next;
      });

      setTimeout(() => {
        setCombatText(null);
        setShake(false);
        setFeedback(null);
        setLocked(false);
        setFeedbackMsg("");
      }, 450);

      return;
    }

    setSlowMotion(true);
    setFeedbackMsg("Great job! Keep it up!");

    const skill = getPerformanceScore();
    const difficulty = skill > 80 ? 3 : skill > 60 ? 2 : 1;
    const damage = 12 + difficulty * 4 + Math.min(4, combo);
    const goldGain = 50;

    setCombatText({ text: `-${damage} HP`, type: "boss" });
    setGold((prev) => prev + goldGain);
    setEnergy((prev) => Math.max(0, prev - 10));

    setBossHp((prev) => {
      const next = Math.max(0, prev - damage);

      if (next <= 0) {
        const reward = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
        setLoot(reward);

        setTimeout(() => {
          setState("win");
          setCurrent(null);
          setPool([]);
          setScore((prevScore) => prevScore + 50 + combo * 10);
          setGems((prev) => prev + 1);
        }, 500);
      }

      return next;
    });

    const nextPool = pool.slice(1);

    if (nextPool.length > 0) {
      setPool(nextPool);
      setCurrent(nextPool[0]);
      setQuestionIndex((prev) => prev + 1);
    } else {
      const replenished = shuffle(
        Array.from({ length: 4 }, () => generateQuestions(stats, combo))
      );
      setPool(replenished);
      setCurrent(replenished[0]);
      setQuestionIndex((prev) => prev + 1);
    }

    setTimeout(() => {
      setSlowMotion(false);
      setFeedback(null);
      setLocked(false);
      setCombatText(null);
      setFeedbackMsg("");
    }, 500);
  };

  const restart = () => {
    playSound(SOUNDS.scoreup);

    setState("menu");
    setPool([]);
    setCurrent(null);
    setBossHp(maxBossHp);
    setPlayerHp(100);
    setLoot(null);
    setFeedback(null);
    setShake(false);
    setSlowMotion(false);
    setCombatText(null);
    setQuestionIndex(0);
    setFeedbackMsg("");

    setScore(0);
    setXp(0);
    setCombo(0);

    setStats({
      comprehension: 0,
      expression: 0,
      composition: 0,
    });
  };

  return (
    <div style={{...styles.appShell, transform: shake ? "translateX(-4px)" : "translateX(0)", filter: slowMotion ? "saturate(1.15)" : "none"}}>
      <style>{`
        @keyframes cardIn {
          0% { opacity: 0; transform: translateY(12px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cardShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
        }
        @keyframes screenPulse {
          0% { opacity: 0; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.04); }
          100% { opacity: 0; transform: scale(1.1); }
        }
        @keyframes levelUpPulse {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 0; transform: scale(1.2); }
        }
        @keyframes slideIn {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {state === "menu" ? (
        <div style={styles.center}>
          <h1>⚡ QUIZ BATTLE</h1>
          <p style={styles.subtitle}>Train your brain and survive the boss gauntlet.</p>
          <button style={styles.button} onClick={startGame}>
            START
          </button>
        </div>
      ) : (
        <>
          {/* Left Sidebar - Player Stats */}
          <aside style={styles.leftPanel}>
            <div style={styles.panelHeader}>PLAYER STATS</div>
            
            <div style={styles.playerCard}>
              <div style={styles.playerAvatar}>🧙</div>
              <div>
                <div style={styles.playerName}>Quiz Hero</div>
                <div style={styles.playerRank}>🏅 Bronze I</div>
              </div>
            </div>

            <div style={styles.topStatsBar}>
              <div style={styles.topStat}>
                <span>⚡</span>
                <span>{energy}/120</span>
              </div>
              <div style={styles.topStat}>
                <span>💰</span>
                <span>{gold}</span>
              </div>
              <div style={styles.topStat}>
                <span>💎</span>
                <span>{gems}</span>
              </div>
            </div>

            <div style={styles.statBox}>
              <div style={styles.levelBadge}>🏆 LVL {level}</div>
              <div style={styles.xpBar}>
                <div style={{...styles.xpFill, width: `${xpProgress}%`}} />
              </div>
              <div style={styles.xpText}>{xp}/{xpToNextLevel} XP</div>
            </div>

            <div style={styles.statRow}>
              <span>⭐ STARS</span>
              <strong>{combo}</strong>
            </div>
            <div style={styles.statRow}>
              <span>🔥 STREAK</span>
              <strong>{combo}</strong>
            </div>
            <div style={styles.statRow}>
              <span>⚡ ENERGY</span>
              <strong>{energy}/120</strong>
            </div>

            <div style={styles.resourcesLabel}>RESOURCES</div>
            <div style={styles.statRow}>
              <span>🐾 PETS</span>
              <strong>0</strong>
            </div>
            <div style={styles.statRow}>
              <span>🔧 SKILLS</span>
              <strong>0</strong>
            </div>
            <div style={styles.statRow}>
              <span>📜 QUESTS</span>
              <strong>0</strong>
            </div>
            <div style={styles.statRow}>
              <span>📦 COLLECTION</span>
              <strong>0</strong>
            </div>
          </aside>

          {/* Center - Question Card */}
          <main style={styles.centerPanel}>
            {state === "game" && current && (
              <>
                {screenPulse && <div style={styles.levelUpAnim}>LEVEL UP!</div>}
                {combatText && (
                  <div style={{...styles.combatText, color: combatText.type === "boss" ? "#fda4af" : "#fef3c7"}}>
                    {combatText.text}
                  </div>
                )}

                <div style={styles.questionHeader}>
                  QUESTION {questionIndex + 1}/{maxQuestions}
                  <div style={styles.questionProgress}/>
                </div>

                <div style={{...styles.questionCard, animation: shake ? "cardShake 0.25s ease-out" : "cardIn 0.25s ease-out", border: feedback === "correct" ? "2px solid #22c55e" : feedback === "wrong" ? "2px solid #ef4444" : "1px solid rgba(255,255,255,0.1)"}}>
                  {combo > 1 && <div style={styles.comboTag}>🔥 COMBO x{combo}</div>}
                  <h2 style={styles.question}>{current.question}</h2>

                  {current.answers?.map((a, i) => (
                    <button
                      key={i}
                      style={{...styles.answerBtn, ...(feedback === "correct" && a.correct ? {background: "#22c55e", borderColor: "#16a34a"} : feedback === "wrong" && !a.correct ? {background: "#7f1d1d", borderColor: "#dc2626"} : {})}}
                      onClick={() => answer(a.correct)}
                      disabled={locked}
                    >
                      {a.text}
                    </button>
                  ))}
                </div>

                {feedbackMsg && <div style={styles.feedbackMsg}>{feedbackMsg}</div>}
              </>
            )}

            {state === "win" && (
              <div style={styles.center}>
                <h1>🏆 YOU WIN</h1>
                <p style={styles.subtitle}>The boss has fallen.</p>
                {loot && <div style={styles.rewardCard}>Loot dropped: {loot}</div>}
                <button style={styles.button} onClick={restart}>
                  PLAY AGAIN
                </button>
              </div>
            )}

            {state === "lose" && (
              <div style={styles.center}>
                <h1>💀 YOU LOSE</h1>
                <p style={styles.subtitle}>The arena broke your streak.</p>
                <button style={styles.button} onClick={restart}>
                  TRY AGAIN
                </button>
              </div>
            )}
          </main>

          {/* Right Sidebar - Boss Panel */}
          {state === "game" && (
            <aside style={styles.rightPanel}>
              <div style={styles.bossHeader}>⚔️ BOSS FIGHT</div>

              <div style={styles.bossPortraitBox}>
                <div style={styles.bossPortrait}>{bossIcon}</div>
              </div>

              <div style={styles.bossTitle}>{bossName}</div>
              <div style={styles.bossLevel}>LVL {bossLevel}</div>

              <div style={styles.hpLabel}>❤️ HP</div>
              <div style={styles.hpBar}>
                <div style={{...styles.hpFill, width: `${(bossHp / maxBossHp) * 100}%`}} />
              </div>
              <div style={styles.hpText}>{Math.round(bossHp)} / {maxBossHp} HP</div>

              <div style={styles.rewardsBox}>
                <div style={styles.rewardsLabel}>REWARDS</div>
                <div style={styles.rewardIcons}>
                  <div style={styles.rewardItem}>⭐ 50 XP</div>
                  <div style={styles.rewardItem}>💰 120</div>
                  <div style={styles.rewardItem}>💎 1</div>
                </div>
              </div>

              <button style={styles.attackBtn} disabled={energy < 10}>
                ⚔️ ATTACK!
              </button>
              <div style={styles.energyCost}>⚡ 10 ENERGY</div>

              <div style={styles.phaseBox}>{bossPhase}</div>
            </aside>
          )}
        </>
      )}

      {levelPulse && <div style={styles.levelNotif}>🎖️ LEVEL UP! New skills unlocked!</div>}
    </div>
  );
}

const styles = {
  appShell: {
    fontFamily: "Arial",
    background: "radial-gradient(ellipse at top left, #1e3a5f 0%, #0b1020 50%, #030712 100%)",
    minHeight: "100vh",
    color: "white",
    display: "flex",
    alignItems: "stretch",
    height: "100vh",
    overflow: "hidden",
    transition: "transform 0.25s ease, filter 0.15s ease",
  },
  center: {
    width: "100%",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    color: "#cbd5e1",
    marginTop: 8,
    marginBottom: 16,
  },
  button: {
    padding: "16px 32px",
    borderRadius: 12,
    background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
    border: "none",
    fontWeight: "bold",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(34,197,94,0.3)",
    fontSize: 18,
  },
  leftPanel: {
    width: "200px",
    background: "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    padding: "16px 12px",
    overflowY: "auto",
  },
  centerPanel: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    position: "relative",
  },
  rightPanel: {
    width: "280px",
    background: "linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)",
    borderLeft: "2px solid #dc2626",
    borderRadius: "16px 0 0 16px",
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  panelHeader: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#94a3b8",
    marginBottom: 12,
  },
  bossHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fca5a5",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  playerCard: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
  },
  playerAvatar: {
    fontSize: 32,
  },
  playerName: {
    fontWeight: "bold",
    color: "#f8fafc",
  },
  playerRank: {
    fontSize: 12,
    color: "#cbd5e1",
  },
  topStatsBar: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
  },
  topStat: {
    flex: 1,
    background: "rgba(31,41,55,0.7)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "6px 8px",
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
  },
  statBox: {
    background: "rgba(31,41,55,0.85)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  levelBadge: {
    display: "inline-block",
    background: "linear-gradient(90deg, #7c3aed, #2563eb)",
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  xpBar: {
    height: 8,
    background: "#1f2937",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 6,
  },
  xpFill: {
    height: "100%",
    background: "linear-gradient(90deg, #38bdf8, #22c55e)",
    transition: "width 0.3s ease",
  },
  xpText: {
    fontSize: 11,
    color: "#cbd5e1",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    fontSize: 12,
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  resourcesLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#94a3b8",
    marginTop: 12,
    marginBottom: 8,
  },
  questionHeader: {
    position: "absolute",
    top: 20,
    left: 220,
    right: 300,
    textAlign: "center",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#cbd5e1",
  },
  questionProgress: {
    height: 2,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    marginTop: 4,
    overflow: "hidden",
  },
  questionCard: {
    background: "linear-gradient(145deg, #1f2937 0%, #111827 100%)",
    padding: 24,
    borderRadius: 24,
    width: "100%",
    maxWidth: 500,
    boxShadow: "0 24px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
  },
  comboTag: {
    color: "#fbbf24",
    marginBottom: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  question: {
    fontSize: 28,
    marginBottom: 20,
    color: "#f8fafc",
  },
  answerBtn: {
    display: "block",
    width: "100%",
    padding: "12px",
    marginBottom: 8,
    borderRadius: 12,
    background: "#475569",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
  },
  feedbackMsg: {
    position: "absolute",
    bottom: 20,
    left: 220,
    right: 300,
    textAlign: "center",
    fontSize: 12,
    color: "#a3e635",
  },
  bossPortraitBox: {
    background: "rgba(139, 92, 246, 0.1)",
    border: "2px solid #dc2626",
    borderRadius: 16,
    padding: 20,
    textAlign: "center",
  },
  bossPortrait: {
    fontSize: 56,
  },
  bossTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f1f5f9",
  },
  bossLevel: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "bold",
  },
  hpLabel: {
    fontSize: 11,
    color: "#cbd5e1",
    marginTop: 8,
  },
  hpBar: {
    height: 12,
    background: "#1f2937",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 4,
  },
  hpFill: {
    height: "100%",
    background: "linear-gradient(90deg, #f43f5e, #dc2626)",
    transition: "width 0.25s ease",
  },
  hpText: {
    fontSize: 11,
    color: "#fed7aa",
  },
  rewardsBox: {
    background: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    borderRadius: 12,
    padding: 8,
  },
  rewardsLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#86efac",
    marginBottom: 6,
  },
  rewardIcons: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
  },
  rewardItem: {
    fontSize: 11,
    color: "#bbf7d0",
  },
  attackBtn: {
    padding: "12px",
    borderRadius: 12,
    background: "linear-gradient(90deg, #dc2626 0%, #991b1b 100%)",
    border: "2px solid #ef4444",
    fontWeight: "bold",
    color: "white",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 8,
  },
  energyCost: {
    textAlign: "center",
    fontSize: 11,
    color: "#cbd5e1",
  },
  phaseBox: {
    background: "#7c3aed",
    borderRadius: 8,
    padding: "6px",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 8,
  },
  levelUpAnim: {
    position: "absolute",
    inset: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 48,
    fontWeight: "bold",
    color: "#fbbf24",
    animation: "levelUpPulse 0.8s ease-out",
    pointerEvents: "none",
  },
  combatText: {
    position: "absolute",
    top: 120,
    right: 80,
    fontWeight: "bold",
    fontSize: 24,
    animation: "slideIn 0.45s ease-out",
    pointerEvents: "none",
  },
  levelNotif: {
    position: "absolute",
    bottom: 20,
    right: 20,
    background: "linear-gradient(135deg, #fbbf24, #f97316)",
    border: "2px solid #fbbf24",
    borderRadius: 12,
    padding: "12px 16px",
    color: "#1f2937",
    fontWeight: "bold",
    animation: "slideIn 0.4s ease-out",
  },
  rewardCard: {
    margin: "12px auto",
    padding: "10px 14px",
    borderRadius: 12,
    background: "rgba(34, 197, 94, 0.2)",
    color: "#bbf7d0",
    display: "inline-block",
  },
};
