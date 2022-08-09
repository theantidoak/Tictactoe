const board = (() => {

  //cache DOM
    const squares = [...document.querySelectorAll('.game-square')];
    const player1Input = document.querySelector('#player-1');
    const player2Input = document.querySelector('#player-2');
    const resetButton = document.querySelector('.reset-button');
    const playerButtons = document.querySelectorAll('.choose-side button');

    const currentGame = squares.map((square) => square.textContent);

    playerButtons.forEach((button) => button.addEventListener('click', selectSide));

    function selectSide() {
      switch (this.getAttribute('class')) {
        case 'human1':
          break;
        case 'bot1':
          break;
        case 'human2':
          break;
        case 'bot2':
          break;
      }
    }

    const updateGame = function() {
        const index = squares.indexOf(this);
        currentGame.splice(index, 1, this.textContent);
    };

    const reset = function() {
      squares.forEach((square) => {
        while (square.firstChild) {
          square.removeChild(square.lastChild);
        }
      });
      currentGame.splice(0, currentGame.length, ...squares.map((square) => square.textContent));
    }

    return {squares, currentGame, updateGame, player1Input, player2Input, reset, resetButton};
    
})();

const controller = (() => {
    const currentGame = board.currentGame;
    const player1 = player('X');
    const player2 = player('O');

    //bind events
    board.squares.forEach((square) => square.addEventListener('click', placeMove));
    board.resetButton.addEventListener('click', board.reset);

    function placeMove() {
      if (_squareIsEmpty.call(this) == false) return;
      render.call(this);
      board.updateGame.call(this);
      _checkWin();
      _checkGameOver();
    }

    const changePlayer = function() {
      const totalWins = player1.wins + player2.wins;
      const checkIfNewGame = currentGame.every(piece => piece == '');
      if (totalWins % 2 == 0 && checkIfNewGame) {
        return 'X';
      } else if (totalWins % 2 != 0 && checkIfNewGame) {
        return 'O';
      } else {
        return player1.takeTurn().turn ? 'O' : 'X';
      }
      
    }

    const render = function() {
        const move = document.createTextNode(changePlayer());
        this.appendChild(move);
    }

    const _squareIsEmpty = function() {
      return this.textContent == "" ? true : false;
    };

    const _checkRows = () => {
      for (let i = 0; i < 3; i++) {
        const winningRow = [];
        for (let j = i*3; j < i*3 + 3; j++) {
          winningRow.push(currentGame[j]);
        }
        if (winningRow.every(field => field === 'X')) { 
          return 'xWins';
        } else if (winningRow.every(field => field === 'O')) {
          return 'oWins';
        } 
      }
    }
    
    const _checkColumns = () => {
      for (let i = 0; i < 3; i++) {
        const winningColumn = [];
        for (let j = i; j < i + 7; j+=3) {
          winningColumn.push(currentGame[j]);
        }
        if (winningColumn.every(field => field === 'X')) {
          return 'xWins';
        } else if (winningColumn.every(field => field === 'O')) {
          return 'oWins';
        } 
      }
    }
    
    const _checkDiagonals = () => {
      console.log(currentGame);
      const firstDiagonal = [currentGame[0], currentGame[4], currentGame[8]];
      const secondDiagonal = [currentGame[2], currentGame[4], currentGame[6]];
      if (firstDiagonal.every(field => field === 'X') || secondDiagonal.every(field => field === 'X')) {
        return 'xWins';
      } else if (firstDiagonal.every(field => field == 'O') || secondDiagonal.every(field  => field == 'O')) {
        return 'oWins'
      } 
    }

    function _checkWin() {
      const diagonals = _checkDiagonals();
      const columns = _checkColumns();
      const rows = _checkRows();
      if (diagonals == 'xWins' || columns == 'xWins' || rows == 'xWins') {
        ++player1.wins;
        setTimeout(board.reset, 1200);
        return 'win';
      } else if (diagonals == 'oWins' || columns == 'oWins' || rows == 'oWins') {
        ++player2.wins;
        setTimeout(board.reset, 1200);
        return 'win';
      }
    }

    function _checkGameOver() {
      if (player1.wins == 3) {
        console.log('Player 1 wins the game');
      }
      else if (player2.wins == 3) {
        console.log('Player 2 wins the game');
      }
    }
    return {player1};

})();

function player(token) {
  
  let turn = token == 'X' ? false : true;
  let wins = 0;
  //choose 1P or 2P
  //have an opponent

  const takeTurn = () => {
    turn = !turn;
    return {turn};
  };
  return {takeTurn, wins};
}