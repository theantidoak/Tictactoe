const dragAndDrop = (() => {
  //cache DOM
  const playerOptions = document.querySelectorAll('.draggables .positioned');
  const dropbox1 = document.querySelector('#drop1');
  const dropbox2 = document.querySelector('#drop2');

  //bind events
  playerOptions.forEach((option) => option.addEventListener('dragstart', drag));
  playerOptions.forEach((option) => option.parentElement.addEventListener('dragover', allowDrop));
  playerOptions.forEach((option) => option.parentElement.addEventListener('drop', drop));
  dropbox1.addEventListener('dragstart', drag);
  dropbox1.addEventListener('dragover', allowDrop);
  dropbox1.addEventListener('drop', drop);
  dropbox2.addEventListener('dragstart', drag);
  dropbox2.addEventListener('dragover', allowDrop);
  dropbox2.addEventListener('drop', drop);

  function drag(e) {
    e.dataTransfer.setData("text/plain", e.target.id);
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  function drop(e) { 
    if (checkIfEmpty(this) == false) return;
    const data = e.dataTransfer.getData("text/plain");
    const draggable = document.getElementById(data);
    this.appendChild(draggable);
    modifyContent.call(this, data);
  }

  const modifyContent = function(that) {
    const target = document.getElementById(that);
    const dropBox = this;
    switch (dropBox.id) {
      case 'drop1':
        target.textContent = that[0] == 'h' ? 'P1 : 0' : 'B1 : 0';
        break;
      case 'drop2':
        target.textContent = that[0] == 'h' ? 'P2 : 0' : 'B2 : 0';
        break;
      default:
        target.textContent = that[0] == 'h' ? 
          `\u{2261} Player` : 
          `\u{2261} Bot`;
    }
  }

  const checkIfEmpty = function(that) {
    if (that.classList.contains('dropbox') && that.children.length == 1) {
      return false;
    }
  }
  return {dropbox1, dropbox2, playerOptions};

})();

const board = (() => {

  //cache DOM
  const squares = [...document.querySelectorAll('.game-square')];
  const player1Input = document.querySelector('#player-1');
  const player2Input = document.querySelector('#player-2');
  const resetButton = document.querySelector('.reset-button');
  
  const currentGame = squares.map((square) => square.textContent);

  const updateBoard = function() {
      const index = squares.indexOf(this);
      currentGame.splice(index, 1, this.textContent);
  };

  const updateScore = function() {
    dragAndDrop.playerOptions.forEach((option) => {
      if (option.textContent[0] == `\u{2261}`) return;
      const content = option.textContent;
      option.textContent = option.parentElement.id == 'drop1' ?
       content.substring(0, content.length-1) + controller.player1.wins :
       content.substring(0, content.length-1) + controller.player2.wins
    })
  }

  const reset = function() {
    squares.forEach((square) => {
      while (square.firstChild) {
        square.removeChild(square.lastChild);
      }
    });
    currentGame.splice(0, currentGame.length, ...squares.map((square) => square.textContent));
  }

  return {squares, currentGame, updateBoard, updateScore, player1Input, player2Input, reset, resetButton};
  
})();

const controller = (() => {
    const currentGame = board.currentGame;
    const player1 = player(dragAndDrop.dropbox1.getAttribute('name'));
    const player2 = player(dragAndDrop.dropbox2.getAttribute('name'));
    

    //bind events
    board.squares.forEach((square) => square.addEventListener('click', placeMove));
    board.resetButton.addEventListener('click', board.reset);

    function placeMove() {
      if (_squareIsEmpty.call(this) == false) return;
      render.call(this);
      board.updateBoard.call(this);
      _checkWin();
      board.updateScore();
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
      } else if (diagonals == 'oWins' || columns == 'oWins' || rows == 'oWins') {
        ++player2.wins;
        player2.takeTurn();
        setTimeout(board.reset, 1000);
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
    return {player1, player2};
})();


function player(token) {
  this.token = token;
  let turn = token == 'X' ? false : true;
  let wins = 0;

  const takeTurn = () => {
    turn = !turn;
    return {turn};
  };
  return {takeTurn, wins, token};
}