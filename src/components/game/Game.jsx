import { useState, useEffect, useCallback } from "react";

import QuestionCard from "../questioncard/QuestionCard";

import { applyCombatTurn } from "../../engine/combatEngine";
import { applyGameAction, getSnapshot } from "../../engine/gameStateEngine";
import {
  recordPerformance,
  recordLearning,
} from "../../engine/performanceEngine";
import { submitForgeFlow } from "../../engine/forgeEngine";

import { getHint, getEncouragement } from "../../engine/hintEngine";
import MascotHint from "../mascot/MascotHint";

import { generateQuestions, loadQuestionBank } from "../../utils/questionGenerator";
import { playSound } from "../../utils/audio";
import { SOUNDS } from "../../utils/sounds";

const QUESTIONS_PER_RUN = 10;
const BOSS_HP = 100;

export default function Game({ setGameState, endGame }) {
  const [current, setCurrent] = useState(null);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [bossHP, setBossHP] = useState(BOSS_HP);
  const [mascotMessage, setMascotMessage] = useState(null);
  const [mascotTalking, setMascotTalking] = useState(false);

  const drawNextQuestion = useCallback(() => {
    const snapshot = getSnapshot();
    const question = generateQuestions(snapshot.stats, snapshot.combo);
    setCurrent(question);
    setMascotMessage(null);
    setMascotTalking(false);
  }, []);

  // Load the editable question bank (public/questions.json), then
  // draw the first question once it's ready (falls back to built-in
  // defaults automatically if the file is missing or invalid).
  useEffect(() => {
    let cancelled = false;

    loadQuestionBank().then(() => {
      if (!cancelled) drawNextQuestion();
    });

    return () => {
      cancelled = true;
    };
  }, [drawNextQuestion]);

  const finishRun = useCallback(() => {
    playSound(SOUNDS.completion);
    endGame();
  }, [endGame]);

  const handleWritingSubmit = (answer) => {
    const result = submitForgeFlow({
      forgeContent: answer.text,
      currentPrompt: current,
    });

    if (!result.success) {
      return;
    }

    const updated = applyGameAction({
      type: "forge",
      payload: { xp: result.xp },
    });
    setGameState(updated);

    setFeedback({ correct: true, message: `+${result.xp} XP for your writing!` });
    advance();
  };

  const advance = () => {
    setLocked(true);

    setTimeout(() => {
      setFeedback(null);
      setLocked(false);

      const answeredSoFar = questionsAnswered + 1;
      setQuestionsAnswered(answeredSoFar);

      if (answeredSoFar >= QUESTIONS_PER_RUN || bossHP <= 0) {
        finishRun();
        return;
      }

      drawNextQuestion();
    }, 900);
  };

  const handleAnswer = (answer) => {
    if (locked) return;

    if (current.type === "writing") {
      handleWritingSubmit(answer);
      return;
    }

    const correct = !!answer.correct;

    recordPerformance(correct);
    recordLearning(current.type, correct);

    if (correct) {
      playSound(SOUNDS.correct);

      const combat = applyCombatTurn({ attack: 10 }, { defense: 3, hp: bossHP });
      const newBossHP = Math.max(0, combat.enemy.hp);
      setBossHP(newBossHP);

      const updated = applyGameAction({
        type: "correct",
        payload: { stat: current.stat },
      });
      setGameState(updated);

      setFeedback({
        correct: true,
        message: combat.crit ? "Critical hit! 🔥" : "Correct!",
      });

      if (newBossHP <= 0) {
        playSound(SOUNDS.boss);
      }
    } else {
      playSound(SOUNDS.lose);

      const updated = applyGameAction({ type: "wrong", payload: {} });
      setGameState(updated);

      setFeedback({ correct: false, message: "Not quite - streak reset." });
      setMascotMessage(getEncouragement());
      setMascotTalking(true);
    }

    advance();
  };

  const handleHintClick = () => {
    setMascotMessage(getHint(current));
    setMascotTalking(true);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.progress}>
        Question {Math.min(questionsAnswered + 1, QUESTIONS_PER_RUN)} / {QUESTIONS_PER_RUN}
        &nbsp;·&nbsp; Boss HP: {bossHP}
      </div>

      <QuestionCard current={current} onAnswer={handleAnswer} locked={locked} />

      {feedback && (
        <div style={feedback.correct ? styles.feedbackGood : styles.feedbackBad}>
          {feedback.message}
        </div>
      )}

      {mascotMessage && (
        <MascotHint
          message={mascotMessage}
          mood={feedback && !feedback.correct ? "idle" : "thinking"}
          talking={mascotTalking}
        />
      )}

      <div style={styles.buttonRow}>
        <button
          style={styles.hintButton}
          onClick={handleHintClick}
          disabled={locked || !current}
        >
          💡 Hint
        </button>

        <button style={styles.quitButton} onClick={finishRun}>
          Quit
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    padding: 20,
    color: "white",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxWidth: 520,
  },
  progress: {
    fontSize: 14,
    color: "#94a3b8",
  },
  feedbackGood: {
    color: "#4ade80",
    fontWeight: "bold",
  },
  feedbackBad: {
    color: "#f87171",
    fontWeight: "bold",
  },
  quitButton: {
    alignSelf: "flex-start",
    padding: "8px 14px",
    cursor: "pointer",
  },
  buttonRow: {
    display: "flex",
    gap: 10,
  },
  hintButton: {
    padding: "8px 14px",
    cursor: "pointer",
    borderRadius: 999,
    border: "1px solid rgba(250, 204, 21, 0.4)",
    background: "rgba(250, 204, 21, 0.1)",
    color: "#facc15",
    fontWeight: "bold",
  },
};
