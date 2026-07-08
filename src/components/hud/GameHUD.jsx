export default function GameHUD({ level, score, combo, xp, stats }) {
  return (
    <div style={styles.hud}>
      <div style={styles.levelBadge}>🏆 LVL {level}</div>

      <div style={styles.statRow}>
        <span>⭐ Score</span>
        <strong>{score}</strong>
      </div>
      <div style={styles.statRow}>
        <span>🔥 Combo</span>
        <strong>{combo}</strong>
      </div>
      <div style={styles.statRow}>
        <span>⚡ XP</span>
        <strong>{xp}</strong>
      </div>

      <div style={styles.skillsTitle}>Skills</div>
      <div style={styles.statRow}>
        <span>🧠 Comprehension</span>
        <strong>{stats?.comprehension || 0}</strong>
      </div>
      <div style={styles.statRow}>
        <span>✍️ Expression</span>
        <strong>{stats?.expression || 0}</strong>
      </div>
      <div style={styles.statRow}>
        <span>📖 Composition</span>
        <strong>{stats?.composition || 0}</strong>
      </div>
    </div>
  );
}

const styles = {
  hud: {
    padding: 14,
    borderRadius: 16,
    background: "rgba(17, 24, 39, 0.8)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  levelBadge: {
    background: "linear-gradient(90deg, #7c3aed, #2563eb)",
    borderRadius: 999,
    padding: "6px 10px",
    display: "inline-block",
    fontWeight: "bold",
    marginBottom: 10,
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
    color: "#e5e7eb",
  },
  skillsTitle: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "#94a3b8",
  },
};