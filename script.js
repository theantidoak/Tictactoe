const gameBoard = (() => {
  const gameboardArray = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'];

  //cache DOM
  const gameSquares = document.querySelectorAll('.game-square');

  //bind events
  gameSquares.forEach(square => {
      square.addEventListener('click', placeMove);
  });

  //render
  function placeMove() {
    const move = document.createTextNode(`${gameboardArray.pop()}`);
    this.appendChild(move);
    this.removeEventListener('click', placeMove);
    checkWin();
  }

  function checkWin() {
    if ((gameSquares[0].textContent == gameSquares[1].textContent && 
      gameSquares[0].textContent == gameSquares[2].textContent && 
      gameSquares[0].textContent !== '') ||
    (gameSquares[0].textContent == gameSquares[3].textContent && 
      gameSquares[0].textContent == gameSquares[6].textContent && 
      gameSquares[0].textContent !== '') || 
    (gameSquares[0].textContent == gameSquares[4].textContent && 
      gameSquares[0].textContent == gameSquares[8].textContent && 
      gameSquares[0].textContent !== '') ||
    (gameSquares[1].textContent == gameSquares[4].textContent && 
      gameSquares[1].textContent == gameSquares[7].textContent && 
      gameSquares[1].textContent !== '') ||
    (gameSquares[2].textContent == gameSquares[5].textContent && 
      gameSquares[2].textContent == gameSquares[8].textContent && 
      gameSquares[2].textContent !== '') ||
    (gameSquares[2].textContent == gameSquares[4].textContent && 
      gameSquares[2].textContent == gameSquares[6].textContent && 
      gameSquares[2].textContent !== '') ||
    (gameSquares[3].textContent == gameSquares[4].textContent && 
      gameSquares[3].textContent == gameSquares[5].textContent && 
      gameSquares[3].textContent !== '') ||
    (gameSquares[6].textContent == gameSquares[7].textContent && 
      gameSquares[6].textContent == gameSquares[8].textContent && 
      gameSquares[6].textContent !== '')) {
      console.log('Someone wins');
    } else {
      if (gameboardArray.length > 0) return;
      console.log('Tie');
    }
  }

  return {placeMove, checkWin};
})();
