// js/renderer.js — All canvas drawing

import { GAME_W, GAME_H, TILE } from './levels.js';

export function draw(ctx, { level, player, ghostFrame, particles, coins, tick, currentDef, timeLeft }) {
  const t = level.theme;
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.015)';
  ctx.lineWidth = 1;
  for (let x = 0; x < GAME_W; x += TILE) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GAME_H); ctx.stroke(); }
  for (let y = 0; y < GAME_H; y += TILE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(GAME_W, y); ctx.stroke(); }

  // Platforms
  for (const plat of level.platforms) {
    if (plat.kill) continue;
    if (plat.secret) {
      ctx.fillStyle = 'rgba(255,68,170,0.07)';
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.strokeStyle = 'rgba(255,68,170,0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(plat.x + 0.5, plat.y + 0.5, plat.w - 1, plat.h - 1);
      ctx.fillStyle = 'rgba(255,68,170,0.4)';
      ctx.font = '6px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('?', plat.x + plat.w / 2, plat.y + plat.h / 2 + 2);
      continue;
    }
    const gnd = plat.y > GAME_H - TILE * 3 + 1;
    ctx.fillStyle = gnd ? t.ground : t.plat;
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    ctx.fillStyle = gnd ? t.groundEdge : t.platEdge;
    ctx.fillRect(plat.x, plat.y, plat.w, 2);
  }

  // Spikes
  ctx.fillStyle = '#ff2244';
  for (const s of level.spikes) {
    const tw = s.w / 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      if (s.ceiling) {
        ctx.moveTo(s.x + i * tw, s.y);
        ctx.lineTo(s.x + i * tw + tw / 2, s.y + s.h);
        ctx.lineTo(s.x + i * tw + tw, s.y);
      } else {
        ctx.moveTo(s.x + i * tw, s.y + s.h);
        ctx.lineTo(s.x + i * tw + tw / 2, s.y);
        ctx.lineTo(s.x + i * tw + tw, s.y + s.h);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  // Coins
  for (const c of level.coins) {
    if (c.collected) continue;
    const pulse = 0.7 + 0.3 * Math.sin(tick * 0.06 + c.x);
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = 'rgba(255,170,0,0.3)';
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r + 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,200,0.5)';
    ctx.beginPath(); ctx.arc(c.x - 2, c.y - 2, c.r * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Portal
  const pp = level.portalPos;
  const pPulse = 0.5 + 0.5 * Math.sin(tick * 0.08);
  const pCol  = level.isSecret ? '#ff44aa' : '#00ff88';
  const pGlow = level.isSecret ? 'rgba(255,68,170,0.15)' : 'rgba(0,255,136,0.15)';
  ctx.save();
  ctx.globalAlpha = 0.2 + pPulse * 0.3;
  ctx.fillStyle = pCol;
  ctx.fillRect(pp.x - 18, pp.y - 32, 36, 64);
  ctx.restore();
  ctx.strokeStyle = pCol; ctx.lineWidth = 2;
  ctx.strokeRect(pp.x - 14, pp.y - 28, 28, 56);
  ctx.fillStyle = pGlow;
  ctx.fillRect(pp.x - 10, pp.y - 24, 20, 48);
  ctx.fillStyle = pCol;
  ctx.font = '10px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('▲', pp.x, pp.y - 8);
  ctx.fillText('▲', pp.x, pp.y + 8);

  // Ghost
  if (ghostFrame) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = level.isSecret ? 'rgba(255,100,200,0.3)' : 'rgba(100,200,255,0.35)';
    ctx.fillRect(ghostFrame.x, ghostFrame.y, player.w, player.h);
    ctx.strokeStyle = level.isSecret ? 'rgba(255,100,200,0.7)' : 'rgba(100,200,255,0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(ghostFrame.x + 0.5, ghostFrame.y + 0.5, player.w - 1, player.h - 1);
    ctx.fillStyle = 'rgba(200,240,255,0.6)';
    const gex = ghostFrame.fx ? ghostFrame.x + player.w - 6 : ghostFrame.x + 2;
    ctx.fillRect(gex, ghostFrame.y + 5, 4, 4);
    ctx.restore();
  }

  // Player
  const px = Math.round(player.x), py = Math.round(player.y);
  ctx.fillStyle = 'rgba(255,170,0,0.08)';
  ctx.fillRect(px - 2, py + player.h - 2, player.w + 4, 6);
  ctx.fillStyle = '#ffaa00';
  ctx.fillRect(px, py, player.w, player.h);
  ctx.fillStyle = 'rgba(255,255,200,0.3)';
  ctx.fillRect(px + 2, py + 2, player.w - 6, 4);
  const ex = player.facingRight ? px + player.w - 6 : px + 2;
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(ex, py + 5, 4, 4);
  if (Math.abs(player.vx) > 20) {
    const lp = Math.sin(tick * 0.25) > 0;
    ctx.fillStyle = '#cc7700';
    ctx.fillRect(px + 2,             py + player.h, 5, lp ? 4 : 2);
    ctx.fillRect(px + player.w - 7,  py + player.h, 5, lp ? 2 : 4);
  }

  // Particles
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r);
    ctx.restore();
  }

  // Red vignette when time is low
  if (timeLeft < 10 && timeLeft > 0) {
    ctx.save();
    ctx.globalAlpha = 0.04 * (1 - timeLeft / 10) * (Math.sin(tick * 0.3) * 0.5 + 0.5);
    ctx.fillStyle = '#ff2244';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    ctx.restore();
  }

  // Level label (secret)
  if (t.label) {
    ctx.font = '7px "Press Start 2P"';
    ctx.fillStyle = 'rgba(255,68,170,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText(t.label, GAME_W / 2, 18);
  }

  // Coin count HUD
  ctx.font = '7px "Press Start 2P"';
  ctx.fillStyle = 'rgba(255,170,0,0.7)';
  ctx.textAlign = 'right';
  ctx.fillText('COINS ' + coins, GAME_W - 8, 14);

  // Level name watermark
  if (currentDef) {
    ctx.font = '6px "Press Start 2P"';
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.textAlign = 'left';
    ctx.fillText(currentDef.name, 8, GAME_H - 8);
  }
}