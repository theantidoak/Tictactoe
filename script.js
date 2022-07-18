const gameBoard = (() => {

  //cache DOM
  const gameSquares = document.querySelectorAll('.game-square');
  const Xbutton = document.querySelector('.X-button');
  const Obutton = document.querySelector('.O-button');
  const resetButton = document.querySelector('.reset-button');

  //bind events
  Xbutton.addEventListener('click', () => gameboardArray = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X']);
  Obutton.addEventListener('click', () => gameboardArray = ['O', 'X', 'O', 'X', 'O', 'X', 'O', 'X', 'O']);
  resetButton.addEventListener('click', beginGame);
    
  function beginGame() {
    gameSquares.forEach((square) => {
      while (square.firstChild) {
        square.removeChild(square.lastChild);
      }
      gameboardArray = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'];
      square.addEventListener('click', placeMove);
    })
  }

  //render
  function placeMove() {
    const move = document.createTextNode(`${gameboardArray.pop()}`);
    this.appendChild(move);
    this.removeEventListener('click', placeMove);
    _checkWin();
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
      console.log('Win');
    }
  }

  return {placeMove};
})();
