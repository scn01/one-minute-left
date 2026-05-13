// js/levels.js — Level definitions and shared constants

export const GAME_W = 800, GAME_H = 450, TILE = 20;
export const GRAVITY = 1400, TIME_LIMIT = 60;

export const LEVEL_DEFS = [
  {
    id: 0, name: 'FLATLANDS', icon: '▬',
    theme: { bg: '#050505', ground: '#1a1a1a', groundEdge: '#ff2244', plat: '#222', platEdge: '#ffaa00', label: null },
    build(sb) {
      const spikes = [];
      [260, 360, 470, 570, 660, 720].slice(0, 2 + sb).forEach(x => spikes.push({ x, y: GAME_H - TILE * 3 - 8, w: 16, h: 8 }));
      return {
        playerStart: { x: 60, y: GAME_H - TILE * 3 - 28 },
        portalPos:   { x: GAME_W - 55, y: GAME_H - TILE * 3 - 56 },
        platforms: [
          { x: 0,   y: GAME_H - TILE * 3, w: GAME_W, h: TILE * 3 },
          { x: 120, y: GAME_H - TILE * 3 - 80,  w: 100, h: TILE },
          { x: 280, y: GAME_H - TILE * 3 - 140, w: 90,  h: TILE },
          { x: 420, y: GAME_H - TILE * 3 - 80,  w: 100, h: TILE },
          { x: 560, y: GAME_H - TILE * 3 - 160, w: 80,  h: TILE },
          { x: 680, y: GAME_H - TILE * 3 - 100, w: 100, h: TILE },
          { x: 55,  y: GAME_H - TILE * 3 - 140, w: 35,  h: TILE },
          { x: 55,  y: GAME_H - TILE * 3 - 200, w: 40,  h: TILE, secret: true },
        ],
        spikes,
        coins: [
          { x: 165, y: GAME_H - TILE * 3 - 108, r: 6, collected: false },
          { x: 330, y: GAME_H - TILE * 3 - 170, r: 6, collected: false },
          { x: 470, y: GAME_H - TILE * 3 - 108, r: 6, collected: false },
          { x: 610, y: GAME_H - TILE * 3 - 188, r: 6, collected: false },
          { x: 730, y: GAME_H - TILE * 3 - 128, r: 6, collected: false },
        ],
      };
    }
  },

  {
    id: 1, name: 'THE PIT', icon: '▼',
    theme: { bg: '#020805', ground: '#0e1a0e', groundEdge: '#00ff88', plat: '#0d1a0d', platEdge: '#00cc66', label: null },
    build(sb) {
      const spikes = [];
      [200, 280, 490, 570].slice(0, 1 + sb).forEach(x => spikes.push({ x, y: GAME_H - TILE * 3 - 8, w: 16, h: 8 }));
      for (let i = 0; i < sb; i++) spikes.push({ x: 300 + i * 130, y: TILE + 4, w: 16, h: 8, ceiling: true });
      return {
        playerStart: { x: 50,          y: GAME_H - TILE * 3 - 28 },
        portalPos:   { x: GAME_W - 40, y: 30 },
        platforms: [
          { x: 0,           y: GAME_H - TILE * 3, w: GAME_W,     h: TILE * 3 },
          { x: 0,           y: 0,                 w: TILE,        h: GAME_H },
          { x: GAME_W-TILE, y: 0,                 w: TILE,        h: GAME_H },
          { x: 0,           y: 0,                 w: GAME_W,      h: TILE },
          { x: TILE, y: 330, w: 90, h: TILE },
          { x: TILE, y: 265, w: 70, h: TILE },
          { x: TILE, y: 200, w: 60, h: TILE },
          { x: TILE, y: 140, w: 55, h: TILE },
          { x: 160,  y: 185, w: 120, h: TILE },
          { x: 330,  y: 135, w: 100, h: TILE },
          { x: 480,  y: 80,  w: 80,  h: TILE },
          { x: 610,  y: 80,  w: 80,  h: TILE },
          { x: 690,  y: TILE, w: 90, h: TILE },
        ],
        spikes,
        coins: [
          { x: 80,  y: 310, r: 6, collected: false },
          { x: 80,  y: 180, r: 6, collected: false },
          { x: 220, y: 165, r: 6, collected: false },
          { x: 380, y: 115, r: 6, collected: false },
          { x: 530, y: 60,  r: 6, collected: false },
        ],
      };
    }
  },

  {
    id: 2, name: 'ABYSSAL', icon: '◆',
    theme: { bg: '#020208', ground: '#0a0a1e', groundEdge: '#44aaff', plat: '#0d0d22', platEdge: '#2266cc', label: null },
    build(sb) {
      const spikes = [];
      [340, 440, 530, 620, 700, 760].slice(0, 2 + sb).forEach(x => spikes.push({ x, y: GAME_H - TILE * 3 - 8, w: 16, h: 8 }));
      return {
        playerStart: { x: 60,          y: GAME_H - TILE * 3 - 28 },
        portalPos:   { x: GAME_W - 55, y: GAME_H - TILE * 3 - 56 },
        platforms: [
          { x: 0,           y: GAME_H - TILE * 3, w: 330,           h: TILE * 3 },
          { x: GAME_W - 230,y: GAME_H - TILE * 3, w: 230,           h: TILE * 3 },
          { x: 330, y: GAME_H - 2, w: GAME_W - 560, h: 2, kill: true },
          { x: 150, y: GAME_H - TILE * 3 - 60,  w: 70, h: TILE },
          { x: 255, y: GAME_H - TILE * 3 - 120, w: 65, h: TILE },
          { x: 355, y: GAME_H - TILE * 3 - 180, w: 65, h: TILE },
          { x: 455, y: GAME_H - TILE * 3 - 120, w: 65, h: TILE },
          { x: 555, y: GAME_H - TILE * 3 - 60,  w: 70, h: TILE },
          { x: 345, y: GAME_H - TILE * 3 - 235, w: 65, h: TILE },
          { x: 345, y: GAME_H - TILE * 3 - 290, w: 65, h: TILE },
        ],
        spikes,
        coins: [
          { x: 185, y: GAME_H - TILE * 3 - 88,  r: 6, collected: false },
          { x: 288, y: GAME_H - TILE * 3 - 148, r: 6, collected: false },
          { x: 388, y: GAME_H - TILE * 3 - 208, r: 6, collected: false },
          { x: 488, y: GAME_H - TILE * 3 - 148, r: 6, collected: false },
          { x: 378, y: GAME_H - TILE * 3 - 318, r: 6, collected: false },
        ],
      };
    }
  },

  {
    id: 3, name: 'GAUNTLET', icon: '★',
    theme: { bg: '#080200', ground: '#1a0a00', groundEdge: '#ff6600', plat: '#1a0800', platEdge: '#cc4400', label: null },
    build(sb) {
      const spikes = [];
      [100,150,210,270,330,390,450,510,570,630,690,730,760].slice(0, 6 + sb).forEach(x =>
        spikes.push({ x, y: GAME_H - TILE * 3 - 8, w: 14, h: 8 })
      );
      return {
        playerStart: { x: 30,          y: GAME_H - TILE * 3 - 28 },
        portalPos:   { x: GAME_W - 40, y: GAME_H - TILE * 3 - 56 },
        platforms: [
          { x: 0,           y: GAME_H - TILE * 3, w: 90,            h: TILE * 3 },
          { x: GAME_W - 80, y: GAME_H - TILE * 3, w: 80,            h: TILE * 3 },
          { x: 88, y: GAME_H - 2, w: GAME_W - 168, h: 2, kill: true },
          { x: 88,  y: GAME_H - TILE * 3 - 70,  w: 40, h: TILE },
          { x: 165, y: GAME_H - TILE * 3 - 120, w: 35, h: TILE },
          { x: 238, y: GAME_H - TILE * 3 - 170, w: 35, h: TILE },
          { x: 311, y: GAME_H - TILE * 3 - 220, w: 35, h: TILE },
          { x: 390, y: GAME_H - TILE * 3 - 270, w: 40, h: TILE },
          { x: 470, y: GAME_H - TILE * 3 - 220, w: 35, h: TILE },
          { x: 544, y: GAME_H - TILE * 3 - 170, w: 35, h: TILE },
          { x: 618, y: GAME_H - TILE * 3 - 120, w: 35, h: TILE },
          { x: 695, y: GAME_H - TILE * 3 - 70,  w: 40, h: TILE },
        ],
        spikes,
        coins: [
          { x: 108, y: GAME_H - TILE * 3 - 98,  r: 6, collected: false },
          { x: 237, y: GAME_H - TILE * 3 - 198, r: 6, collected: false },
          { x: 410, y: GAME_H - TILE * 3 - 298, r: 6, collected: false },
          { x: 562, y: GAME_H - TILE * 3 - 198, r: 6, collected: false },
          { x: 713, y: GAME_H - TILE * 3 - 98,  r: 6, collected: false },
        ],
      };
    }
  },

  {
    id: 'secret', name: 'SECRET', icon: '?',
    theme: { bg: '#080005', ground: '#1a0011', groundEdge: '#ff44aa', plat: '#1a0011', platEdge: '#cc2288', label: '★ SECRET LEVEL ★' },
    build() {
      return {
        playerStart: { x: 60,          y: GAME_H - TILE * 3 - 28 },
        portalPos:   { x: GAME_W - 80, y: 60 },
        platforms: [
          { x: 0,   y: GAME_H - TILE * 3, w: GAME_W, h: TILE * 3 },
          { x: 100, y: 320, w: 80, h: TILE },
          { x: 240, y: 270, w: 70, h: TILE },
          { x: 360, y: 210, w: 80, h: TILE },
          { x: 480, y: 160, w: 70, h: TILE },
          { x: 600, y: 110, w: 80, h: TILE },
          { x: 700, y: 60,  w: 80, h: TILE },
        ],
        spikes: [
          { x: 160, y: 312, w: 16, h: 8 }, { x: 320, y: 262, w: 16, h: 8 },
          { x: 450, y: 202, w: 16, h: 8 }, { x: 570, y: 152, w: 16, h: 8 },
        ],
        coins: [
          { x: 140, y: 300, r: 6, collected: false }, { x: 280, y: 250, r: 6, collected: false },
          { x: 420, y: 190, r: 6, collected: false }, { x: 540, y: 140, r: 6, collected: false },
          { x: 660, y: 90,  r: 6, collected: false },
        ],
      };
    }
  }
];