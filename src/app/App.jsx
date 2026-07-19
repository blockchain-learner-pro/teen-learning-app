import { useState, useEffect, useRef } from "react";

import { loadGame, saveGame, saveBattleResult, getCollection, unlockBadge, loadProgress, saveProgress, resetAllProgress } from "../utils/storage";
import { shuffle } from "../utils/gameMath";
import { playSound, playMusic, stopMusic } from "../utils/audio";
import { SOUNDS } from "../utils/sounds";
import { processAnswerXP } from "../engine/xpEngine";
import { recordPerformance, getPerformanceScore, recordLearning } from "../engine/performanceEngine";
import { generateQuestions } from "../utils/questionGenerator";
import { generateAllBadges, calculateBadgeReward, generateBadgeSVG, LEVEL_CONFIG } from "../utils/badges";

import BadgeUnlockModal from "../components/game/BadgeUnlockModal";
import LevelSelect from "../components/game/LevelSelect";
import CollectionGallery from "../components/game/CollectionGallery";
import WinScreen from "../components/game/WinScreen";
import LoseScreen from "../components/game/LoseScreen";

const LOOT_TABLE = ["Arcane Tome", "Training Ring", "Lucky Pencil", "Rune Shield", "Mystic Badge"];
const BOSS_NAMES = ["Shadow Wizard", "Dark Knight", "Void Mage", "Chaos Sprite"];
const BOSS_ICONS = ["🧙", "⚔️", "✨", "👹"];

const createFallbackQuestion = () => {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const answer = a + b;
  return {
    type: "math",
    difficulty: 1,
    stat: "comprehension",
    question: `Solve: ${a} + ${b}`,
    answers: shuffle([
      { text: `${answer}`, correct: true },
      { text: `${answer + 1}`, correct: false },
      { text: `${Math.max(0, answer - 1)}`, correct: false }
    ])
  };
};

export default function App() {
  const saved = loadGame();
  const [progress, setProgress] = useState(null);
  const [collection, setCollection] = useState([]);
  const [allBadges] = useState(() => generateAllBadges());

  const [state, setState] = useState("menu");
  const [subState, setSubState] = useState(null);
  const [pool, setPool] = useState([]);
  const [current, setCurrent] = useState(null);

  const [score, setScore] = useState(saved?.score || 0);
  const [xp, setXp] = useState(saved?.xp || 0);
  const [combo, setCombo] = useState(saved?.combo || 0);

  const [stats, setStats] = useState({ comprehension: 0, expression: 0, composition: 0 });
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

  const [currentLevel, setCurrentLevel] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [battleStartTime, setBattleStartTime] = useState(null);
  const [newBadge, setNewBadge] = useState(null);

  const level = Math.floor(xp / 50) + 1;
  const xpToNextLevel = 50;
  const xpProgress = ((xp % xpToNextLevel) / xpToNextLevel) * 100;
  const bossLevel = Math.min(5, Math.floor(level / 2) + 1);
  const maxBossHp = LEVEL_CONFIG[currentLevel]?.bossHp || 1000;
  const maxQuestions = LEVEL_CONFIG[currentLevel]?.questionsPerBattle || 10;
  const bossPhase = bossHp > maxBossHp * 0.6 ? "Phase 1" : bossHp > maxBossHp * 0.3 ? "Phase 2" : "Phase 3";
  const bossName = BOSS_NAMES[bossIndex % BOSS_NAMES.length];
  const bossIcon = BOSS_ICONS[bossIndex % BOSS_ICONS.length];
  const prevLevelRef = useRef(level);

  useEffect(() => {
    loadProgress().then(setProgress);
    getCollection().then(setCollection);
  }, []);

  useEffect(() => { saveGame({ score, xp, combo }); }, [score, xp, combo]);

  useEffect(() => {
    if (state === "win") { stopMusic(); playSound("win.mp3"); }
    if (state === "lose") { stopMusic(); playSound("lose.mp3"); }
    if (state === "menu") { stopMusic(); }
  }, [state]);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setLevelPulse(true);
      setScreenPulse(true);
      const timer = setTimeout(() => { setLevelPulse(false); setScreenPulse(false); }, 800);
      return () => clearTimeout(timer);
    }
    prevLevelRef.current = level;
  }, [level]);

  const startGame = (level = 1) => {
    const levelConfig = LEVEL_CONFIG[level];
    const questionsPerBattle = levelConfig?.questionsPerBattle || 10;

    let questions = [];
    for (let i = 0; i < questionsPerBattle; i++) {
      try {
        const q = generateQuestions(stats, combo);
        if (q && q.question && q.answers && q.answers.length > 0) {
          questions.push(q);
        } else {
          questions.push(createFallbackQuestion());
        }
      } catch (err) {
        questions.push(createFallbackQuestion());
      }
    }

    const shuffled = shuffle(questions);
    setPool(shuffled);
    setCurrent(shuffled[0]);
    setState("game");
    setCurrentLevel(level);
    setBossHp(levelConfig?.bossHp || 1000);
    setPlayerHp(100);
    setLoot(null);
    setFeedback(null);
    setShake(false);
    setSlowMotion(false);
    setCombatText(null);
    setQuestionIndex(0);
    setFeedbackMsg("");
    setCorrectCount(0);
    setBattleStartTime(Date.now());
    setNewBadge(null);
    setBossIndex(Math.floor(Math.random() * BOSS_NAMES.length));
    playMusic("battle.mp3");
  };

  const handleWin = async (finalScore, finalCombo, questionsAnswered, correctAnswers) => {
    const battleResult = {
      level: currentLevel, won: true, score: finalScore, combo: finalCombo,
      questionsAnswered, correctAnswers, duration: Date.now() - battleStartTime,
    };
    await saveBattleResult(battleResult);

    const currentProgress = await loadProgress();
    const newProgress = {
      ...currentProgress,
      totalWins: (currentProgress?.totalWins || 0) + 1,
      totalQuestionsAnswered: (currentProgress?.totalQuestionsAnswered || 0) + questionsAnswered,
      totalScore: (currentProgress?.totalScore || 0) + finalScore,
      highestLevelUnlocked: Math.max(currentProgress?.highestLevelUnlocked || 1, currentLevel + 1),
    };
    await saveProgress(newProgress);
    setProgress(newProgress);

    const badgeId = calculateBadgeReward(currentLevel, questionsAnswered, correctAnswers, finalCombo, finalScore);
    const badgeData = allBadges.find(b => b.id === badgeId);
    if (badgeData) {
      const svg = generateBadgeSVG(badgeData, 200);
      const wasNew = await unlockBadge(badgeId, { ...badgeData, svg });
      if (wasNew) {
        setNewBadge({ ...badgeData, svg });
        const updatedCollection = await getCollection();
        setCollection(updatedCollection);
      }
    }

    setState("win");
    setCurrent(null);
    setPool([]);
    setScore(prev => prev + 50 + finalCombo * 10);
    setGems(prev => prev + 1);
  };

  const handleLoss = async (questionsAnswered, correctAnswers) => {
    const battleResult = {
      level: currentLevel, won: false, score: 0, combo: combo,
      questionsAnswered, correctAnswers, duration: Date.now() - battleStartTime,
    };
    await saveBattleResult(battleResult);

    const currentProgress = await loadProgress();
    const newProgress = {
      ...currentProgress,
      totalLosses: (currentProgress?.totalLosses || 0) + 1,
      totalQuestionsAnswered: (currentProgress?.totalQuestionsAnswered || 0) + questionsAnswered,
    };
    await saveProgress(newProgress);
    setProgress(newProgress);

    setState("lose");
    setCurrent(null);
    setPool([]);
  };

  const answer = (correct) => {
    if (locked) return;
    setLocked(true);
    setFeedback(correct ? "correct" : "wrong");
    recordPerformance(correct);
    if (current?.type) recordLearning(current.type, correct);

    processAnswerXP({ correct, streak: combo, current, setStats, setTotalXP: setXp, setStreak: setCombo, setBestStreak: () => {}, setQuestionsAnswered: () => {} });

    if (!correct) {
      setShake(true);
      setCombatText({ text: "-15 HP", type: "player" });
      setFeedbackMsg("Try again...");
      setPlayerHp(prev => {
        const next = Math.max(0, prev - 15);
        if (next <= 0) setTimeout(() => handleLoss(questionIndex + 1, correctCount), 250);
        return next;
      });
      setTimeout(() => { setCombatText(null); setShake(false); setFeedback(null); setLocked(false); setFeedbackMsg(""); }, 450);
      return;
    }

    setCorrectCount(prev => prev + 1);
    setSlowMotion(true);
    setFeedbackMsg("Great job! Keep it up!");
    const skill = getPerformanceScore();
    const difficulty = skill > 80 ? 3 : skill > 60 ? 2 : 1;
    const damage = 12 + difficulty * 4 + Math.min(4, combo);
    const goldGain = 50;

    setCombatText({ text: `-${damage} HP`, type: "boss" });
    setGold(prev => prev + goldGain);
    setEnergy(prev => Math.max(0, prev - 10));

    setBossHp(prev => {
      const next = Math.max(0, prev - damage);
      if (next <= 0) {
        const reward = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
        setLoot(reward);
        setTimeout(() => handleWin(50 + combo * 10, combo, questionIndex + 1, correctCount + 1), 500);
      }
      return next;
    });

    const nextIndex = questionIndex + 1;
    if (nextIndex < pool.length) {
      setCurrent(pool[nextIndex]);
      setQuestionIndex(nextIndex);
    } else {
      if (bossHp > 0) {
        setTimeout(() => handleWin(50 + combo * 10, combo, nextIndex, correctCount + 1), 500);
      }
    }

    setTimeout(() => { setSlowMotion(false); setFeedback(null); setLocked(false); setCombatText(null); setFeedbackMsg(""); }, 500);
  };

  const restart = () => {
    playSound(SOUNDS.scoreup);
    setState("menu");
    setSubState(null);
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
    setNewBadge(null);
    setScore(0);
    setXp(0);
    setCombo(0);
    setStats({ comprehension: 0, expression: 0, composition: 0 });
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure? This will erase ALL progress, badges, and battle history.")) {
      await resetAllProgress();
      setProgress(await loadProgress());
      setCollection(await getCollection());
      restart();
    }
  };

  // Responsive layout detection
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPhone = windowWidth <= 640;
  const isTablet = windowWidth <= 1024;
  const isDesktop = windowWidth > 1024;

  // Phone-optimized layout styles
  const appShellStyle = {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
    background: "radial-gradient(ellipse at top left, #1e3a5f 0%, #0b1020 50%, #030712 100%)",
    minHeight: "100vh",
    minHeight: "-webkit-fill-available", // Fix for iOS viewport height
    color: "white",
    display: "flex",
    flexDirection: isPhone ? "column" : "row",
    alignItems: "stretch",
    height: isPhone ? "auto" : "100vh",
    overflow: isPhone ? "auto" : "hidden",
    transition: "transform 0.25s ease, filter 0.15s ease",
    position: "relative",
    paddingTop: isPhone ? "env(safe-area-inset-top)" : 0,
    paddingBottom: isPhone ? "env(safe-area-inset-bottom)" : 0,
    paddingLeft: isPhone ? "env(safe-area-inset-left)" : 0,
    paddingRight: isPhone ? "env(safe-area-inset-right)" : 0,
  };

  const leftPanelStyle = {
    width: isPhone ? "100%" : isTablet ? "180px" : "200px",
    background: "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
    borderRight: isPhone ? "none" : "1px solid rgba(255,255,255,0.08)",
    borderBottom: isPhone ? "1px solid rgba(255,255,255,0.08)" : "none",
    padding: isPhone ? "12px 16px" : "16px 12px",
    overflowY: "auto",
    order: isPhone ? 2 : 0,
    flexShrink: 0,
    display: isPhone ? "none" : "block", // Hide left panel on phone, show compact stats instead
  };

  const centerPanelStyle = {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: isPhone ? "12px" : isTablet ? "16px" : "20px",
    position: "relative",
    minWidth: 0,
    order: isPhone ? 0 : 1,
    flexDirection: "column",
    gap: isPhone ? 12 : 16,
  };

  const rightPanelStyle = {
    width: isPhone ? "100%" : isTablet ? "260px" : "280px",
    background: "linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)",
    borderLeft: isPhone ? "none" : "2px solid #dc2626",
    borderTop: isPhone ? "2px solid #dc2626" : "none",
    borderRadius: isPhone ? 0 : "16px 0 0 16px",
    padding: isPhone ? "16px" : "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: isPhone ? 8 : 12,
    order: isPhone ? 1 : 2,
    flexShrink: 0,
  };

  const questionCardStyle = {
    background: "linear-gradient(145deg, #1f2937 0%, #111827 100%)",
    padding: isPhone ? 20 : 24,
    borderRadius: isPhone ? 16 : 24,
    width: "100%",
    maxWidth: isPhone ? "100%" : 500,
    boxShadow: "0 24px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
    margin: "0 auto",
  };

  const questionHeaderStyle = {
    textAlign: "center",
    fontSize: isPhone ? 11 : 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#cbd5e1",
    marginBottom: 12,
    width: "100%",
  };

  const feedbackMsgStyle = {
    textAlign: "center",
    fontSize: isPhone ? 14 : 12,
    color: "#a3e635",
    marginTop: 12,
    width: "100%",
    fontWeight: "bold",
  };

  // Phone compact stats bar (replaces left panel on phones)
  const phoneStatsBarStyle = {
    display: isPhone ? "flex" : "none",
    gap: 8,
    padding: "8px 12px",
    background: "rgba(17,24,39,0.95)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    position: "sticky",
    top: 0,
    zIndex: 10,
  };

  const phoneStatItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    whiteSpace: "nowrap",
    background: "rgba(31,41,55,0.7)",
    borderRadius: 8,
    padding: "4px 8px",
  };

  return (
    <div style={{...appShellStyle, transform: shake ? "translateX(-4px)" : "translateX(0)", filter: slowMotion ? "saturate(1.15)" : "none"}}>
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
        @keyframes badgePop { 
          0% { opacity: 0; transform: scale(0.5) rotate(-10deg); } 
          60% { opacity: 1; transform: scale(1.1) rotate(2deg); } 
          100% { opacity: 1; transform: scale(1) rotate(0deg); } 
        }
        @keyframes float { 
          0%, 100% { transform: translateY(0); } 
          50% { transform: translateY(-10px); } 
        }
        /* Prevent elastic scrolling on iOS */
        body {
          overscroll-behavior-y: none;
          -webkit-tap-highlight-color: transparent;
        }
        /* Prevent text selection on game elements */
        button, .no-select {
          -webkit-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      <meta name="theme-color" content="#0b1020" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {newBadge && <BadgeUnlockModal badge={newBadge} onClose={() => setNewBadge(null)} />}

      {state === "menu" && subState === null && (
        <div style={styles.center}>
          <h1 style={{fontSize: isPhone ? 32 : 48}}>⚡ QUIZ BATTLE</h1>
          <p style={{...styles.subtitle, fontSize: isPhone ? 16 : 18}}>Train your brain and survive the boss gauntlet.</p>
          {progress && (
            <div style={styles.progressSummary}>
              <div style={{...styles.progressStat, fontSize: isPhone ? 12 : 14}}>🏆 Level {progress.highestLevelUnlocked} Unlocked</div>
              <div style={{...styles.progressStat, fontSize: isPhone ? 12 : 14}}>✅ {progress.totalWins} Wins</div>
              <div style={{...styles.progressStat, fontSize: isPhone ? 12 : 14}}>📦 {collection.length}/30 Badges</div>
            </div>
          )}
          <button style={{...styles.button, marginBottom: 12, padding: isPhone ? "18px 32px" : "16px 32px", fontSize: isPhone ? 20 : 18, minHeight: 48}} onClick={() => setSubState("levels")}>PLAY</button>
          <button style={{...styles.button, ...styles.secondaryButton, marginBottom: 12, padding: isPhone ? "18px 32px" : "16px 32px", fontSize: isPhone ? 20 : 18, minHeight: 48}} onClick={() => setSubState("collection")}>🏆 COLLECTION</button>
          <button style={{...styles.button, ...styles.tertiaryButton, padding: isPhone ? "14px 24px" : "12px 24px", fontSize: isPhone ? 16 : 14, minHeight: 44}} onClick={handleReset}>RESET PROGRESS</button>
        </div>
      )}

      {state === "menu" && subState === "collection" && (
        <CollectionGallery collection={collection} allBadges={allBadges} onBack={() => setSubState(null)} />
      )}

      {state === "menu" && subState === "levels" && (
        <LevelSelect progress={progress} collection={collection} allBadges={allBadges} onSelectLevel={startGame} onBack={() => setSubState(null)} />
      )}

      {state !== "menu" && (
        <>
          {/* Phone compact stats bar */}
          <div style={phoneStatsBarStyle}>
            <div style={phoneStatItemStyle}>⚡ {energy}</div>
            <div style={phoneStatItemStyle}>💰 {gold}</div>
            <div style={phoneStatItemStyle}>💎 {gems}</div>
            <div style={phoneStatItemStyle}>🏆 LVL {level}</div>
            <div style={phoneStatItemStyle}>⭐ {combo}</div>
            <div style={phoneStatItemStyle}>❤️ {playerHp}</div>
          </div>

          <aside style={leftPanelStyle}>
            <div style={styles.panelHeader}>PLAYER STATS</div>
            <div style={styles.playerCard}>
              <div style={styles.playerAvatar}>🧙</div>
              <div>
                <div style={styles.playerName}>Quiz Hero</div>
                <div style={styles.playerRank}>🏅 {LEVEL_CONFIG[currentLevel]?.name || 'Apprentice'}</div>
              </div>
            </div>
            <div style={styles.topStatsBar}>
              <div style={styles.topStat}><span>⚡</span><span>{energy}/120</span></div>
              <div style={styles.topStat}><span>💰</span><span>{gold}</span></div>
              <div style={styles.topStat}><span>💎</span><span>{gems}</span></div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.levelBadge}>🏆 LVL {level}</div>
              <div style={styles.xpBar}><div style={{...styles.xpFill, width: `${xpProgress}%`}} /></div>
              <div style={styles.xpText}>{xp}/{xpToNextLevel} XP</div>
            </div>
            <div style={styles.statRow}><span>⭐ STARS</span><strong>{combo}</strong></div>
            <div style={styles.statRow}><span>🔥 STREAK</span><strong>{combo}</strong></div>
            <div style={styles.statRow}><span>⚡ ENERGY</span><strong>{energy}/120</strong></div>
            <div style={styles.resourcesLabel}>RESOURCES</div>
            <div style={styles.statRow}><span>🐾 PETS</span><strong>0</strong></div>
            <div style={styles.statRow}><span>🔧 SKILLS</span><strong>0</strong></div>
            <div style={styles.statRow}><span>📜 QUESTS</span><strong>0</strong></div>
            <div style={styles.statRow}><span>📦 COLLECTION</span><strong>{collection.length}</strong></div>
          </aside>

          <main style={centerPanelStyle}>
            {state === "game" && current && (
              <>
                {screenPulse && <div style={styles.levelUpAnim}>LEVEL UP!</div>}
                {combatText && <div style={{...styles.combatText, color: combatText.type === "boss" ? "#fda4af" : "#fef3c7"}}>{combatText.text}</div>}
                <div style={questionHeaderStyle}>
                  QUESTION {questionIndex + 1}/{maxQuestions} — Level {currentLevel}: {LEVEL_CONFIG[currentLevel]?.name}
                  <div style={styles.questionProgress}><div style={{...styles.questionProgressFill, width: `${((questionIndex + 1) / maxQuestions) * 100}%`}} /></div>
                </div>
                <div style={{...questionCardStyle, animation: shake ? "cardShake 0.25s ease-out" : "cardIn 0.25s ease-out", border: feedback === "correct" ? "2px solid #22c55e" : feedback === "wrong" ? "2px solid #ef4444" : "1px solid rgba(255,255,255,0.1)"}}>
                  {combo > 1 && <div style={{...styles.comboTag, fontSize: isPhone ? 16 : 14}}>🔥 COMBO x{combo}</div>}
                  <h2 style={{...styles.question, fontSize: isPhone ? 22 : 28, lineHeight: 1.4}}>{current.question}</h2>
                  {current.answers?.map((a, i) => (
                    <button key={i} style={{
                      ...styles.answerBtn, 
                      padding: isPhone ? "18px 16px" : "14px 12px", 
                      fontSize: isPhone ? 18 : 16,
                      minHeight: isPhone ? 56 : 48,
                      marginBottom: isPhone ? 12 : 8,
                      background: feedback === "correct" && a.correct ? "#22c55e" : feedback === "wrong" && !a.correct ? "#7f1d1d" : "#475569"
                    }} onClick={() => answer(a.correct)} disabled={locked}>{a.text}</button>
                  ))}
                </div>
                {feedbackMsg && <div style={feedbackMsgStyle}>{feedbackMsg}</div>}
              </>
            )}

            {state === "win" && (
              <WinScreen currentLevel={currentLevel} questionIndex={questionIndex} correctCount={correctCount} combo={combo} loot={loot} newBadge={newBadge} onNextLevel={startGame} onPlayAgain={() => startGame(currentLevel)} onMenu={restart} />
            )}

            {state === "lose" && (
              <LoseScreen currentLevel={currentLevel} questionIndex={questionIndex} correctCount={correctCount} combo={combo} onRetry={startGame} onMenu={restart} />
            )}
          </main>

          {state === "game" && (
            <aside style={rightPanelStyle}>
              <div style={{...styles.bossHeader, fontSize: isPhone ? 14 : 16}}>⚔️ BOSS FIGHT</div>
              <div style={{...styles.bossPortraitBox, padding: isPhone ? 12 : 20}}><div style={{...styles.bossPortrait, fontSize: isPhone ? 40 : 56}}>{bossIcon}</div></div>
              <div style={{...styles.bossTitle, fontSize: isPhone ? 16 : 18}}>{bossName}</div>
              <div style={styles.bossLevel}>LVL {bossLevel}</div>
              <div style={styles.hpLabel}>❤️ HP</div>
              <div style={styles.hpBar}><div style={{...styles.hpFill, width: `${(bossHp / maxBossHp) * 100}%`}} /></div>
              <div style={styles.hpText}>{Math.round(bossHp)} / {maxBossHp} HP</div>
              <div style={styles.rewardsBox}>
                <div style={styles.rewardsLabel}>REWARDS</div>
                <div style={styles.rewardIcons}>
                  <div style={{...styles.rewardItem, fontSize: isPhone ? 10 : 11}}>⭐ 50 XP</div>
                  <div style={{...styles.rewardItem, fontSize: isPhone ? 10 : 11}}>💰 120</div>
                  <div style={{...styles.rewardItem, fontSize: isPhone ? 10 : 11}}>💎 1</div>
                  <div style={{...styles.rewardItem, fontSize: isPhone ? 10 : 11}}>🏆 Badge</div>
                </div>
              </div>
              <button style={{...styles.attackBtn, padding: isPhone ? "14px" : "12px", fontSize: isPhone ? 16 : 14, minHeight: 48}} disabled={energy < 10}>⚔️ ATTACK!</button>
              <div style={styles.energyCost}>⚡ 10 ENERGY</div>
              <div style={{...styles.phaseBox, fontSize: isPhone ? 11 : 12}}>{bossPhase}</div>
            </aside>
          )}
        </>
      )}

      {levelPulse && <div style={styles.levelNotif}>🎖️ LEVEL UP! New skills unlocked!</div>}
    </div>
  );
}

const styles = {
  center: { width: "100%", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px", overflowY: "auto", maxHeight: "100vh" },
  subtitle: { color: "#cbd5e1", marginTop: 8, marginBottom: 16 },
  button: { padding: "16px 32px", borderRadius: 12, background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)", border: "none", fontWeight: "bold", color: "white", cursor: "pointer", boxShadow: "0 10px 30px rgba(34,197,94,0.3)", fontSize: 18, minWidth: 200, touchAction: "manipulation" },
  secondaryButton: { background: "linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)", boxShadow: "0 10px 30px rgba(124,58,237,0.3)" },
  tertiaryButton: { background: "linear-gradient(90deg, #475569 0%, #334155 100%)", boxShadow: "0 10px 30px rgba(71,85,105,0.3)", fontSize: 14, padding: "12px 24px" },
  progressSummary: { display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" },
  progressStat: { background: "rgba(31,41,55,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "8px 16px", fontSize: 14, color: "#fbbf24", fontWeight: "bold" },
  panelHeader: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#94a3b8", marginBottom: 12 },
  playerCard: { display: "flex", gap: 8, marginBottom: 12 },
  playerAvatar: { fontSize: 32 },
  playerName: { fontWeight: "bold", color: "#f8fafc" },
  playerRank: { fontSize: 12, color: "#cbd5e1" },
  topStatsBar: { display: "flex", gap: 8, marginBottom: 12 },
  topStat: { flex: 1, background: "rgba(31,41,55,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", gap: 4, fontSize: 12 },
  statBox: { background: "rgba(31,41,55,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12, marginBottom: 12 },
  levelBadge: { display: "inline-block", background: "linear-gradient(90deg, #7c3aed, #2563eb)", borderRadius: 999, padding: "4px 8px", fontSize: 12, fontWeight: "bold", marginBottom: 8 },
  xpBar: { height: 8, background: "#1f2937", borderRadius: 999, overflow: "hidden", marginBottom: 6 },
  xpFill: { height: "100%", background: "linear-gradient(90deg, #38bdf8, #22c55e)", transition: "width 0.3s ease" },
  xpText: { fontSize: 11, color: "#cbd5e1" },
  statRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12, borderBottom: "1px solid rgba(255,255,255,0.04)" },
  resourcesLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: "#94a3b8", marginTop: 12, marginBottom: 8 },
  questionProgress: { height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 999, marginTop: 6, overflow: "hidden" },
  questionProgressFill: { height: "100%", background: "linear-gradient(90deg, #22c55e, #38bdf8)", transition: "width 0.3s ease" },
  comboTag: { color: "#fbbf24", marginBottom: 12, fontWeight: "bold", textAlign: "center" },
  question: { fontSize: 28, marginBottom: 20, color: "#f8fafc", lineHeight: 1.3 },
  answerBtn: { display: "block", width: "100%", padding: "14px 12px", marginBottom: 8, borderRadius: 12, background: "#475569", border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: "pointer", transition: "all 0.2s ease", textAlign: "left", fontSize: 16, minHeight: 48, touchAction: "manipulation" },
  bossHeader: { fontSize: 16, fontWeight: "bold", color: "#fca5a5", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  bossPortraitBox: { background: "rgba(139, 92, 246, 0.1)", border: "2px solid #dc2626", borderRadius: 16, padding: 20, textAlign: "center" },
  bossPortrait: { fontSize: 56 },
  bossTitle: { fontSize: 18, fontWeight: "bold", color: "#f1f5f9" },
  bossLevel: { fontSize: 12, color: "#dc2626", fontWeight: "bold" },
  hpLabel: { fontSize: 11, color: "#cbd5e1", marginTop: 8 },
  hpBar: { height: 12, background: "#1f2937", borderRadius: 999, overflow: "hidden", marginBottom: 4 },
  hpFill: { height: "100%", background: "linear-gradient(90deg, #f43f5e, #dc2626)", transition: "width 0.25s ease" },
  hpText: { fontSize: 11, color: "#fed7aa" },
  rewardsBox: { background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: 12, padding: 8 },
  rewardsLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#86efac", marginBottom: 6 },
  rewardIcons: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" },
  rewardItem: { fontSize: 11, color: "#bbf7d0" },
  attackBtn: { padding: "12px", borderRadius: 12, background: "linear-gradient(90deg, #dc2626 0%, #991b1b 100%)", border: "2px solid #ef4444", fontWeight: "bold", color: "white", cursor: "pointer", textTransform: "uppercase", letterSpacing: 1, marginTop: 8, touchAction: "manipulation" },
  energyCost: { textAlign: "center", fontSize: 11, color: "#cbd5e1" },
  phaseBox: { background: "#7c3aed", borderRadius: 8, padding: "6px", textAlign: "center", fontSize: 12, fontWeight: "bold", marginTop: 8 },
  levelUpAnim: { position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", fontSize: 48, fontWeight: "bold", color: "#fbbf24", animation: "levelUpPulse 0.8s ease-out", pointerEvents: "none" },
  combatText: { position: "absolute", top: 120, right: 80, fontWeight: "bold", fontSize: 24, animation: "slideIn 0.45s ease-out", pointerEvents: "none" },
  levelNotif: { position: "absolute", bottom: 20, right: 20, background: "linear-gradient(135deg, #fbbf24, #f97316)", border: "2px solid #fbbf24", borderRadius: 12, padding: "12px 16px", color: "#1f2937", fontWeight: "bold", animation: "slideIn 0.4s ease-out" },
};
