export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function readJSON(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.warn('Focus Playground: readJSON failed', key, error);
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Focus Playground: writeJSON failed', key, error);
  }
}
