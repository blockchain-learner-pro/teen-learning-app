import Mascot from "../mascot/Mascot";

export default function Menu({ startGame }) {
  return (
    <div style={styles.wrap}>
      <Mascot mood="happy" />

      <h1 style={styles.title}>TeenBuilder</h1>

      <p style={styles.subtitle}>Welcome to your learning adventure</p>

      <button onClick={startGame} style={styles.startButton}>
        Start Game
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
    fontSize: "clamp(2rem, 8vw, 3rem)",
    margin: 0,
    fontWeight: 800,
    background: "linear-gradient(90deg, #e5e7eb, #a5b4fc)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: 16,
  },
  startButton: {
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
