// js/difficulty.js — Adaptive difficulty system

const diffLabel = document.getElementById('difficulty-label');

export const AD = {
  runs: 0, completions: 0, failureStreak: 0, successStreak: 0, level: 1,
  labels: ['EASY', 'NORMAL', 'HARD', 'BRUTAL'],
  colors: ['#00ff88', '#ffaa00', '#ff6600', '#ff2244'],
  get jumpPower() { return [620, 560, 520, 490][this.level]; },
  get speed()     { return [220, 260, 300, 340][this.level]; },
  get spikeBonus(){ return [0, 1, 2, 3][this.level]; },
  get timeBonus() { return [5, 0, -5, -10][this.level]; },

  update(won, tLeft) {
    this.runs++;
    if (won) {
      this.completions++;
      this.successStreak++;
      this.failureStreak = 0;
      if (tLeft > 30) this.successStreak++;
    } else {
      this.failureStreak++;
      this.successStreak = 0;
    }
    if (this.failureStreak >= 3 && this.level > 0) { this.level--; this.failureStreak = 0; }
    if (this.successStreak >= 3 && this.level < 3) { this.level++; this.successStreak = 0; }
    diffLabel.textContent = this.labels[this.level];
    diffLabel.style.color = this.colors[this.level];
  }
};
