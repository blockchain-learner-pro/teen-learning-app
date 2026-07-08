const soundCache = {};
let musicInstance = null;

export const playSound = (file) => {
  try {
    if (!soundCache[file]) {
      soundCache[file] = new Audio(`/sounds/${file}`);
      soundCache[file].volume = 0.5;
    }

    const audio = soundCache[file];
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {}
};

export const playMusic = (file, { volume = 0.3, loop = true } = {}) => {
  try {
    if (musicInstance) {
      musicInstance.pause();
      musicInstance = null;
    }

    const audio = new Audio(`/sounds/${file}`);
    audio.volume = volume;
    audio.loop = loop;

    audio.play().catch(() => {});

    musicInstance = audio;
  } catch {}
};

export const stopMusic = () => {
  try {
    if (musicInstance) {
      musicInstance.pause();
      musicInstance = null;
    }
  } catch {}
};