import { TEXT } from '../constants.js';
import { h } from '../dom.js';

export function createDurationButtons(onAdjust) {
  const deltas = [-10, -5, 5, 10];
  return deltas.map((delta) => {
    const label = delta > 0 ? `+${delta}s` : `${delta}s`;
    return h('button', {
      class: 'button',
      onClick: () => onAdjust(delta),
    }, [label]);
  });
}

export function createScoreBadge(scores, key) {
  const best = scores[key] || 0;
  return h('div', { class: 'scorebar' }, [h('span', { class: 'badge', text: TEXT.scoreLabel(best) })]);
}

export const createButton = (label, className, onClick) => h('button', { class: className, onClick }, [label]);

export const createMenuCard = ({ title, description, scoreBadge, action }) => h('div', { class: 'menu-item' }, [
  h('div', { class: 'menu-title', text: title }),
  h('div', { class: 'menu-desc', text: description }),
  scoreBadge,
  h('div', { class: 'controls' }, [action]),
]);

export const createMenuPlayButton = (onClick) => createButton(TEXT.menuPlay, 'button good', onClick);
