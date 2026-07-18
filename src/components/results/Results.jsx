export default function Results({ score, restart }) {
  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>Run Complete</h1>

      <p style={styles.score}>
        Final Score: <strong>{score}</strong>
      </p>

      <button onClick={restart} style={styles.restartButton}>
        Play Again
      </button>
    </div>
  );
}

const styles = {
  wrap: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    minHeight: "100vh",
    justifyContent: "center",
    maxWidth: 480,
    margin: "0 auto",
  },
  title: {
    fontSize: "clamp(1.8rem, 6vw, 2.4rem)",
    margin: 0,
    fontWeight: 800,
  },
  score: {
    fontSize: 18,
    color: "#94a3b8",
    marginBottom: 16,
  },
  restartButton: {
    padding: "12px 22px",
    cursor: "pointer",
    border: "none",
    borderRadius: 999,
    fontWeight: "bold",
    color: "white",
    background: "linear-gradient(90deg, #7c3aed, #2563eb)",
    boxShadow: "0 10px 30px rgba(124, 58, 237, 0.35)",
  },
};
