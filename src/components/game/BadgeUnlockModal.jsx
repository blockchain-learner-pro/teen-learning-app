import { useEffect } from "react";
import { playSound } from "../../utils/audio";

export default function BadgeUnlockModal({ badge, onClose }) {
  useEffect(() => {
    playSound("badge-unlock.mp3");
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!badge) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>🎉 ACHIEVEMENT UNLOCKED!</h2>
        <div dangerouslySetInnerHTML={{ __html: badge.svg }} style={styles.image} />
        <h3 style={{ ...styles.name, color: badge.color }}>{badge.name}</h3>
        <p style={styles.desc}>{badge.description}</p>
        <p style={styles.motivation}>
          "Every achievement is a step toward the future you are building. Keep going!"
        </p>
        <button style={styles.button} onClick={onClose}>AWESOME!</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "linear-gradient(145deg, #1f2937 0%, #111827 100%)", border: "2px solid #fbbf24", borderRadius: 24, padding: 40, textAlign: "center", maxWidth: 400, width: "90%", animation: "badgePop 0.6s ease-out", boxShadow: "0 0 60px rgba(251,191,36,0.3)" },
  title: { fontSize: 20, color: "#fbbf24", marginBottom: 16 },
  image: { width: 200, height: 200, margin: "0 auto 16px" },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  desc: { color: "#cbd5e1", fontSize: 14, marginBottom: 12 },
  motivation: { color: "#86efac", fontSize: 13, fontStyle: "italic", marginBottom: 20 },
  button: { padding: "16px 32px", borderRadius: 12, background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)", border: "none", fontWeight: "bold", color: "white", cursor: "pointer", fontSize: 18 },
};
