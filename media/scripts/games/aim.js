import { DEFAULTS, DIFFICULTIES, GAME_PROFILES, SENS_LIMITS, TEXT } from '../constants.js';
import { h } from '../dom.js';
import { clamp } from '../utils.js';
import { createScoreBadge } from '../ui/components.js';

export class AimGame {
  constructor({ state, onScoresUpdated, onSensUpdated }) {
    this.state = state;
    this.onScoresUpdated = onScoresUpdated;
    this.onSensUpdated = onSensUpdated;

    this.running = false;
    this.timeLeft = state.duration;
    this.score = 0;
    this.crosshair = { x: 0.5, y: 0.5 };
    this.timers = [];
    this.startButton = null;
    this.startVisible = false;

    this.container = h('div');
    this.header = this.createHeader();
    this.settings = this.createSettings();
    this.arena = this.createArena();
    this.hint = h('div', { class: 'precision-hint', text: TEXT.aimPrecisionHint });
    this.doc = this.createDoc();

    this.container.append(
      this.header,
      this.settings,
      this.arena.wrapper,
      this.hint,
      this.doc,
      createScoreBadge(this.state.scores, 'aim')
    );

    this.registerPointerLockHandlers();
    this.updateLockUI();
    this.updateCrosshair();
  }

  get element() {
    return this.container;
  }

  dispose() {
    this.clearTimers();
    document.removeEventListener('pointerlockchange', this.handleLockChange);
    document.removeEventListener('pointerlockerror', this.handleLockError);
    this.arena.resizeObserver.disconnect();
  }

  // ----- UI builders ------------------------------------------------------

  createHeader() {
    const title = h('div', { class: 'title', text: TEXT.aimTitle });
    this.lockBadge = h('span', { class: 'badge' });
    this.timeBadge = h('span', { class: 'badge' });
    this.scoreBadge = h('span', { class: 'badge' });
    const controls = h('div', { class: 'controls' }, [this.lockBadge, this.timeBadge, this.scoreBadge]);
    return h('div', { class: 'header' }, [title, controls]);
  }

  createSettings() {
    const row1 = h('div', { class: 'settings-row' }, [
      this.createLabel(TEXT.gameLabel),
      this.createGameSelect(),
      this.createLabel(TEXT.dpi),
      this.createNumberInput('dpi', this.state.sens.dpi, SENS_LIMITS.dpi, (value) => {
        this.state.sens.dpi = value;
        this.onSensUpdated();
        this.refreshBadges();
      }),
    ]);

    this.lastSingleSens = this.state.sens.sens || 1;
    this.sensInput = this.createNumberInput('sens', this.state.sens.sens, SENS_LIMITS.sens, (value) => {
      this.state.sens.sens = value;
      this.lastSingleSens = value;
      this.onSensUpdated();
      this.refreshBadges();
    });

    this.axisCheckbox = this.createCheckbox(this.state.sens.axisSplit, (checked) => {
      this.state.sens.axisSplit = checked;
      if (checked) {
        this.state.sens.sensX = this.lastSingleSens;
        this.state.sens.sensY = this.lastSingleSens;
      } else {
        this.state.sens.sens = this.lastSingleSens;
      }
      this.onSensUpdated();
      this.renderSensControls();
      this.refreshBadges();
    });

    this.sensXInput = this.createNumberInput('sensX', this.state.sens.sensX || this.state.sens.sens, SENS_LIMITS.sens, (value) => {
      this.state.sens.sensX = value;
      this.onSensUpdated();
      this.refreshBadges();
    });

    this.sensYInput = this.createNumberInput('sensY', this.state.sens.sensY || this.state.sens.sens, SENS_LIMITS.sens, (value) => {
      this.state.sens.sensY = value;
      this.onSensUpdated();
      this.refreshBadges();
    });

    this.sensLeft = h('div', { class: 'settings-left' });
    this.renderSensControls();

    const row2 = h('div', { class: 'settings-row between' }, [
      this.sensLeft,
      h('div', { class: 'settings-right' }, [this.createLabel(TEXT.differentAxis), this.axisCheckbox]),
    ]);

    this.diffSelect = this.createDifficultySelect();
    const row3 = h('div', { class: 'settings-row' }, [
      this.createLabel(TEXT.difficulty),
      this.diffSelect,
    ]);

    return h('div', { class: 'settings' }, [row1, row2, row3]);
  }

  renderSensControls() {
    this.sensLeft.innerHTML = '';
    if (this.state.sens.axisSplit) {
      this.sensLeft.append(
        this.createLabel(TEXT.sensLabel),
        this.createLabel(TEXT.axisX),
        this.sensXInput,
        this.createLabel('—'),
        this.createLabel(TEXT.axisY),
        this.sensYInput,
      );
    } else {
      this.sensLeft.append(this.createLabel(TEXT.sensLabel), this.sensInput);
    }
  }

  createLabel(text) {
    return h('span', { class: 'label', text });
  }

  createNumberInput(key, initial, limits, onChange) {
    const input = h('input', {
      type: 'number',
      min: String(limits.min),
      max: String(limits.max),
      step: String(limits.step),
      value: String(initial),
    });
    input.addEventListener('change', () => {
      const parsed = clamp(Number.parseFloat(input.value) || initial, limits.min, limits.max);
      input.value = String(parsed);
      onChange(parsed);
    });
    return input;
  }

  createCheckbox(initial, onChange) {
    const input = h('input', { type: 'checkbox' });
    input.checked = initial;
    input.addEventListener('change', () => onChange(input.checked));
    return input;
  }

  createGameSelect() {
    const select = h('select');
    GAME_PROFILES.forEach((profile) => {
      select.appendChild(h('option', { value: profile.id, text: profile.name }));
    });
    select.value = this.state.sens.gameId;
    select.addEventListener('change', () => {
      this.state.sens.gameId = select.value;
      this.onSensUpdated();
      this.refreshBadges();
    });
    return select;
  }

  createDifficultySelect() {
    const select = h('select');
    Object.keys(DIFFICULTIES).forEach((id) => {
      const label = id.charAt(0).toUpperCase() + id.slice(1);
      select.appendChild(h('option', { value: id, text: label }));
    });
    select.value = this.state.sens.difficulty;
    select.addEventListener('change', () => {
      this.state.sens.difficulty = select.value;
      this.onSensUpdated();
    });
    return select;
  }

  createArena() {
    const wrapper = h('div', { class: 'panel', id: 'aimArea', tabindex: '0' });
    const crosshair = h('div', { class: 'crosshair' }, [
      h('div', { class: 'xh-ring' }),
      h('div', { class: 'xh-dot' }),
    ]);
    const unlockButton = h('button', { class: 'button unlock', text: TEXT.aimUnlock });
    const focusOverlay = h('div', { class: 'focus-overlay', text: TEXT.aimOverlay });

    wrapper.append(crosshair, unlockButton);

    wrapper.addEventListener('mousemove', (event) => this.handleMouseMove(event));
    wrapper.addEventListener('mousedown', (event) => this.handleMouseDown(event));
    unlockButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.disableLock();
    });
    focusOverlay.addEventListener('click', (event) => {
      event.preventDefault();
      this.enableLock();
    });

    const resizeObserver = new ResizeObserver(() => this.updateCrosshair());
    resizeObserver.observe(wrapper);

    return {
      wrapper,
      crosshair,
      unlockButton,
      focusOverlay,
      resizeObserver,
    };
  }

  createDoc() {
    const doc = h('div', { class: 'doc' });
    doc.innerHTML = Object.values(TEXT.aimDoc).join('<br>');
    return doc;
  }

  // ----- Pointer lock -----------------------------------------------------

  registerPointerLockHandlers() {
    this.handleLockChange = () => this.updateLockUI();
    this.handleLockError = () => this.showFocusOverlay();
    document.addEventListener('pointerlockchange', this.handleLockChange);
    document.addEventListener('pointerlockerror', this.handleLockError);
  }

  enableLock() {
    this.arena.wrapper.focus();
    this.arena.wrapper.requestPointerLock?.();
  }

  disableLock() {
    document.exitPointerLock?.();
  }

  updateLockUI() {
    const locked = document.pointerLockElement === this.arena.wrapper;
    this.lockBadge.textContent = locked ? TEXT.aimBadgeLockOn : TEXT.aimBadgeLockOff;

    if (locked) {
      this.hideFocusOverlay();
      if (!this.running && !this.arena.wrapper.contains(this.startButton)) {
        this.showStartButton();
      }
    } else {
      this.showFocusOverlay();
    }

    this.refreshBadges();
  }

  showStartButton(label = this.state.runtime.aimPlayed ? TEXT.aimRestart : TEXT.aimStart) {
    if (!this.startButton) {
      this.startButton = this.createStartButton();
    }
    this.startButton.textContent = label;
    this.startButton.classList.toggle('warn', this.state.runtime.aimPlayed);
    this.arena.wrapper.appendChild(this.startButton);
    this.startVisible = true;
  }

  hideStartButton() {
    if (this.startButton && this.startButton.parentElement === this.arena.wrapper) {
      this.arena.wrapper.removeChild(this.startButton);
    }
    this.startVisible = false;
  }

  createStartButton() {
    const button = h('button', { class: 'button good start-btn' });
    button.addEventListener('click', (event) => {
      event.preventDefault();
      if (document.pointerLockElement !== this.arena.wrapper) {
        this.enableLock();
        return;
      }
      if (!this.running) {
        this.startRun();
      }
    });
    return button;
  }

  showFocusOverlay() {
    if (!this.arena.focusOverlay.parentElement) {
      this.hideStartButton();
      this.arena.wrapper.appendChild(this.arena.focusOverlay);
    }
  }

  hideFocusOverlay() {
    if (this.arena.focusOverlay.parentElement === this.arena.wrapper) {
      this.arena.wrapper.removeChild(this.arena.focusOverlay);
    }
  }

  // ----- Game loop --------------------------------------------------------

  startRun() {
    this.running = true;
    this.state.runtime.aimPlayed = true;
    this.hideStartButton();
    this.clearPlayArea();
    this.score = 0;
    this.timeLeft = this.state.duration;
    this.refreshBadges();

    const diff = this.getDifficulty();
    let spawnEvery = diff.spawnStart;

    this.timers.push(setInterval(() => {
      this.timeLeft -= 1;
      this.timeBadge.textContent = TEXT.timeLabel(this.timeLeft);
      if (this.timeLeft <= 0) {
        this.finishRun();
      }
    }, 1000));

    const spawn = () => {
      this.spawnDot();
      spawnEvery = Math.max(250, spawnEvery - 10);
    };
    this.timers.push(setInterval(spawn, spawnEvery));
    this.timers.push(setInterval(() => {
      this.clearTimer(1);
      this.timers[1] = setInterval(() => this.spawnDot(), Math.max(diff.spawnMin, spawnEvery));
    }, 5000));
  }

  finishRun() {
    this.running = false;
    this.clearTimers();
    const best = this.state.scores.aim || 0;
    if (this.score > best) {
      this.state.scores.aim = this.score;
      this.onScoresUpdated();
    }
    this.arena.wrapper.appendChild(h('div', { class: 'footer', text: TEXT.aimDone(this.score, this.state.scores.aim) }));
    if (document.pointerLockElement === this.arena.wrapper) {
      this.showStartButton(TEXT.aimRestart);
    }
  }

  clearPlayArea() {
    this.arena.wrapper.querySelectorAll('.dot, .footer').forEach((node) => node.remove());
  }

  clearTimers() {
    this.timers.forEach((id) => clearInterval(id));
    this.timers = [];
  }

  clearTimer(index) {
    if (this.timers[index]) {
      clearInterval(this.timers[index]);
    }
  }

  spawnDot() {
    const diff = this.getDifficulty();
    const rect = this.arena.wrapper.getBoundingClientRect();
    const pad = 18;
    let attempts = 0;
    let x = 0;
    let y = 0;
    do {
      x = Math.random() * Math.max(4, rect.width - pad * 2) + pad;
      y = Math.random() * Math.max(4, rect.height - pad * 2) + pad;
      attempts += 1;
      if (!this.isWithinUnlockZone(x, y, rect) && !this.isTooCloseToUnlock(x, y, rect)) {
        break;
      }
    } while (attempts < 15);

    const dot = h('div', { class: 'dot' });
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    dot.style.width = `${diff.dotSize}px`;
    dot.style.height = `${diff.dotSize}px`;
    let clicked = false;
    dot.addEventListener('click', (event) => {
      if (document.pointerLockElement === this.arena.wrapper) return;
      event.stopPropagation();
      if (clicked) return;
      clicked = true;
      this.incrementScore();
      dot.remove();
    });
    this.arena.wrapper.appendChild(dot);
    setTimeout(() => dot.remove(), diff.dotLife);
  }

  incrementScore() {
    this.score += 1;
    this.refreshBadges();
  }

  refreshBadges() {
    const locked = document.pointerLockElement === this.arena.wrapper;
    const edpi = this.computeEdpi();
    const edpiLabel = Array.isArray(edpi) ? `eDPI ${edpi[0]} / ${edpi[1]}` : `eDPI ${edpi}`;
    this.lockBadge.textContent = `${locked ? TEXT.aimBadgeLockOn : TEXT.aimBadgeLockOff} · ${edpiLabel}`;
    this.timeBadge.textContent = TEXT.timeLabel(this.timeLeft);
    this.scoreBadge.textContent = TEXT.aimScore(this.score);
  }

  computeEdpi() {
    const dpi = this.state.sens.dpi || 800;
    if (this.state.sens.axisSplit) {
      return [Math.round(dpi * (this.state.sens.sensX || 1)), Math.round(dpi * (this.state.sens.sensY || 1))];
    }
    return Math.round(dpi * (this.state.sens.sens || 1));
  }

  getDifficulty() {
    return DIFFICULTIES[this.state.sens.difficulty] || DIFFICULTIES.normal;
  }

  getUnlockZone(rect) {
    const width = clamp(rect.width * DEFAULTS.aimUnlockZoneWidthFactor, DEFAULTS.aimUnlockZoneWidthClamp[0], DEFAULTS.aimUnlockZoneWidthClamp[1]);
    const height = clamp(rect.height * DEFAULTS.aimUnlockZoneHeightFactor, DEFAULTS.aimUnlockZoneHeightClamp[0], DEFAULTS.aimUnlockZoneHeightClamp[1]);
    const margin = clamp(Math.min(rect.width, rect.height) * DEFAULTS.aimUnlockZoneMarginFactor, DEFAULTS.aimUnlockZoneMarginClamp[0], DEFAULTS.aimUnlockZoneMarginClamp[1]);
    return { width, height, margin };
  }

  isWithinUnlockZone(x, y, rect) {
    const zone = this.getUnlockZone(rect);
    return x > rect.width - zone.width - zone.margin && y > rect.height - zone.height - zone.margin;
  }

  isTooCloseToUnlock(x, y, rect) {
    const zone = this.getUnlockZone(rect);
    const centerX = rect.width - zone.width / 2 - zone.margin;
    const centerY = rect.height - zone.height / 2 - zone.margin;
    const radius = clamp(Math.min(rect.width, rect.height) * 0.07, DEFAULTS.aimUnlockRadiusMin, DEFAULTS.aimUnlockRadiusMax);
    const dx = x - centerX;
    const dy = y - centerY;
    return dx * dx + dy * dy < radius * radius;
  }

  scaleMovement(dx, dy) {
    const dpi = this.state.sens.dpi || 800;
    const baseline = DEFAULTS.aimBaselineEdpi;
    const computeFactor = (sensValue) => clamp((dpi * sensValue) / baseline, 0.05, 8);
    const sx = computeFactor(this.state.sens.axisSplit ? this.state.sens.sensX || this.state.sens.sens : this.state.sens.sens || 1);
    const sy = computeFactor(this.state.sens.axisSplit ? this.state.sens.sensY || this.state.sens.sens : this.state.sens.sens || 1);
    return [dx * sx, dy * sy];
  }

  handleMouseMove(event) {
    if (document.pointerLockElement !== this.arena.wrapper) return;
    const rect = this.arena.wrapper.getBoundingClientRect();
    const [dx, dy] = this.scaleMovement(event.movementX || 0, event.movementY || 0);
    const nextX = clamp(this.crosshair.x * rect.width + dx, 0, rect.width);
    const nextY = clamp(this.crosshair.y * rect.height + dy, 0, rect.height);
    this.crosshair.x = rect.width ? nextX / rect.width : 0.5;
    this.crosshair.y = rect.height ? nextY / rect.height : 0.5;
    this.updateCrosshair();
  }

  handleMouseDown(event) {
    if (document.pointerLockElement !== this.arena.wrapper) {
      event.preventDefault();
      this.enableLock();
      return;
    }

    event.preventDefault();
    const rect = this.arena.wrapper.getBoundingClientRect();
    const px = this.crosshair.x * rect.width;
    const py = this.crosshair.y * rect.height;

    if (this.startVisible && this.isWithinStartZone(px, py, rect)) {
      this.startRun();
      return;
    }

    if (this.isWithinUnlockZone(px, py, rect)) {
      this.disableLock();
      return;
    }

    this.fireShot(px, py);
  }

  isWithinStartZone(px, py, rect) {
    const sx = rect.width / 2;
    const sy = rect.height / 2;
    const dx = px - sx;
    const dy = py - sy;
    return dx * dx + dy * dy <= DEFAULTS.aimStartRadius * DEFAULTS.aimStartRadius;
  }

  fireShot(px, py) {
    const radius = (this.getDifficulty().dotSize / 2) + 2;
    const dots = Array.from(this.arena.wrapper.querySelectorAll('.dot'));
    for (const dot of dots) {
      const dx = px - Number.parseFloat(dot.style.left);
      const dy = py - Number.parseFloat(dot.style.top);
      if (dx * dx + dy * dy <= radius * radius) {
        dot.remove();
        this.incrementScore();
        break;
      }
    }
  }

  updateCrosshair() {
    const rect = this.arena.wrapper.getBoundingClientRect();
    this.arena.crosshair.style.left = `${this.crosshair.x * rect.width}px`;
    this.arena.crosshair.style.top = `${this.crosshair.y * rect.height}px`;
    this.highlightInteractive();
  }

  highlightInteractive() {
    const rect = this.arena.wrapper.getBoundingClientRect();
    const px = this.crosshair.x * rect.width;
    const py = this.crosshair.y * rect.height;

    if (this.startButton) {
      this.startButton.classList.toggle('hot', this.startVisible && this.isWithinStartZone(px, py, rect));
    }
    if (this.arena.focusOverlay.parentElement === this.arena.wrapper) {
      this.arena.focusOverlay.classList.toggle('hot', this.isWithinStartZone(px, py, rect));
    }
    const inUnlock = this.isWithinUnlockZone(px, py, rect);
    this.arena.unlockButton.classList.toggle('hot', inUnlock);
  }

  handleLockError() {
    this.showFocusOverlay();
  }
}

export const createAimGame = (options) => new AimGame(options);
