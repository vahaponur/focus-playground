export const STORAGE_KEYS = {
  scores: 'fp_scores',
  sens: 'fp_senscfg',
};

export const GAME_IDS = {
  AIM: 'aim',
  MEMORY: 'mem',
};

export const GAME_PROFILES = [
  { id: 'cs2', name: 'CS2', yaw: 0.022 },
  { id: 'val', name: 'Valorant', yaw: 0.07 },
];

export const SENS_LIMITS = {
  dpi: { min: 50, max: 32000, step: 50 },
  sens: { min: 0.01, max: 10, step: 0.01 },
};

export const DEFAULTS = {
  duration: 30,
  minDuration: 10,
  maxDuration: 180,
  aimBaselineEdpi: 800,
  aimStartRadius: 40,
  aimUnlockRadiusMin: 24,
  aimUnlockRadiusMax: 64,
  aimUnlockZoneWidthClamp: [110, 180],
  aimUnlockZoneHeightClamp: [42, 110],
  aimUnlockZoneMarginClamp: [8, 24],
  aimUnlockZoneWidthFactor: 0.2,
  aimUnlockZoneHeightFactor: 0.18,
  aimUnlockZoneMarginFactor: 0.03,
};

export const DIFFICULTIES = {
  easy: { dotLife: 2500, dotSize: 32, spawnStart: 900, spawnMin: 350 },
  normal: { dotLife: 1800, dotSize: 24, spawnStart: 700, spawnMin: 250 },
  hard: { dotLife: 1300, dotSize: 20, spawnStart: 600, spawnMin: 220 },
  insane: { dotLife: 1000, dotSize: 18, spawnStart: 500, spawnMin: 200 },
};

export const TEXT = {
  appTitle: 'Focus Playground',
  aimTitle: 'Aim Dots',
  aimInfo: 'Click the dots before they fade. Rack up as many hits as you can.',
  aimStart: 'Start',
  aimRestart: 'Restart',
  aimOverlay: 'Click Here to Focus',
  aimUnlock: 'Unlock',
  aimBadgeLockOn: 'Lock ON',
  aimBadgeLockOff: 'Lock OFF',
  aimPrecisionHint: 'Pointer Lock active during play — press Esc to release.',
  aimDoc: {
    setup: 'Set <b>DPI</b> and <b>Sens</b> (or enable <b>Different axis</b> for X/Y).',
    persist: 'After editing, <b>click outside</b> the inputs or press <b>Tab</b> to save.',
    focus: 'If you are not locked, the center shows <b>Click Here to Focus</b>. Click it to enable Pointer Lock.',
    indicator: 'The badge next to eDPI shows <b>Lock ON/OFF</b>.',
    start: 'Once locked, press <b>Start</b> or later <b>Restart</b> to play.',
    edpi: 'eDPI = DPI × Sens. Higher eDPI = faster crosshair.',
    duration: 'Change play time from the header (−/+).',
    unlock: 'Use the bottom-right area or press <b>Esc</b>.',
  },
  memoryTitle: 'Sequence Memory',
  memoryInfo: 'Repeat the sequence on the grid. It grows every round.',
  menuAimDesc: 'Quick precision bursts. Pointer Lock optional but recommended.',
  menuMemoryDesc: 'Repeat the pattern. Perfect for quick focus resets.',
  menuPlay: 'Play',
  back: '← Back',
  scoreLabel: (best) => `Best: ${best}`,
  roundLabel: (round) => `Round: ${round}`,
  timeLabel: (seconds) => `${seconds}s`,
  aimScore: (value) => `Score: ${value}`,
  aimDone: (score, best) => `Done! Final score ${score}. Best ${best}.`,
  aimOops: (round, best) => `Oops! You reached round ${round}. Best ${best}.`,
  aimTimeUp: (round, best) => `Time! You reached round ${round}. Best ${best}.`,
  difficulty: 'Difficulty',
  differentAxis: 'Different axis',
  sensLabel: 'Sens:',
  axisX: 'X',
  axisY: 'Y',
  dpi: 'DPI',
  gameLabel: 'Game',
  focusBadge: (duration) => `Play ~${duration}s`,
};
