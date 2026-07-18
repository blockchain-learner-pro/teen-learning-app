// src/engine/combatEngine.js

export function calculateDamage(player, enemy) {
  const base = (player.attack || 0) - (enemy.defense || 0);
  return Math.max(1, base);
}

export function isCriticalHit(chance = 0.1) {
  return Math.random() < chance;
}

export function applyCombatTurn(player, enemy) {
  const crit = isCriticalHit();

  let damage = calculateDamage(player, enemy);

  if (crit) {
    damage *= 2;
  }

  const updatedEnemy = {
    ...enemy,
    hp: (enemy.hp || 0) - damage,
  };

  return {
    player,
    enemy: updatedEnemy,
    damage,
    crit,
  };
}