export default function LoseScreen({ currentLevel, questionIndex, correctCount, combo, onRetry, onMenu }) {
  return (
    <div style={styles.center}>
      <h1>💀 YOU LOSE</h1>
      <p style={styles.subtitle}>The arena broke your streak.</p>
      <div style={styles.stats}>
        <div>📋 Questions: {questionIndex + 1}</div>
        <div>✅ Correct: {correctCount}</div>
        <div>🔥 Best Combo: {combo}</div>
      </div>
      <button style={styles.btn} onClick={() => onRetry(currentLevel)}>TRY AGAIN</button>
      <button style={{ ...styles.btn, ...styles.secondary, marginTop: 12 }} onClick={onMenu}>MAIN MENU</button>
    </div>
  );
}

const styles = {
  center: { width: "100%", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px" },
  subtitle: { color: "#cbd5e1", marginTop: 8, marginBottom: 16 },
  stats: { background: "rgba(31,41,55,0.85)", borderRadius: 12, padding: 16, margin: "16px 0", display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "#e2e8f0", minWidth: 200 },
  btn: { padding: "16px 32px", borderRadius: 12, background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)", border: "none", fontWeight: "bold", color: "white", cursor: "pointer", fontSize: 18, minWidth: 200 },
  secondary: { background: "linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)", boxShadow: "0 10px 30px rgba(124,58,237,0.3)" },
};
