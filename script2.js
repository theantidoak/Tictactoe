const board = (() => {

  //cache DOM
    const squares = [...document.querySelectorAll('.game-square')];
    const player1Input = document.querySelector('#player-1');
    const player2Input = document.querySelector('#player-2');
    const resetButton = document.querySelector('.reset-button');
    const playerOptions = document.querySelectorAll('.draggables div');
    const dropbox1 = document.querySelector('#drop1');
    const dropbox2 = document.querySelector('#drop2');

    const currentGame = squares.map((square) => square.textContent);

    // playerOptions.forEach((button) => button.addEventListener('click', selectSide));
    playerOptions.forEach((option) => option.addEventListener('dragstart', drag));
    dropbox1.addEventListener('dragover', allowDrop);
    dropbox1.addEventListener('drop', drop);
    dropbox2.addEventListener('dragover', allowDrop);
    dropbox2.addEventListener('drop', drop);

    function drag(e) {
      e.dataTransfer.setData("text/plain", e.target.id);
    }

    function allowDrop(e) {
      e.preventDefault();
    }

    function drop(e) {
      e.preventDefault();
      const data = e.dataTransfer.getData("text/plain");
      const draggable = document.getElementById(data);
      e.target.appendChild(draggable);
      removeAbsolutePostition(draggable);
      e.target == dropbox1 ? 
        dropbox1.removeEventListener('drop', drop) : 
        dropbox2.removeEventListener('drop', drop);
    }

    const removeAbsolutePostition = (draggable) => {
      draggable.style.position = 'static';
    }

    // function selectSide(e) {
    //   e.preventDefault();
    //   console.log(e.target);
    //   switch (this.getAttribute('class')) {
    //     case 'human1':
    //       break;
    //     case 'bot1':
    //       break;
    //     case 'human2':
    //       break;
    //     case 'bot2':
    //       break;
    //   }
    // }

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
      const totalGames = player1.wins + player2.wins; // + ties
      const turn = totalGames % 2 == 0 ? 
        player1.takeTurn().turn : 
        player2.takeTurn().turn;
      return turn ? 'X' : 'O';
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
        player1.takeTurn();
        setTimeout(board.reset, 1000);
        return 'win';
      } else if (diagonals == 'oWins' || columns == 'oWins' || rows == 'oWins') {
        ++player2.wins;
        player2.takeTurn();
        setTimeout(board.reset, 1000);
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