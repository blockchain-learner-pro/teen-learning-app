export const GAME_CONFIG = {
  xp: {
    base: {
      1: 10,
      2: 20,
      3: 30,
    },

    comboBonusAt: 3,
    comboBonus: 5,
  },

  difficulty: {
    statThresholds: {
      1: 0,
      2: 50,
      3: 120,
    },

    maxLevel: 3,
  },

  progression: {
    xpPerLevel: 50,
  },
};

/* OPTIONAL SAFE EXPORT (backwards compatibility) */
export const gameConfig = GAME_CONFIG;