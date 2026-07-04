/* =========================
   🔊 STORAGE + SOUND
========================= */
export const saveGame = (data) => {
  localStorage.setItem("levelup_rpg", JSON.stringify(data));
};

export const loadGame = () => {
  try {
    return JSON.parse(localStorage.getItem("levelup_rpg")) || null;
  } catch {
    return null;
  }
};