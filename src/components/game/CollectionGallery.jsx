export default function CollectionGallery({ collection, allBadges, onBack }) {
  const earnedIds = new Set(collection.map(c => c.badgeId));

  return (
    <div style={styles.center}>
      <h1>🏆 YOUR COLLECTION</h1>
      <p style={styles.subtitle}>Collect all 30 achievement badges across 3 levels!</p>
      <div style={styles.container}>
        {[1, 2, 3].map(lvl => {
          const levelBadges = allBadges.filter(b => b.level === lvl);
          const earned = collection.filter(c => c.level === lvl);
          return (
            <div key={lvl} style={styles.section}>
              <h3 style={{ ...styles.title, color: lvl === 1 ? "#cd7f32" : lvl === 2 ? "#c0c0c0" : "#ffd700" }}>
                {lvl === 1 ? "Apprentice" : lvl === 2 ? "Warrior" : "Champion"} — {earned.length}/{levelBadges.length} Collected
              </h3>
              <div style={styles.grid}>
                {levelBadges.map(badge => {
                  const isEarned = earnedIds.has(badge.id);
                  const eb = collection.find(c => c.badgeId === badge.id);
                  return (
                    <div key={badge.id} style={{ ...styles.card, opacity: isEarned ? 1 : 0.3, borderColor: isEarned ? badge.color : "#333" }}>
                      {isEarned && eb?.svg ? (
                        <div dangerouslySetInnerHTML={{ __html: eb.svg }} style={styles.image} />
                      ) : (
                        <div style={styles.locked}>🔒</div>
                      )}
                      <div style={{ ...styles.badgeName, color: isEarned ? badge.color : "#666" }}>{badge.name}</div>
                      <div style={styles.desc}>{badge.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <button style={{ ...styles.btn, marginTop: 20 }} onClick={onBack}>BACK TO MENU</button>
    </div>
  );
}

const styles = {
  center: { width: "100%", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px", overflowY: "auto", maxHeight: "100vh" },
  subtitle: { color: "#cbd5e1", marginTop: 8, marginBottom: 16 },
  container: { width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", gap: 32, marginBottom: 24, maxHeight: "60vh", overflowY: "auto", padding: "0 10px" },
  section: { background: "rgba(15,23,42,0.5)", borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 16, textAlign: "left" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 },
  card: { background: "linear-gradient(145deg, #1f2937 0%, #111827 100%)", border: "2px solid", borderRadius: 16, padding: 12, textAlign: "center", transition: "all 0.2s ease" },
  image: { width: 80, height: 80, margin: "0 auto 8px", animation: "float 3s ease-in-out infinite" },
  locked: { width: 80, height: 80, margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, opacity: 0.5 },
  badgeName: { fontSize: 11, fontWeight: "bold", marginBottom: 4 },
  desc: { fontSize: 10, color: "#94a3b8", lineHeight: 1.3 },
  btn: { padding: "16px 32px", borderRadius: 12, background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)", border: "none", fontWeight: "bold", color: "white", cursor: "pointer", fontSize: 18, minWidth: 200 },
};
