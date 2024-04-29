/**
 * Selects all elements with the class "piece" and assigns them to draggableElements.
 * Initializes pocetnaPozicija, draggedElement, and playerTurn variables.
 * Selects the element with the class 'player-turn' and assigns it to playerTurnText.
 */

let pocetnaPozicija;
let draggedElement;
let playerTurn = "white";
let playerTurnText = document.querySelector('.player-turn');
const chessText = document.querySelector("h1");

/**
 * Function to add or remove event listeners based on the current player's turn.
 * @param {string} trenutni - The current player's turn ("white" or "black").
 */
function playerTurns(trenutni) {
  const blackPieces = document.querySelectorAll('[id^="b"]');
  const whitePieces = document.querySelectorAll('[id^="w"]');
  if (trenutni == "white") {
    blackPieces.forEach(piece => {
      piece.removeEventListener('dragstart', dragFunction);
      piece.removeEventListener('dragover', dragOver);
    });

    whitePieces.forEach(piece => {
      piece.addEventListener('dragstart', dragFunction);
      piece.addEventListener('dragover', dragOver);
    });
  } else {
    blackPieces.forEach(piece => {
      piece.addEventListener('dragstart', dragFunction);
      piece.addEventListener('dragover', dragOver);
    });
    whitePieces.forEach(piece => {
      piece.removeEventListener('dragstart', dragFunction);
      piece.removeEventListener('dragover', dragOver);
    });
  }

  playerTurnText.innerText = `${playerTurn} player turn`;
}

//Function for the reset button
function reset() {
  location.reload();
}

chessText.addEventListener("click", reset);


// Prikazivanje popup-a

// Start the game with white's turn
playerTurns("white");

// Add event listeners to the board
const board = document.querySelector('.board');
board.addEventListener('dragover', dragOver);
board.addEventListener('drop', dropOver);

/**
 * Function to handle the dragstart event.
 * @param {Event} e - The dragstart event.
 */
function dragFunction(e) {
  document.querySelectorAll('.piece').forEach(piece => piece.style.opacity = '1');
  e.target.style.opacity = '0.5';
  pocetnaPozicija = e.target.parentNode.id;
  draggedElement = e.target;
}

function noPieceBetween(start, end, rowDiff, colDiff) {
  let increment = colDiff === 0 ? 8 : 1; // za vertikalno i horizontalno kretanje
  let step = (end > start) ? increment : -increment; // određuje smer provere

  // Dijagonalno kretanje ima različitu logiku za proveru
  if (colDiff !== 0 && rowDiff !== 0) {
    increment = 9; // za dijagonalno dolje-desno
    if (colDiff < 0 && rowDiff > 0) increment = 7; // dijagonalno dolje-levo
    if (colDiff > 0 && rowDiff < 0) increment = -7; // dijagonalno gore-desno
    if (colDiff < 0 && rowDiff < 0) increment = -9; // dijagonalno gore-levo
    step = (end > start) ? increment : -increment;
  }

  // Proveravamo svako polje između starta i kraja, ali ne uključujemo krajnje polje
  let current = start + step;
  while (current !== end) {
    if (document.getElementById(`box-${current}`).firstElementChild) {
      return false; // pronašli smo figuru na putu
    }
    current += step;
  }
  return true; // nema figura na putu
}

/**
 * Function to handle the drop event.
 * @param {Event} e - The drop event.
 */
function piecesMove(id, dropZone) {
  let child = dropZone.firstElementChild;
  let start = parseInt(pocetnaPozicija.replace('box-', ''));
  let end = parseInt(dropZone.id.replace('box-', ''));
  let validMove = false;

  let rowDiff = Math.floor((end - 1) / 8) - Math.floor((start - 1) / 8);
  let colDiff = (end - 1) % 8 - (start - 1) % 8;
  console.log(`rowDiff: ${rowDiff} colDiff: ${colDiff}`);
  console.log(`start: ${start} end: ${end}`);

  let izracunaj = Math.abs(end - start);
  switch (id.charAt(1)) {
    case 'p': //Pawn

      if (id.startsWith('wp') || id.startsWith('bp')) {
        if (izracunaj == 8 && !child) {
          validMove = true;
        } else if ((izracunaj == 16 && !child && Math.abs(start) <= 16) || (id.startsWith('bp') && izracunaj == 16 && !child && Math.abs(start) >= 49)) {
          validMove = true;
        } else if ((Math.abs(izracunaj) == 7 && child) || (Math.abs(izracunaj) == 9 && child)) {
          validMove = true;
        }
      }
      break;
    case 'r': // Rooks
      if (noPieceBetween(start, end, rowDiff, colDiff)) {

        validMove = (rowDiff == 0 || colDiff == 0);
      }
      break;
    case 'n': // Horses
      validMove = (Math.abs(rowDiff) == 2 && Math.abs(colDiff) == 1) || (Math.abs(rowDiff) == 1 && Math.abs(colDiff) == 2);
      break;
    case 'b': // Bishop
      if (Math.abs(rowDiff) === Math.abs(colDiff)) {
        validMove = noPieceBetween(start, end, rowDiff, colDiff);
      }
      break;
    case 'q': // Queen
      if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
        validMove = noPieceBetween(start, end, rowDiff, colDiff);
      }
      break;
    case 'k': // King
      validMove = Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
      break;

    default:
      break;


  }
  if (validMove) {
    if (child && child.id.charAt(0) === id.charAt(0)) {
      console.log("Not a valid move. Same color piece in the way.");
      return;
    }
    if (child) {
      let removedChild = dropZone.children[0];
      eatenPieces(removedChild.id);
      dropZone.removeChild(child); // remove the child from the drop zone
    }

    dropZone.appendChild(draggedElement);
    draggedElement.style.opacity = '1'; //
    updatePlayerTurn();
  } else {
    console.log("Invalind move.");
  }

}

// Object to keep track of the number of captured pieces.
let eatenPiecesCount = {
  'wp': 0, 'bp': 0, 'wr': 0, 'br': 0, 'wn': 0, 'bn': 0, 'wb': 0, 'bb': 0, 'wq': 0, 'bq': 0,
};

// This function is used to handle captured pieces.
// It updates a count of captured pieces and displays them in a sidebar.
function eatenPieces(piece) {

  const color = piece.charAt(0);
  const type = piece.charAt(1);
  let eatenPiecObject = piece.substring(0, 2)

  eatenPiecesCount[eatenPiecObject]++;
  const container = document.querySelector(`.side-bar__${color}`);
  const containerList = document.querySelector(`.side-bar__${color}__pieces__list`);
  let spanElement = document.createElement('span');
  let imgElement = document.createElement('img');
  container.style.display = 'block';

  let imgSrc = `../img/${color + type}.png`
  if (containerList.querySelector(`img[src="${imgSrc}"]`)) {
    let imgElement = containerList.querySelector(`img[src="${imgSrc}"]`);
    let spanElement = imgElement.nextElementSibling;
    spanElement.innerText = eatenPiecesCount[eatenPiecObject];

    console.log("Contains");

  } else {
    // Dodajte img element u containerList ako ne postoji
    imgElement.src = imgSrc;
    imgElement.classList.add('piece');
    spanElement.innerText = eatenPiecesCount[eatenPiecObject];
    containerList.appendChild(imgElement);
    containerList.appendChild(spanElement);


  }


  console.log(eatenPiecesCount);


  /*eatenPiece.classList.add('side-bar__white__pieces__list__item');
  eatenPiece.innerHTML =`<img src="../img/${img}.png" class="piece"/><span></span>`;*/


}


// This function is used to switch the player's turn after a valid move has been made.
function updatePlayerTurn() {
  playerTurn = playerTurn === "white" ? "black" : "white";
  playerTurns(playerTurn);
}


// This function is used to handle the dragover event.
// It is used to allow the drop event to occur on the board squares.
function dropOver(e) {
  e.stopPropagation();
  e.preventDefault();
  let dropZone = e.target.closest('.box');
  if (!dropZone || !dropZone.classList.contains('box')) {
    console.log("Drop zone not identified.");
    return;
  }

  // Provjera je li element koji se vuce odgovarajuce boje za trenutni potez
  if ((playerTurn === "white" && !draggedElement.id.startsWith('w')) || (playerTurn === "black" && !draggedElement.id.startsWith('b'))) {
    console.log("Not the correct player's turn");
    return;
  }

  // Provjera valjanosti poteza za figuru
  let potez = draggedElement.id;
  piecesMove(potez, dropZone);

  playerTurns(playerTurn);
}


/**
 * Function to handle the dragover event.
 * @param {Event} e - The dragover event.
 */
function dragOver(e) {
  e.target.style.opacity = '1';
  e.preventDefault();
}

const socket = io('http://localhost:3000');

socket.on('moveMade', (move) => {
  // Obradite primljeni potez i ažurirajte šahovsku tablu
});

function sendMove(move) {
  // Šalje potez na server kada igrač napravi potez
  socket.emit('moveMade', move);
}

