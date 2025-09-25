import { TEXT } from '../constants.js';
import { h } from '../dom.js';
import { wait } from '../utils.js';
import { createScoreBadge } from '../ui/components.js';

export class SequenceGame {
  constructor({ state, onScoresUpdated }) {
    this.state = state;
    this.onScoresUpdated = onScoresUpdated;
    this.sequence = [];
    this.accepting = false;
    this.index = 0;
    this.rounds = 0;
    this.timeLeft = state.duration;
    this.timerId = null;

    this.container = h('div');
    this.header = this.createHeader();
    this.grid = this.createGrid();
    this.container.append(
      this.header,
      this.grid.element,
      createScoreBadge(this.state.scores, 'mem')
    );
    this.updateBadges();
    this.adjustLayout();
  }

  get element() {
    return this.container;
  }

  dispose() {
    clearInterval(this.timerId);
    this.grid.observer.disconnect();
  }

  createHeader() {
    this.timeBadge = h('span', { class: 'badge' });
    this.roundBadge = h('span', { class: 'badge' });
    const startButton = h('button', {
      class: 'button good',
      text: TEXT.aimStart,
      onClick: () => this.start(),
    });
    const controls = h('div', { class: 'controls' }, [this.timeBadge, this.roundBadge, startButton]);
    return h('div', { class: 'header' }, [h('div', { class: 'title', text: TEXT.memoryTitle }), controls]);
  }

  createGrid() {
    const panel = h('div', { class: 'grid panel' });
    const tiles = Array.from({ length: 9 }, (_, index) => {
      const tile = h('div', { class: 'tile' });
      tile.dataset.index = String(index);
      tile.addEventListener('click', () => this.handleTileClick(index, tile));
      panel.appendChild(tile);
      return tile;
    });

    const observer = new ResizeObserver(() => this.adjustLayout());
    observer.observe(panel);

    return { element: panel, tiles, observer };
  }

  start() {
    this.sequence = [];
    this.accepting = false;
    this.index = 0;
    this.rounds = 0;
    this.timeLeft = this.state.duration;
    this.updateBadges();
    clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.timeLeft -= 1;
      this.updateBadges();
      if (this.timeLeft <= 0) this.finish(false);
    }, 1000);
    this.nextRound();
  }

  nextRound() {
    this.rounds += 1;
    this.updateBadges();
    this.sequence.push(Math.floor(Math.random() * 9));
    this.playSequence();
  }

  async playSequence() {
    this.accepting = false;
    this.index = 0;
    for (const step of this.sequence) {
      this.flashTile(this.grid.tiles[step]);
      await wait(450);
    }
    this.accepting = true;
  }

  handleTileClick(index, tile) {
    if (!this.accepting) return;
    this.flashTile(tile);
    if (index === this.sequence[this.index]) {
      this.index += 1;
      if (this.index >= this.sequence.length) {
        setTimeout(() => this.nextRound(), 350);
      }
    } else {
      this.finish(true);
    }
  }

  flashTile(tile) {
    tile.classList.add('flash');
    setTimeout(() => tile.classList.remove('flash'), 250);
  }

  finish(failed) {
    clearInterval(this.timerId);
    this.accepting = false;
    const score = this.rounds;
    if (score > (this.state.scores.mem || 0)) {
      this.state.scores.mem = score;
      this.onScoresUpdated();
    }
    const message = failed
      ? TEXT.aimOops(this.rounds, this.state.scores.mem)
      : TEXT.aimTimeUp(this.rounds, this.state.scores.mem);
    this.grid.element.appendChild(h('div', { class: 'footer', text: message }));
  }

  adjustLayout() {
    const rect = this.grid.element.getBoundingClientRect();
    const aspect = rect.width / Math.max(1, rect.height);
    let cols = 3;
    let rows = 3;
    if (aspect >= 2.2) {
      cols = 9;
      rows = 1;
    } else if (aspect <= 0.45) {
      cols = 1;
      rows = 9;
    }
    this.grid.element.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    this.grid.element.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  }

  updateBadges() {
    this.timeBadge.textContent = TEXT.timeLabel(this.timeLeft);
    this.roundBadge.textContent = TEXT.roundLabel(this.rounds);
  }
}

export const createSequenceGame = (options) => new SequenceGame(options);
