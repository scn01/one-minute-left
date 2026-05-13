// js/ui.js — Overlay, level select cards, toast notifications

import { LEVEL_DEFS } from './levels.js';

const overlay = document.getElementById('overlay');

// Secret toast
let toastEl = null;
let toastTimeout = null;

function ensureToast() {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'secret-toast';
    document.body.appendChild(toastEl);
  }
}

export function showSecretToast(message = '★ SECRET LEVEL UNLOCKED ★') {
  ensureToast();
  toastEl.textContent = message;
  if (toastTimeout) clearTimeout(toastTimeout);
  // Force reflow so re-showing works
  toastEl.classList.remove('visible');
  void toastEl.offsetWidth;
  toastEl.classList.add('visible');
  toastTimeout = setTimeout(() => toastEl.classList.remove('visible'), 4000);
}

// Level cards
export function renderLevelSelectCards(container, { levelBests, secretUnlocked, selectedLevelId, secretJustUnlocked, onSelect }) {
  container.innerHTML = '';
  for (const def of LEVEL_DEFS) {
    const isSecret = def.id === 'secret';
    const locked = isSecret && !secretUnlocked;
    const best = levelBests[def.id];
    const sel = selectedLevelId === def.id;

    const card = document.createElement('div');
    const classes = ['lvl-card'];
    if (isSecret) classes.push('secret-card');
    if (locked) classes.push('locked');
    if (sel) classes.push('selected');
    if (isSecret && secretJustUnlocked && secretUnlocked) classes.push('just-unlocked');
    card.className = classes.join(' ');

    card.innerHTML = `
      <div class="lvl-icon">${def.icon}</div>
      <div class="lvl-name">${def.name}</div>
      <div class="lvl-best">${locked ? 'LOCKED' : (best ? best.toFixed(2) + 's' : '---')}</div>
    `;

    if (!locked) {
      card.onclick = () => onSelect(def.id);
    }
    container.appendChild(card);
  }
}

// Overlay helper
export function setOverlay(html) {
  overlay.classList.remove('hidden');
  overlay.innerHTML = html;
}

export function hideOverlay() {
  overlay.classList.add('hidden');
}

// Stats box
export function updateStats(statsEl, { totalRuns, AD }) {
  if (!statsEl) return;
  if (totalRuns === 0) { statsEl.innerHTML = ''; return; }
  statsEl.innerHTML = `
    <div><span class="label">RUNS </span><span class="hi">${totalRuns}</span> · <span class="label">WINS </span><span class="hi">${AD.completions}</span></div>
    <div><span class="label">DIFF </span><span style="color:${AD.colors[AD.level]}">${AD.labels[AD.level]}</span></div>
  `;
}