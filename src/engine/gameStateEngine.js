// src/engine/gameStateEngine.js
import { saveGame, loadGame } from "../utils/storage";

const DEFAULT_STATE = {
  score: 0,
  xp: 0,
  level: 1,
  combo: 0,
  hp: 100,
  stats: {
    comprehension: 0,
    expression: 0,
    composition: 0,
  },
};

// Load any saved progress on startup, falling back to fresh defaults.
// Merge with DEFAULT_STATE so older saves don't crash on a newly added field.
const saved = loadGame();
let state = saved
  ? { ...DEFAULT_STATE, ...saved, stats: { ...DEFAULT_STATE.stats, ...(saved.stats || {}) } }
  : { ...DEFAULT_STATE };

// 🟢 get snapshot for React
export const getSnapshot = () => ({ ...state });

// 🟢 main update function (THE GAME BRAIN)
export const applyGameAction = (action) => {
  const s = { ...state, stats: { ...state.stats } };

  switch (action.type) {
    case "combat":
      s.hp = Math.max(0, s.hp - action.payload.damage);
      s.score += action.payload.damage;
      s.combo += 1;
      break;

    case "forge":
      s.xp += action.payload.xp;
      s.stats.expression += action.payload.xp;
      break;

    case "correct": {
      s.combo += 1;
      s.xp += 5;

      // Track which skill this question exercised (math -> comprehension,
      // reading -> comprehension, writing handled via "forge" above).
      const stat = action.payload?.stat;
      if (stat && stat in s.stats) {
        s.stats[stat] += 5;
      }
      break;
    }

    case "wrong":
      s.combo = 0;
      break;

    default:
      break;
  }

  // 🔥 LEVEL UP SYSTEM
  const threshold = s.level * 100;
  if (s.xp >= threshold) {
    s.level += 1;
    s.xp = 0;
  }

  state = s;
  saveGame(state);
  return getSnapshot();
};

// 🔁 Start a fresh run (keeps saved progress cleared too)
export const resetGame = () => {
  state = { ...DEFAULT_STATE, stats: { ...DEFAULT_STATE.stats } };
  saveGame(state);
  return getSnapshot();
};