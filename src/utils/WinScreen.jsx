export default function WinScreen({ currentLevel, questionIndex, correctCount, combo, loot, newBadge, onNextLevel, onPlayAgain, onMenu }) {
  return (
    <div style={styles.center}>
      <h1>🏆 YOU WIN</h1>
      <p style={styles.subtitle}>The boss has fallen. Level {currentLevel} Complete!</p>
      {newBadge ? (
        <div style={styles.badgePreview}>
          <div dangerouslySetInnerHTML={{ __html: newBadge.svg }} style={{ width: 150, height: 150 }} />
          <p style={{ color: newBadge.color, fontWeight: "bold" }}>New: {newBadge.name}</p>
        </div>
      ) : (
        loot && <div style={styles.rewardCard}>Loot dropped: {loot}</div>
      )}
      <div style={styles.stats}>
        <div>📋 Questions: {questionIndex + 1}</div>
        <div>✅ Correct: {correctCount}</div>
        <div>🔥 Best Combo: {combo}</div>
        <div>⭐ Score: {50 + combo * 10}</div>
      </div>
      {currentLevel < 3 && (
        <button style={{ ...styles.btn, marginBottom: 12 }} onClick={() => onNextLevel(currentLevel + 1)}>NEXT LEVEL →</button>
      )}
      <button style={styles.btn} onClick={onPlayAgain}>PLAY AGAIN</button>
      <button style={{ ...styles.btn, ...styles.secondary, marginTop: 12 }} onClick={onMenu}>MAIN MENU</button>
    </div>
  );
}

const styles = {
  center: { width: "100%", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px" },
  subtitle: { color: "#cbd5e1", marginTop: 8, marginBottom: 16 },
  badgePreview: { margin: "16px 0", padding: 20, background: "rgba(251,191,36,0.1)", border: "2px solid #fbbf24", borderRadius: 16, animation: "badgePop 0.5s ease-out" },
  rewardCard: { margin: "12px auto", padding: "10px 14px", borderRadius: 12, background: "rgba(34, 197, 94, 0.2)", color: "#bbf7d0", display: "inline-block" },
  stats: { background: "rgba(31,41,55,0.85)", borderRadius: 12, padding: 16, margin: "16px 0", display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "#e2e8f0", minWidth: 200 },
  btn: { padding: "16px 32px", borderRadius: 12, background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)", border: "none", fontWeight: "bold", color: "white", cursor: "pointer", fontSize: 18, minWidth: 200 },
  secondary: { background: "linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)", boxShadow: "0 10px 30px rgba(124,58,237,0.3)" },
};
