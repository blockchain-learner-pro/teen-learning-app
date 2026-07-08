import Mascot from "./Mascot";
import "./MascotHint.css";

/**
 * Shows the mascot alongside a speech-bubble message.
 * `talking` controls the faster/glowier animation state.
 */
export default function MascotHint({ message, mood = "idle", talking = false }) {
  if (!message) return null;

  return (
    <div className="mascot-hint">
      <Mascot mood={mood} talking={talking} />
      <div className="mascot-hint__bubble">{message}</div>
    </div>
  );
}
