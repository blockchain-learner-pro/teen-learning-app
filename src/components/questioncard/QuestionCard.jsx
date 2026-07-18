import { useState } from "react";

/**
 * Shows one question (math/reading) or a writing prompt (forge mode),
 * and reports back whether the answer was correct.
 */
export default function QuestionCard({ current, onAnswer, locked }) {
  const [forgeText, setForgeText] = useState("");

  if (!current) {
    return <div style={styles.card}>Loading question...</div>;
  }

  // Writing prompts don't have multiple-choice answers.
  if (current.type === "writing") {
    return (
      <div style={styles.card}>
        <div style={styles.prompt}>{current.prompt}</div>
        <textarea
          value={forgeText}
          onChange={(e) => setForgeText(e.target.value)}
          placeholder="Write your response..."
          rows={6}
          style={styles.textarea}
          disabled={locked}
        />
        <button
          style={styles.submitButton}
          disabled={locked || forgeText.trim().length === 0}
          onClick={() => {
            onAnswer({ correct: true, text: forgeText });
            setForgeText("");
          }}
        >
          Submit
        </button>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.prompt}>{current.question}</div>

      <div style={styles.answers}>
        {current.answers.map((a, i) => (
          <button
            key={i}
            disabled={locked}
            onClick={() => onAnswer(a)}
            style={styles.answerButton}
          >
            {a.text}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: 20,
    borderRadius: 16,
    background: "rgba(17, 24, 39, 0.8)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e5e7eb",
    maxWidth: 480,
  },
  prompt: {
    fontSize: 18,
    marginBottom: 16,
    whiteSpace: "pre-line",
  },
  answers: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  answerButton: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "#e5e7eb",
    cursor: "pointer",
    textAlign: "left",
  },
  textarea: {
    width: "100%",
    marginBottom: 10,
    borderRadius: 8,
    padding: 8,
  },
  submitButton: {
    padding: "10px 16px",
    cursor: "pointer",
  },
};
