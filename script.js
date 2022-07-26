const gameBoard = (() => {

  //cache DOM
  const gameSquares = document.querySelectorAll('.game-square');
  const startButton = document.querySelector('.start-game');
  const resetButton = document.querySelector('.reset-button');
  const main = document.querySelector('main');
  const displayResult = document.querySelector('.display-results');
  const nameButton = document.querySelector('.name-button');
  const player1Input = document.querySelector('#player-1');
  const player2Input = document.querySelector('#player-2');
  const player1Name = document.querySelector("label[for='player-1']");
  const player2Name = document.querySelector("label[for='player-2']");

  //bind events
  const addSquareListeners = () => gameSquares.forEach((square) => square.addEventListener('click', placeMove));
  const removeSquareListeners = () => gameSquares.forEach((square) => square.removeEventListener('click', placeMove));
  startButton.addEventListener('click', beginGame);
  resetButton.addEventListener('click', beginGame);
  nameButton.addEventListener('click', playWithNames);

  //render
  function placeMove(token) {
    if (checkIfEmpty(this) == false) return;
    const move = document.createTextNode(`${token}`);
    this.appendChild(move);
    _checkWin();
  }

  const checkIfEmpty = (that) => {
    console.log(that.childNodes)
    return that.childNodes.length == 1 ? false : true;
  }

  function beginGame() {
    main.style.filter = 'blur(0)';
    startButton.style.display = 'none';
    gameSquares.forEach((square) => {
      while (square.firstChild) {
        square.removeChild(square.lastChild);
      }
    });
    addSquareListeners();
  }

  function playWithNames() {
    player1Name.textContent = `${player1Input.value}`;
    player2Name.textContent = `${player2Input.value}`;
    player1Name.style.left = 0;
    player2Name.style.left = 0;
    player1Input.style.display = 'none';
    player2Input.style.display = 'none';
  }

  const _checkRows = () => {
    for (let i = 0; i < 3; i++) {
      let winningRow = [];
      for (let j = i*3; j < i*3 + 3; j++) {
        winningRow.push(gameSquares[j].textContent);
      }
      if (winningRow.every(field => field === 'X') || winningRow.every(field => field === 'O')) {
        return true;
      } 
    }
  }

  const _checkColumns = () => {
    for (let i = 0; i < 3; i++) {
      let winningColumn = [];
      for (let j = i; j < i + 7; j+=3) {
        winningColumn.push(gameSquares[j].textContent);
      }
      if (winningColumn.every(field => field === 'X') || winningColumn.every(field => field === 'O')) {
        return true;
      }
    }
  }

  const _checkDiagonals = () => {
    let firstDiagonal = [gameSquares[0].textContent, gameSquares[4].textContent, gameSquares[8].textContent]
    let secondDiagonal = [gameSquares[2].textContent, gameSquares[4].textContent, gameSquares[6].textContent]
    if (firstDiagonal.every(field => field === 'X') || secondDiagonal.every(field => field === 'X') ||
      firstDiagonal.every(field => field == 'O') || secondDiagonal.every(field  => field == 'O')) {
          return true;
        } 
  }

  function _checkWin() {
    if (_checkDiagonals() || _checkColumns() || _checkRows()) {
      displayResult.textContent = 'You Win';
      removeSquareListeners();
    } else if (!token) { // Come back here
      displayResult.textContent = 'It\'s a tie';
    }
  }

})();


const Player = (token) => {
  //cache DOM 
  gameBoard.placeMove(token);
  return {token}
}

const player1 = Player('X');
const player2 = Player('O');