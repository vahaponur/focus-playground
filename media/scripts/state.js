import { DEFAULTS, GAME_PROFILES, STORAGE_KEYS } from './constants.js';
import { clamp, readJSON, writeJSON } from './utils.js';

export function createInitialState(durationOverride) {
  const duration = clamp(durationOverride ?? DEFAULTS.duration, DEFAULTS.minDuration, DEFAULTS.maxDuration);
  return {
    screen: 'menu',
    game: null,
    duration,
    scores: readJSON(STORAGE_KEYS.scores, { aim: 0, mem: 0 }),
    sens: hydrateSens(),
    runtime: {
      aimPlayed: false,
    },
  };
}

export function persistScores(scores) {
  writeJSON(STORAGE_KEYS.scores, scores);
}

export function persistSens(sens) {
  writeJSON(STORAGE_KEYS.sens, sens);
}

export function clampDuration(value) {
  return clamp(value, DEFAULTS.minDuration, DEFAULTS.maxDuration);
}

function hydrateSens() {
  const stored = readJSON(STORAGE_KEYS.sens, null);
  if (stored) {
    return {
      gameId: stored.gameId || GAME_PROFILES[0].id,
      dpi: stored.dpi || 800,
      sens: stored.sens || 1,
      sensX: stored.sensX || stored.sens || 1,
      sensY: stored.sensY || stored.sens || 1,
      axisSplit: !!stored.axisSplit,
      difficulty: stored.difficulty || 'normal',
    };
  }
  return {
    gameId: GAME_PROFILES[0].id,
    dpi: 800,
    sens: 1,
    sensX: 1,
    sensY: 1,
    axisSplit: false,
    difficulty: 'normal',
  };
}
