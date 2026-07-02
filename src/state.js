import Gameboard from "./gameboard.js"
import Player from "./player.js"
import { renderLogEntry, updateCell, getCellElement, renderExplosion} from "./dom.js";



const gameboard = Gameboard();



const human = Player('player');
const computer = Player('computer');

let inputLocked = true;
let gameOver = false;
const log = [];




const winnerPopup = document.getElementById('win-lose-popup');
const winnerText = winnerPopup.children[0]

const statusText = document.getElementById('status-text')


const SHIP_LENGTHS = [5, 4, 3, 3, 2];

const SHIP_SKINS = ['ship-5', 'ship-4', 'submarine', 'cruiser', 'ship-2'];


let mode = "hunt";
let firstHit = null;
let direction = null;       // {dx, dy} once locked
let triedDirection = null;  // the direction we're currently probing (before it's confirmed)
let triedNeighbors = [];
let lastShot = null;

const DIRECTIONS = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 }
];

function isLegalTarget(x, y, gameboard) {
    if (x < 0 || x > 9 || y < 0 || y > 9) return false;
    const value = gameboard.board[x][y];
    const missed = gameboard.getMissedAttacks().some(a => a.x === x && a.y === y);
    return !missed && !(value !== null && value.hit);
}

function resetTargeting() {
    mode = "hunt";
    firstHit = null;
    direction = null;
    triedDirection = null;
    triedNeighbors = [];
    lastShot = null;
}

function computerMove(gameboard, container){
    let x, y;

    if (mode === "hunt") {
        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
        } while (!isLegalTarget(x, y, gameboard));
    }
    else { // mode === "target"
        if (!direction) {
            // still probing the 4 neighbors of firstHit
            const candidates = DIRECTIONS
                .map(d => ({ x: firstHit.x + d.dx, y: firstHit.y + d.dy, dir: d }))
                .filter(c => !triedNeighbors.some(t => t.x === c.x && t.y === c.y));

            const pick = candidates.find(c => isLegalTarget(c.x, c.y, gameboard));

            x = pick.x;
            y = pick.y;
            triedDirection = pick.dir;
        }
        else {
            // direction locked, walk the line
            let next = { x: lastShot.x + direction.dx, y: lastShot.y + direction.dy };

            if (!isLegalTarget(next.x, next.y, gameboard)) {
                // dead end - reverse and walk from firstHit the other way
                direction = { dx: -direction.dx, dy: -direction.dy };
                next = { x: firstHit.x + direction.dx, y: firstHit.y + direction.dy };
            }

            x = next.x;
            y = next.y;
        }
    }

    const cell = getCellElement(container, x, y);
    updateCell(x, y, gameboard, cell, false);

    const result = (gameboard.board[x][y] !== null) ? "HIT" : "MISS";
    const sunk = (result === "HIT") && gameboard.board[x][y].ship.isSunk();

    if (sunk) {
        resetTargeting();
    }
    else if (result === "HIT") {
        if (mode === "hunt") {
            mode = "target";
            firstHit = { x, y };
        }
        else if (!direction) {
            // this probe connected - lock it in as the direction
            direction = triedDirection;
        }
        lastShot = { x, y };
    }
    else { // MISS
        if (mode === "target" && !direction) {
            triedNeighbors.push({ x, y });
        }
        else if (mode === "target" && direction) {
            direction = { dx: -direction.dx, dy: -direction.dy };
            lastShot = firstHit;
        }
    }

    return { x, y, result, sunk };
}

function checkAllShipsPlaced(shipContainer){

    const hasShips = !!shipContainer.querySelector('.ship-piece')
    

    if (!hasShips) {
        shipContainer.classList.add('hidden');
        statusText.textContent = '';
        statusText.textContent = 'Click anywhere on the enemy board to launch an attack!';
        inputLocked = false;
    }

}


function handleTurn(x, y, gameboard, cell, isEnemyBoard){

    statusText.remove()

    const alreadyAttacked = gameboard.board[x][y] !== null && gameboard.board[x][y].hit ||
                             gameboard.getMissedAttacks().some(a => a.x === x && a.y === y);
    if (alreadyAttacked) return;
    

    if (gameOver) return;

    updateCell(x, y, gameboard, cell, isEnemyBoard);
    const result = (gameboard.board[x][y] !== null) ? "HIT" : "MISS";
    let logLine = (`Player attacked (${x + 1},${y + 1}) - ${result}`)
    if (result === "HIT" && gameboard.board[x][y].ship.isSunk()) {
        logLine += " - SUNK!";
    }
    log.push(logLine);


    renderLogEntry(log[log.length - 1])

    inputLocked = true;

    if(computer.gameboard.allSunk()){

        winnerPopup.style.display = 'flex';
        gameOver = true;
        renderExplosion(document.getElementById('computer-board')); 
    }

    if (gameOver) return;

    setTimeout(() => {
        const computerAttack = computerMove(human.gameboard, document.getElementById('player-board'));
        const sunkText = computerAttack.sunk ? " - SUNK!" : "";
        log.push(`Computer attacked (${computerAttack.x + 1},${computerAttack.y + 1}) - ${computerAttack.result}${sunkText}`)
        renderLogEntry(log[log.length - 1])

        if(human.gameboard.allSunk()){

            winnerPopup.style.display = 'flex';
            winnerText.textContent = 'You Lost lol!'
            gameOver = true;
            renderExplosion(document.getElementById('player-board')); 
        }
        inputLocked = false;
      }, 1000);

}





gameboard.computerPlaceShips(computer.gameboard);




export { human, computer, handleTurn, inputLocked, SHIP_LENGTHS, SHIP_SKINS, checkAllShipsPlaced };