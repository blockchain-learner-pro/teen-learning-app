export const BADGE_TIERS = {
  1: { name: 'Bronze', color: '#cd7f32', glow: '#d4a574' },
  2: { name: 'Silver', color: '#c0c0c0', glow: '#e8e8e8' },
  3: { name: 'Gold', color: '#ffd700', glow: '#ffec8b' },
  4: { name: 'Platinum', color: '#e5e4e2', glow: '#f5f5f5' },
  5: { name: 'Diamond', color: '#b9f2ff', glow: '#e0ffff' },
  6: { name: 'Ruby', color: '#e0115f', glow: '#ff6b9d' },
  7: { name: 'Emerald', color: '#50c878', glow: '#90ee90' },
  8: { name: 'Sapphire', color: '#0f52ba', glow: '#87ceeb' },
  9: { name: 'Amethyst', color: '#9966cc', glow: '#d8b4fe' },
  10: { name: 'Obsidian', color: '#1a1a2e', glow: '#4a4a6a' },
};

export const LEVEL_NAMES = { 1: 'Apprentice', 2: 'Warrior', 3: 'Champion' };

export const LEVEL_CONFIG = {
  1: { name: 'Apprentice', bossHp: 1000, questionsPerBattle: 10, unlockRequirement: 0 },
  2: { name: 'Warrior', bossHp: 2000, questionsPerBattle: 15, unlockRequirement: 1 },
  3: { name: 'Champion', bossHp: 3500, questionsPerBattle: 20, unlockRequirement: 2 },
};

export function generateAllBadges() {
  const badges = [];
  for (let level = 1; level <= 3; level++) {
    for (let tier = 1; tier <= 10; tier++) {
      const t = BADGE_TIERS[tier];
      badges.push({
        id: `level-${level}-tier-${tier}`, level, tier,
        name: `${t.name} ${LEVEL_NAMES[level]}`,
        description: getBadgeDescription(level, tier),
        color: t.color, glow: t.glow,
        iconType: getIconType(tier),
      });
    }
  }
  return badges;
}

function getBadgeDescription(level, tier) {
  const d = {
    1: ['First steps into knowledge.','Curiosity is your compass.','Learning to stand tall.','The spark of understanding.','Building your foundation.','Growing stronger every day.','Challenges make you sharper.','You are becoming unstoppable.','Mastery is within reach.','True Apprentice of wisdom.'],
    2: ['The warrior awakens.','Courage fuels your mind.','Battles forge your strength.','You fight for knowledge.','Resilience is your armor.','Victory follows discipline.','Legends begin with effort.','Your potential shines bright.','Almost at the peak.','Warrior of the mind.'],
    3: ['The champion rises.','Excellence is your standard.','You inspire others to learn.','Greatness is a habit.','The summit is near.','Unstoppable force of will.','Knowledge bends to you.','A legend in the making.','Transcending all limits.','Ultimate Champion achieved!'],
  };
  return d[level][tier - 1];
}

function getIconType(tier) {
  return ['star','shield','crown','gem','flame','bolt','heart','eye','wing','crystal'][tier - 1];
}

export function generateBadgeSVG(badge, size = 120) {
  const { color, glow, iconType, name } = badge;
  const paths = {
    star: `<polygon points="60,15 72,45 105,45 78,65 88,95 60,75 32,95 42,65 15,45 48,45" fill="${color}" stroke="${glow}" stroke-width="2"/>`,
    shield: `<path d="M60 15 L90 25 L90 55 Q90 85 60 100 Q30 85 30 55 L30 25 Z" fill="${color}" stroke="${glow}" stroke-width="2"/>`,
    crown: `<path d="M20 70 L20 40 L35 55 L60 20 L85 55 L100 40 L100 70 Q100 80 60 85 Q20 80 20 70Z" fill="${color}" stroke="${glow}" stroke-width="2"/>`,
    gem: `<polygon points="60,10 95,35 95,75 60,100 25,75 25,35" fill="${color}" stroke="${glow}" stroke-width="2"/>`,
    flame: `<path d="M60 95 Q40 85 40 60 Q40 40 60 15 Q80 40 80 60 Q80 85 60 95Z" fill="${color}" stroke="${glow}" stroke-width="2"/>`,
    bolt: `<polygon points="55,10 75,10 65,45 90,45 50,95 60,55 35,55" fill="${color}" stroke="${glow}" stroke-width="2"/>`,
    heart: `<path d="M60 85 Q30 60 30 40 Q30 25 45 25 Q55 25 60 35 Q65 25 75 25 Q90 25 90 40 Q90 60 60 85Z" fill="${color}" stroke="${glow}" stroke-width="2"/>`,
    eye: `<ellipse cx="60" cy="55" rx="35" ry="25" fill="${color}" stroke="${glow}" stroke-width="2"/>`,
    wing: `<path d="M60 55 Q30 20 15 30 Q25 45 60 55 Q95 45 105 30 Q90 20 60 55Z" fill="${color}" stroke="${glow}" stroke-width="2"/>`,
    crystal: `<polygon points="60,5 90,30 90,70 60,95 30,70 30,30" fill="${color}" stroke="${glow}" stroke-width="2"/>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 120 120">
    <defs>
      <filter id="glow-${badge.id}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <linearGradient id="bg-${badge.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="55" fill="url(#bg-${badge.id})" stroke="${color}" stroke-width="3" filter="url(#glow-${badge.id})"/>
    <circle cx="60" cy="60" r="48" fill="none" stroke="${glow}" stroke-width="1" opacity="0.3"/>
    ${paths[iconType] || paths.star}
    <text x="60" y="112" text-anchor="middle" fill="${glow}" font-size="8" font-family="Arial" font-weight="bold">${name.toUpperCase()}</text>
  </svg>`;
}

export function calculateBadgeReward(level, questionsAnswered, correctAnswers, combo, score) {
  const accuracy = questionsAnswered > 0 ? correctAnswers / questionsAnswered : 0;
  const ps = (accuracy * 50) + (combo * 2) + (score / 10);
  let tier = 1;
  if (ps >= 90) tier = 10;
  else if (ps >= 80) tier = 9;
  else if (ps >= 70) tier = 8;
  else if (ps >= 60) tier = 7;
  else if (ps >= 50) tier = 6;
  else if (ps >= 40) tier = 5;
  else if (ps >= 30) tier = 4;
  else if (ps >= 20) tier = 3;
  else if (ps >= 10) tier = 2;
  return `level-${level}-tier-${tier}`;
}
