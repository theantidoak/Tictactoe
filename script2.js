const dragAndDrop = (() => {
  //cache DOM
  const playerOptions = document.querySelectorAll('.draggables .positioned');
  const draggables = document.querySelector('.draggables');
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
    removeNonPlayersAndBegin();
  }

  function removeNonPlayersAndBegin() {
    if (dropbox1.firstElementChild && dropbox2.firstElementChild) {
      playerOptions.forEach((option) => {
        if (option.parentElement.parentElement == draggables) {
          option.parentElement.removeChild(option);
        }
      })
      controller.bindOnCommand();
    }
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
          `\u{2630} Player` : 
          `\u{2630} Bot`;
    }
  }

  const checkIfEmpty = function(that) {
    if (that.classList.contains('dropbox') && that.children.length == 1) {
      return false;
    }
  }
  return {dropbox1, dropbox2, playerOptions, draggables};

})();

const board = (() => {

  //cache DOM
  const squares = [...document.querySelectorAll('.game-square')];
  const player1Input = document.querySelector('#player-1');
  const player2Input = document.querySelector('#player-2');
  const newGameButton = document.querySelector('.newGame-button');
  
  const currentGame = squares.map((square) => square.textContent);

  const updateBoard = function() {
      const index = squares.indexOf(this);
      currentGame.splice(index, 1, this.textContent);
  };

  const updateScore = function() {
    dragAndDrop.playerOptions.forEach((option) => {
      if (option.textContent[0] == `\u{2630}`) return;
      const content = option.textContent;
      option.textContent = option.parentElement.id == 'drop1' ?
       content.substring(0, content.length-1) + controller.player1.wins :
       content.substring(0, content.length-1) + controller.player2.wins;
    })
  }

  const createNewGame = function() {
    location.reload();
  }

  const reset = function() {
    squares.forEach((square) => {
      while (square.firstChild) {
        square.removeChild(square.lastChild);
      }
    });
    currentGame.splice(0, currentGame.length, ...squares.map((square) => square.textContent));
  }

  return {squares, currentGame, updateBoard, updateScore, player1Input, player2Input, reset, createNewGame, newGameButton};
  
})();

const controller = (() => {
    const currentGame = board.currentGame;
    const player1 = player(dragAndDrop.dropbox1.getAttribute('name'));
    const player2 = player(dragAndDrop.dropbox2.getAttribute('name'));
    

    //bind events
    const bindOnCommand = function() {
      board.squares.forEach((square) => square.addEventListener('click', placeMove));
    };
    const removeBind = function() {
      board.squares.forEach((square) => square.removeEventListener('click', placeMove));
    }
    board.newGameButton.addEventListener('click', board.createNewGame);

    function placeMove() {
      if (_squareIsEmpty.call(this) == false) return;
      render.call(this);
      board.updateBoard.call(this);
      _checkWin();
      board.updateScore();
      _checkGameOver();
    }

    const changePlayer = function() {
      const totalGames = player1.wins + player2.wins + player1.ties; 

      if (currentGame.every((piece) => piece == '') && totalGames % 2 == 0) {
        player1.takeTurn();
        return 'X';
      } else if (currentGame.every((piece) => piece == '') && totalGames % 2 != 0) {
        player2.takeTurn();
        return 'O';
      } else {
        return player1.takeTurn().turn ? 'X' : 'O';
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
        player1.takeTurn();
        postGameProcess()
      } else if (diagonals == 'oWins' || columns == 'oWins' || rows == 'oWins') {
        ++player2.wins;
        player2.takeTurn();
        postGameProcess()
      } else if (currentGame.every((piece) => piece != '')) {
        ++player1.ties;
        ++player2.ties;
        postGameProcess()
      }
    }

    function _checkGameOver() {
      if (player1.wins == 3) {
        dragAndDrop.draggables.textContent = 'Player 1 Wins the Game';
        dragAndDrop.draggables.appendChild(board.newGameButton);
        removeBind();
      }
      else if (player2.wins == 3) {
        dragAndDrop.draggables.textContent = 'Player 2 Wins the Game';
        dragAndDrop.draggables.appendChild(board.newGameButton);
        removeBind();
      }
    }

    function postGameProcess() {
      removeBind();
      setTimeout(function() {
        board.reset();
        bindOnCommand()
      }, 1000);
    }
    return {player1, player2, bindOnCommand};
})();


function player(token) {
  
  let turn = token == 'X' ? false : true;
  let wins = 0;
  let ties = 0;


  const takeTurn = () => {
    turn = !turn;
    return {turn};
  };
  return {takeTurn, wins, token, ties};
}