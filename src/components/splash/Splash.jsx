import { useEffect, useState } from "react";
import "./Splash.css";

/**
 * Shows the app name with a short entrance animation, then calls
 * onFinish so the parent can move on to the real menu screen.
 */
export default function Splash({ onFinish, minDurationMs = 1800 }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), minDurationMs);
    const finishTimer = setTimeout(() => onFinish(), minDurationMs + 400);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(finishTimer);
    };
  }, [minDurationMs, onFinish]);

  return (
    <div className={`splash ${leaving ? "splash--leaving" : ""}`}>
      <div className="splash__glow" />

      <h1 className="splash__title">
        <span className="splash__word">Teen</span>
        <span className="splash__word splash__word--accent">Builder</span>
      </h1>

      <div className="splash__bar">
        <div className="splash__bar-fill" />
      </div>

      <button
        className="splash__skip"
        onClick={() => {
          setLeaving(true);
          setTimeout(onFinish, 400);
        }}
      >
        Skip
      </button>
    </div>
  );
}
