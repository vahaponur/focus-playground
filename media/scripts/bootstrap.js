import { GAME_IDS, TEXT } from './constants.js';
import { h } from './dom.js';
import { createInitialState, persistScores, persistSens, clampDuration } from './state.js';
import { createDurationButtons, createMenuCard, createMenuPlayButton, createScoreBadge } from './ui/components.js';
import { createAimGame } from './games/aim.js';
import { createSequenceGame } from './games/memory.js';

const root = document.getElementById('app');
if (!root) {
  console.error('Focus Playground: root element missing.');
} else {
  const initialDuration = Number.parseInt(root.dataset.duration || '30', 10);
  const state = createInitialState(initialDuration);
  let disposables = [];

  render();

  window.addEventListener('message', (event) => {
    const message = event?.data;
    if (!message || message.type !== 'config') return;
    if (typeof message.duration === 'number') {
      state.duration = clampDuration(message.duration);
      render();
    }
  });

  function render() {
    disposeAll();
    root.innerHTML = '';
    const card = h('div', { class: 'card' }, [renderHeader(), renderBody(), renderFooter()]);
    root.appendChild(card);
  }

  function renderHeader() {
    const title = h('div', { class: 'title', text: TEXT.appTitle });
    const badge = h('span', { class: 'badge', text: TEXT.focusBadge(state.duration) });
    const durationButtons = createDurationButtons((delta) => {
      state.duration = clampDuration(state.duration + delta);
      render();
    });
    const controls = h('div', { class: 'controls' }, [badge, ...durationButtons]);
    if (state.screen === 'game') {
      const back = h('button', {
        class: 'button back',
        onClick: () => {
          state.screen = 'menu';
          state.game = null;
          render();
        },
      }, [TEXT.back]);
      controls.prepend(back);
    }
    return h('div', { class: 'header' }, [title, controls]);
  }

  function renderBody() {
    if (state.screen === 'menu') {
      return renderMenu();
    }
    if (state.game === GAME_IDS.AIM) {
      const aim = createAimGame({
        state,
        onScoresUpdated: () => {
          persistScores(state.scores);
          render();
        },
        onSensUpdated: () => {
          persistSens(state.sens);
        },
      });
      registerDisposable(() => aim.dispose());
      return aim.element;
    }
    if (state.game === GAME_IDS.MEMORY) {
      const memory = createSequenceGame({
        state,
        onScoresUpdated: () => {
          persistScores(state.scores);
          render();
        },
      });
      registerDisposable(() => memory.dispose());
      return memory.element;
    }
    return renderMenu();
  }

  function renderMenu() {
    const aimCard = createMenuCard({
      title: TEXT.aimTitle,
      description: TEXT.menuAimDesc,
      scoreBadge: createScoreBadge(state.scores, 'aim'),
      action: createMenuPlayButton(() => {
        state.screen = 'game';
        state.game = GAME_IDS.AIM;
        render();
      }),
    });

    const memoryCard = createMenuCard({
      title: TEXT.memoryTitle,
      description: TEXT.menuMemoryDesc,
      scoreBadge: createScoreBadge(state.scores, 'mem'),
      action: createMenuPlayButton(() => {
        state.screen = 'game';
        state.game = GAME_IDS.MEMORY;
        render();
      }),
    });

    return h('div', { class: 'menu-grid' }, [aimCard, memoryCard]);
  }

  function renderFooter() {
    return h('div', { class: 'footer' }, []);
  }

  function registerDisposable(fn) {
    disposables.push(fn);
  }

  function disposeAll() {
    try {
      disposables.forEach((fn) => {
        try { fn(); } catch (error) { console.warn('Focus Playground cleanup failed', error); }
      });
    } finally {
      disposables = [];
    }
  }
}
