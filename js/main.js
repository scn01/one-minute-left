// js/main.js — Game loop, physics, state management

import { GAME_W, GAME_H, GRAVITY, TILE, TIME_LIMIT, LEVEL_DEFS } from './levels.js';
import { AD } from './difficulty.js';
import { draw } from './renderer.js';
import { renderLevelSelectCards, setOverlay, hideOverlay, updateStats, showSecretToast } from './ui.js';

const canvas   = document.getElementById('gameCanvas');
const ctx      = canvas.getContext('2d');
const timerVal = document.getElementById('timer-val');
const bestVal  = document.getElementById('best-val');
const lvlVal   = document.getElementById('lvl-val');
const diffLabel= document.getElementById('difficulty-label');

canvas.width  = GAME_W;
canvas.height = GAME_H;
window.addEventListener('resize', () => { canvas.width = GAME_W; canvas.height = GAME_H; });

diffLabel.textContent = AD.labels[AD.level];
diffLabel.style.color  = AD.colors[AD.level];

// Game-wide state 
let state = 'menu', rafId = null, lastTime = 0;
let selectedLevelId = 0;
let secretUnlocked = false;
let secretJustUnlocked = false; // flag: show highlight until user dismisses menu

const levelBests = {};
const levelRuns  = {};

// Per-run state 
let level, player, timeLeft, ghostFrames, ghostPlayback;
let coins, particles, won;
let storedGhosts = {}, tick = 0, ghostFrame = null, jumpHeld = false;
let currentDef = null;
let secretTriggerCount = 0, secretTriggered = false;

// Input 
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (state === 'playing') {
    if (e.code === 'KeyR')    { endRun(false, true); return; }
    if (e.code === 'Escape')  { endRun(false, true); showMainMenu(); return; }
  }
  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

const isLeft  = () => keys['ArrowLeft']  || keys['KeyA'];
const isRight = () => keys['ArrowRight'] || keys['KeyD'];
const isJump  = () => keys['Space'] || keys['ArrowUp'] || keys['KeyW'];

// Physics helpers 
function rectOv(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function resolveAABB(p, plat) {
  if (!rectOv(p.x, p.y, p.w, p.h, plat.x, plat.y, plat.w, plat.h)) return;
  const oL = (p.x + p.w) - plat.x, oR = (plat.x + plat.w) - p.x;
  const oT = (p.y + p.h) - plat.y, oB = (plat.y + plat.h) - p.y;
  const mH = Math.min(oL, oR), mV = Math.min(oT, oB);
  if (mV <= mH) {
    if (oT < oB) { p.y = plat.y - p.h; if (p.vy > 0) p.vy = 0; p.onGround = true; }
    else         { p.y = plat.y + plat.h; if (p.vy < 0) p.vy = 0; }
  } else {
    if (oL < oR) { p.x = plat.x - p.w; if (p.vx > 0) p.vx = 0; }
    else         { p.x = plat.x + plat.w; if (p.vx < 0) p.vx = 0; }
  }
}

// Particles 
function spawnP(x, y, color, n = 8) {
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
    const s = 60 + Math.random() * 120;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: 1, decay: 0.8 + Math.random() * 0.8, color, r: 3 + Math.random() * 3 });
  }
}
function updateP(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= p.decay * dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// Ghost 
function recordGhost() {
  ghostFrames.push({ x: player.x, y: player.y, fx: player.facingRight, t: timeLeft });
}
function stepGhost() {
  if (!ghostPlayback) return null;
  const g = ghostPlayback;
  if (g.idx >= g.frames.length) return null;
  const f = g.frames[g.idx];
  const total = TIME_LIMIT + (level.isSecret ? 0 : AD.timeBonus);
  if (total - f.t <= total - timeLeft) g.idx++;
  return f;
}
function trySaveGhost(elapsed) {
  const id = currentDef.id;
  const prev = levelBests[id];
  if (prev === undefined || elapsed < prev) {
    levelBests[id] = elapsed;
    storedGhosts[id] = ghostFrames.slice();
    bestVal.textContent = elapsed.toFixed(2) + 's';
  }
}

// Init game 
function initGame(levelId) {
  selectedLevelId = levelId;
  currentDef = LEVEL_DEFS.find(d => d.id === levelId);
  const isSecret = levelId === 'secret';
  const rawData = currentDef.build(isSecret ? 0 : AD.spikeBonus);

  level = { ...rawData, theme: currentDef.theme, isSecret };
  for (const c of level.coins) c.collected = false;

  const sp = level.playerStart;
  player = { x: sp.x, y: sp.y, w: 18, h: 22, vx: 0, vy: 0, onGround: false, facingRight: true };
  timeLeft = TIME_LIMIT + (isSecret ? 0 : AD.timeBonus);
  ghostFrames = [];
  ghostPlayback = storedGhosts[levelId] ? { frames: storedGhosts[levelId], idx: 0 } : null;
  coins = 0; particles = []; won = false;
  secretTriggerCount = 0; secretTriggered = false;

  lvlVal.textContent = currentDef.name;
  const eb = levelBests[levelId];
  bestVal.textContent = eb ? eb.toFixed(2) + 's' : '--';

  state = 'playing';
  hideOverlay();
  startLoop();
}

// Update 
function update(dt) {
  if (dt > 0.05) dt = 0.05;
  timeLeft -= dt;
  timerVal.textContent = Math.max(0, timeLeft).toFixed(2);
  timerVal.classList.toggle('urgent', timeLeft < 10);
  if (timeLeft <= 0 && !won) { endRun(false, false); return; }

  if (isLeft())       { player.vx = -AD.speed; player.facingRight = false; }
  else if (isRight()) { player.vx =  AD.speed; player.facingRight = true;  }
  else                { player.vx *= 0.7; }

  if (isJump() && player.onGround && !jumpHeld) {
    player.vy = -AD.jumpPower; jumpHeld = true;
    spawnP(player.x + player.w / 2, player.y + player.h, '#ffaa00', 5);
  }
  if (!isJump()) jumpHeld = false;

  player.vy += GRAVITY * dt;
  player.x  += player.vx * dt;
  player.y  += player.vy * dt;
  player.onGround = false;

  let onSecretThisFrame = false;
  for (const plat of level.platforms) {
    if (plat.kill) {
      if (rectOv(player.x, player.y, player.w, player.h, plat.x, plat.y, plat.w, plat.h)) {
        spawnP(player.x + player.w / 2, player.y + player.h / 2, '#ff2244', 12);
        player.x = level.playerStart.x; player.y = level.playerStart.y;
        player.vx = 0; player.vy = 0; timeLeft -= 3;
      }
      continue;
    }
    resolveAABB(player, plat);
    if (plat.secret && player.onGround &&
        rectOv(player.x, player.y + player.h - 1, player.w, 2, plat.x, plat.y, plat.w, plat.h)) {
      onSecretThisFrame = true;
    }
  }

  // Secret block — count each distinct landing
  if (onSecretThisFrame && !player._wasOnSecret) {
    secretTriggerCount++;
    if (secretTriggerCount >= 3 && !secretTriggered) {
      secretTriggered = true;
      const sp2 = level.platforms.find(p => p.secret);
      spawnP(sp2 ? sp2.x + sp2.w / 2 : player.x, sp2 ? sp2.y : player.y, '#ff44aa', 24);

      // Unlock but let the player finish the level first
      secretUnlocked = true;
      secretJustUnlocked = true;

      // Show an in-game toast so the player knows something happened
      showSecretToast('★ SECRET LEVEL UNLOCKED ★');
    }
  }
  player._wasOnSecret = onSecretThisFrame;

  // Bounds
  if (player.x < 0)               { player.x = 0;             player.vx = 0; }
  if (player.x + player.w > GAME_W) { player.x = GAME_W - player.w; player.vx = 0; }
  if (player.y > GAME_H + 20)     { player.y = level.playerStart.y; player.vy = 0; }

  // Spikes
  for (const s of level.spikes) {
    if (rectOv(player.x + 2, player.y + 2, player.w - 4, player.h - 4, s.x, s.y, s.w, s.h)) {
      spawnP(player.x + player.w / 2, player.y + player.h / 2, '#ff2244', 12);
      player.x = level.playerStart.x; player.y = level.playerStart.y;
      player.vx = 0; player.vy = 0; timeLeft -= 3;
    }
  }

  // Coins
  for (const c of level.coins) {
    if (!c.collected && rectOv(player.x, player.y, player.w, player.h, c.x - c.r, c.y - c.r, c.r * 2, c.r * 2)) {
      c.collected = true; coins++;
      spawnP(c.x, c.y, '#ffaa00', 6);
    }
  }

  // Portal
  const pp = level.portalPos;
  if (rectOv(player.x, player.y, player.w, player.h, pp.x - 14, pp.y - 28, 28, 56)) {
    endRun(true, false);
    return;
  }

  recordGhost();
  ghostFrame = stepGhost();
  updateP(dt);
}

// End run 
function endRun(didWin, forced) {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  state = 'menu'; won = didWin;
  if (!forced) {
    AD.update(didWin, timeLeft);
    if (!levelRuns[currentDef.id]) levelRuns[currentDef.id] = 0;
    levelRuns[currentDef.id]++;
    if (didWin) {
      const total = TIME_LIMIT + (level.isSecret ? 0 : AD.timeBonus);
      trySaveGhost(total - timeLeft);
    }
    showResultMenu(didWin);
  }
}

// Loop 
function loop(ts) {
  if (state !== 'playing') return;
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  tick++;
  draw(ctx, { level, player, ghostFrame, particles, coins, tick, currentDef, timeLeft });
  rafId = requestAnimationFrame(loop);
}
function startLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  lastTime = performance.now();
  rafId = requestAnimationFrame(loop);
}

// Menus 
function totalRunCount() {
  return Object.values(levelRuns).reduce((a, b) => a + b, 0);
}

export function showMainMenu() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  state = 'menu';

  setOverlay(`
    <h1>ONE <span>MINUTE</span> LEFT</h1>
    <p>Race to the portal before time runs out.<br>Your ghost haunts every attempt.</p>
    <div id="ls-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;width:100%;max-width:540px"></div>
    <div id="btn-row"><button class="btn" id="btn-play">► PLAY</button></div>
    <p class="muted">WASD / ARROWS · SPACE jump · R restart · ESC menu<br>In FLATLANDS, find the faint pink block and land on it 3 times...</p>
    <div id="stats-box"></div>
  `);

  const grid = document.getElementById('ls-grid');
  const renderCards = () => renderLevelSelectCards(grid, {
    levelBests, secretUnlocked, selectedLevelId, secretJustUnlocked,
    onSelect: (id) => { selectedLevelId = id; renderCards(); }
  });
  renderCards();

  document.getElementById('btn-play').onclick = () => {
    const def = LEVEL_DEFS.find(d => d.id === selectedLevelId);
    if (def && !(def.id === 'secret' && !secretUnlocked)) {
      // Clear the "just unlocked" highlight once the player actively picks a level
      secretJustUnlocked = false;
      initGame(selectedLevelId);
    }
  };

  updateStats(document.getElementById('stats-box'), { totalRuns: totalRunCount(), AD });
}

function showResultMenu(didWin) {
  const total   = TIME_LIMIT + (level.isSecret ? 0 : AD.timeBonus);
  const elapsed = (total - timeLeft).toFixed(2);
  const best    = levelBests[currentDef.id];

  const secretBanner = secretJustUnlocked
    ? `<p class="unlock-msg" style="animation:none;color:var(--pink)">★ SECRET LEVEL UNLOCKED — check level select ★</p>`
    : '';

  setOverlay(`
    <h1>${didWin
      ? (level.isSecret ? '★ SECRET <span>CLEARED</span> ★' : 'TIME <span>CLEARED!</span>')
      : 'TIME <span>\'S UP</span>'}</h1>
    ${secretBanner}
    <p>${didWin
      ? `Completed in <strong style="color:var(--green)">${elapsed}s</strong> with ${coins} coin${coins !== 1 ? 's' : ''}`
      : timeLeft <= 0 ? 'You ran out of time.' : 'You reset.'}</p>
    <p class="muted">${currentDef.name} · Best: ${best ? best.toFixed(2) + 's' : '--'} · ${AD.labels[AD.level]}</p>
    <div id="btn-row">
      <button class="btn ${didWin ? '' : 'red'}" id="btn-again">${didWin ? '► PLAY AGAIN' : '► TRY AGAIN'}</button>
      <button class="btn ghost" id="btn-levels">LEVEL SELECT</button>
    </div>
    <div id="stats-box"></div>
  `);

  document.getElementById('btn-again').onclick  = () => { secretJustUnlocked = false; initGame(currentDef.id); };
  document.getElementById('btn-levels').onclick = () => showMainMenu();
  updateStats(document.getElementById('stats-box'), { totalRuns: totalRunCount(), AD });
}

// Boot 
showMainMenu();