const SOUND_EFFECTS_STORAGE_KEY = 'soundEffectsEnabled';
const SUCCESS_SOUND_SRC = '/sounds/success.mp3';

const canUseBrowserAudio = () => typeof window !== 'undefined';

export const isSoundEffectsEnabled = () => {
  if (!canUseBrowserAudio()) return false;
  return window.localStorage.getItem(SOUND_EFFECTS_STORAGE_KEY) !== 'false';
};

export const setSoundEffectsEnabled = (enabled: boolean) => {
  if (!canUseBrowserAudio()) return;
  window.localStorage.setItem(SOUND_EFFECTS_STORAGE_KEY, String(enabled));
};

const playFallbackTone = () => {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.12);
  gain.gain.setValueAtTime(0.001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.18);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.18);
};

export const playSuccessSound = () => {
  if (!isSoundEffectsEnabled()) return;

  const audio = new Audio(SUCCESS_SOUND_SRC);
  audio.volume = 0.35;
  void audio.play().catch(() => {
    playFallbackTone();
  });
};

