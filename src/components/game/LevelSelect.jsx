import { LEVEL_CONFIG } from "../../utils/badges";

export default function LevelSelect({ progress, collection, allBadges, onSelectLevel, onBack }) {
  const isUnlocked = (lvl) => progress ? lvl <= progress.highestLevelUnlocked : lvl === 1;
  const getProgress = (lvl) => {
    const total = allBadges.filter(b => b.level === lvl).length;
    const earned = collection.filter(c => c.level === lvl).length;
    return { total, earned };
  };

  return (
    <div style={styles.center}>
      <h1>⚔️ SELECT LEVEL</h1>
      <p style={styles.subtitle}>Complete each level to unlock the next!</p>
      <div style={styles.container}>
        {[1, 2, 3].map(lvl => {
          const unlocked = isUnlocked(lvl);
          const cfg = LEVEL_CONFIG[lvl];
          const { earned, total } = getProgress(lvl);
          return (
            <button key={lvl} style={{ ...styles.card, opacity: unlocked ? 1 : 0.4, cursor: unlocked ? "pointer" : "not-allowed", borderColor: lvl === 1 ? "#cd7f32" : lvl === 2 ? "#c0c0c0" : "#ffd700" }}
  onClick={() => {
  alert('Level ' + lvl + ' clicked, unlocked=' + unlocked);
  console.log('About to call onSelectLevel:', onSelectLevel);
  console.log('Is onSelectLevel a function?', typeof onSelectLevel);
  unlocked && onSelectLevel(lvl);
}} 
disabled={!unlocked}>
  <div style={styles.num}>{lvl}</div>
  <div style={styles.name}>{cfg.name}</div>
  <div style={styles.stats}>❤️ Boss HP: {cfg.bossHp} | 📋 {cfg.questionsPerBattle} 
    Questions</div>
  <div style={styles.progress}>🏆 {earned}/{total} Badges</div>
  {!unlocked && <div style={styles.locked}>🔒 LOCKED</div>}
</button>
          );
        })}
      </div>
      <button style={{ ...styles.btn, ...styles.secondary, marginTop: 20 }} onClick={onBack}>BACK TO MENU</button>
    </div>
  );
}

const styles = {
  center: { width: "100%", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px", overflowY: "auto", maxHeight: "100vh" },
  subtitle: { color: "#cbd5e1", marginTop: 8, marginBottom: 16 },
  container: { display: "flex", flexDirection: "column", gap: 16, marginBottom: 24, width: "100%", maxWidth: 500 },
  card: { background: "linear-gradient(145deg, #1f2937 0%, #111827 100%)", border: "2px solid", borderRadius: 16, padding: 24, position: "relative", textAlign: "left", color: "white", transition: "all 0.2s ease" },
  num: { fontSize: 48, fontWeight: "bold", opacity: 0.3, position: "absolute", top: 10, right: 20 },
  name: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  stats: { fontSize: 12, color: "#94a3b8", marginBottom: 4 },
  progress: { fontSize: 12, color: "#fbbf24", fontWeight: "bold" },
  locked: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: "bold", color: "#94a3b8" },
  btn: { padding: "16px 32px", borderRadius: 12, background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)", border: "none", fontWeight: "bold", color: "white", cursor: "pointer", fontSize: 18, minWidth: 200 },
  secondary: { background: "linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)" },
};
