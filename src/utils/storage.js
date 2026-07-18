import { openDB } from 'idb';

const DB_NAME = 'teenbuilder-game';
const DB_VERSION = 1;
let dbPromise;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('gameState')) db.createObjectStore('gameState');
        if (!db.objectStoreNames.contains('battleHistory')) db.createObjectStore('battleHistory', { keyPath: 'id', autoIncrement: true });
        if (!db.objectStoreNames.contains('collection')) db.createObjectStore('collection', { keyPath: 'badgeId' });
      },
    });
  }
  return dbPromise;
}

export function loadGame() {
  try { const raw = localStorage.getItem('teenbuilder-game-state'); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

export function saveGame(state) {
  try { localStorage.setItem('teenbuilder-game-state', JSON.stringify(state)); } catch {}
}

export async function saveBattleResult(result) {
  const db = await getDB();
  const record = { ...result, timestamp: Date.now() };
  await db.add('battleHistory', record);
  return record;
}

export async function getBattleHistory() {
  const db = await getDB();
  return db.getAll('battleHistory');
}

export async function getBattlesByLevel(level) {
  const all = await getBattleHistory();
  return all.filter(b => b.level === level);
}

export async function unlockBadge(badgeId, badgeData) {
  const db = await getDB();
  const existing = await db.get('collection', badgeId);
  if (!existing) {
    await db.put('collection', { badgeId, ...badgeData, unlockedAt: Date.now() });
    return true;
  }
  return false;
}

export async function getCollection() {
  const db = await getDB();
  return db.getAll('collection');
}

export async function hasBadge(badgeId) {
  const db = await getDB();
  const badge = await db.get('collection', badgeId);
  return !!badge;
}

export async function loadProgress() {
  const db = await getDB();
  const progress = await db.get('gameState', 'progress');
  return progress || { highestLevelUnlocked: 1, totalWins: 0, totalLosses: 0, totalQuestionsAnswered: 0, totalScore: 0 };
}

export async function saveProgress(progress) {
  const db = await getDB();
  await db.put('gameState', progress, 'progress');
}

export async function resetAllProgress() {
  const db = await getDB();
  await db.clear('battleHistory');
  await db.clear('collection');
  await db.put('gameState', { highestLevelUnlocked: 1, totalWins: 0, totalLosses: 0, totalQuestionsAnswered: 0, totalScore: 0 }, 'progress');
  try { localStorage.removeItem('teenbuilder-game-state'); } catch {}
}
