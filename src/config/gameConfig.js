export const GAME_CONFIG = {
  levels: [
    { name: 'Apprentice', bossHp: 1000, questionsPerBattle: 10 },
    { name: 'Warrior', bossHp: 2000, questionsPerBattle: 15 },
    { name: 'Champion', bossHp: 3500, questionsPerBattle: 20 },
  ],
  maxEnergy: 120,
  startingGold: 320,
  startingGems: 15,
  xpPerLevel: 50,
  comboMultiplier: 10,
  baseDamage: 12,
  damagePerDifficulty: 4,
  maxComboBonus: 4,
  difficulty: {
    maxLevel: 3
  },
  xp: {
    base: { 1: 10, 2: 15, 3: 20 },
    comboBonusAt: 5,
    comboBonus: 5
  },
  progression: {
    xpPerLevel: 50
  }
};
