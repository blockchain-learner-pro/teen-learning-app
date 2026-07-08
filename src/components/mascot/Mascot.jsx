import "./Mascot.css";

/**
 * "Byte" - an original futuristic guide-bot mascot.
 * Pure SVG + CSS animation (no external images), so it stays
 * lightweight and animates smoothly.
 *
 * Props:
 * - talking: pulses the visor / bobs faster while giving a hint
 * - mood: "idle" | "thinking" | "happy" (subtle visor color shifts)
 */
export default function Mascot({ talking = false, mood = "idle" }) {
  return (
    <div className={`mascot mascot--${mood} ${talking ? "mascot--talking" : ""}`}>
      <svg
        viewBox="0 0 200 220"
        width="120"
        height="132"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Floating ring beneath the bot */}
        <ellipse
          className="mascot__shadow"
          cx="100"
          cy="205"
          rx="42"
          ry="8"
        />

        {/* Antenna */}
        <line x1="100" y1="30" x2="100" y2="10" className="mascot__antenna" />
        <circle cx="100" cy="8" r="6" className="mascot__antenna-tip" />

        {/* Head / body shell */}
        <rect
          x="45"
          y="30"
          width="110"
          height="130"
          rx="38"
          className="mascot__shell"
        />

        {/* Visor */}
        <rect
          x="62"
          y="70"
          width="76"
          height="40"
          rx="20"
          className="mascot__visor"
        />

        {/* Visor eyes */}
        <circle cx="85" cy="90" r="7" className="mascot__eye" />
        <circle cx="115" cy="90" r="7" className="mascot__eye" />

        {/* Side panel lights */}
        <circle cx="52" cy="130" r="5" className="mascot__light mascot__light--a" />
        <circle cx="148" cy="130" r="5" className="mascot__light mascot__light--b" />

        {/* Chest core */}
        <circle cx="100" cy="140" r="14" className="mascot__core" />
      </svg>
    </div>
  );
}
