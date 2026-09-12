Battleship

A browser-based Battleship game built with vanilla JavaScript, HTML5 Drag & Drop, and Webpack. Play against a computer opponent with full ship placement, turn-based combat, and a live move log. Built according to the steps outlined in the Odin Project.

Features
Drag-and-drop ship placement — drag ships from the staging area onto your board, hold Shift to rotate horizontal/vertical, with a live ghost-outline preview
Computer opponent — randomly places its own ships (legally, no overlaps/off-grid) and takes turns attacking after you
Turn-based combat — click the enemy board to attack, with hit/miss/sunk feedback
Move log — scrolling log of every attack, including sunk-ship announcements
Win/loss detection — popup when all of one side's ships are sunk
Tech Stack
Vanilla JavaScript (ES modules)
Webpack + webpack-dev-server
HTML5 Drag and Drop API
CSS Grid for board layout
Architecture
ship.js — Ship factory (hits, sunk status)
gameboard.js — Gameboard factory (10x10 board, ship placement with validation, attack handling)
player.js — Player factory (wraps a gameboard)
state.js — game state and logic (turns, locking, win conditions, log) — no DOM code
dom.js — all rendering and DOM event handling — no game logic
index.js — entry point, wires everything together
