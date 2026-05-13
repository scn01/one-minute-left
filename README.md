# ONE MINUTE LEFT

Retro arcade platformer built with vanilla JavaScript and HTML5 Canvas.

Race through handcrafted levels before the timer hits zero while your previous best run replays as a ghost beside you.

## Features

- Fast-paced 2D platforming
- Ghost replay system
- Adaptive difficulty scaling
- Secret unlockable level
- Retro CRT-inspired visuals
- Particle effects and animated UI
- Pure HTML/CSS/JavaScript (no frameworks)

## Gameplay

Each run gives you only **one minute** to reach the portal.

The game tracks your best runs and replays them as ghosts, turning every level into a race against yourself.

Difficulty adapts based on performance:
- Better runs increase the challenge
- Repeated failures reduce difficulty slightly

Explore carefully — some secrets are hidden in plain sight.

## Controls

| Key | Action |
|---|---|
| WASD / Arrow Keys | Move |
| Space / W / Up | Jump |
| R | Restart |
| ESC | Return to Menu |

## Tech Stack

- HTML5 Canvas
- Vanilla JavaScript (ES Modules)
- CSS3

## Project Structure

```txt
.
├── index.html
├── style.css
└── js
    ├── main.js
    ├── renderer.js
    ├── levels.js
    ├── difficulty.js
    └── ui.js
