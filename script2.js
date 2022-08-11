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
    if (_checkIfEmpty(this) == false) return;
    const data = e.dataTransfer.getData("text/plain");
    const draggable = document.getElementById(data);
    this.appendChild(draggable);
    _modifyContent.call(this, data);
    _removeNonPlayersAndBegin();
  }

  function _removeNonPlayersAndBegin() {
    if (dropbox1.firstElementChild && dropbox2.firstElementChild) {
      playerOptions.forEach((option) => {
        if (option.parentElement.parentElement == draggables) {
          option.parentElement.removeChild(option);
        }
      })
      controller.bindOnCommand();
      controller.assignAItoBot(this);
      if (controller.player1.playerType == 'bot') {
        controller.placeAIMove();
      }
    }
  }

  const _modifyContent = function(that) {
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

  const _checkIfEmpty = function(that) {
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

  const updateBoard = function(that) {
      const index = squares.indexOf(that);
      currentGame.splice(index, 1, that.textContent);
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
    let piecesPlayed = [];
    const player1 = player(dragAndDrop.dropbox1.getAttribute('name'), dragAndDrop.dropbox1.childNodes);
    const player2 = player(dragAndDrop.dropbox2.getAttribute('name'), dragAndDrop.dropbox2.childNodes);

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
      render(this);
      board.updateBoard(this);
      piecesPlayed.unshift(this.textContent);
      if ((player1.playerType == 'bot' || 
        player2.playerType == 'bot') && 
        _checkWin() == 'continue') {
        placeAIMove();
      } else {
        _checkWin();
      }
      _checkGameOver();
    }

    // bot vs bot??
    function placeAIMove() {
      setTimeout(function() { 
        if (board.squares.every(square => square.textContent != '')) return;
        const aiMove = generateOpenSquare();
        render(aiMove);
        board.updateBoard(aiMove);
        piecesPlayed.unshift(aiMove.textContent);
        _checkWin();
        _checkGameOver();
      }, 500);
    }

    function generateOpenSquare() {
      const randomNumber = Math.floor(Math.random()*9);
      const openSquare = board.squares[randomNumber];
      
      const aiMove = openSquare.textContent != "" ? generateOpenSquare() : openSquare;
      return aiMove;
    }

    const assignAItoBot = function() {
      const p1type = this.player1.playerType[1].id;
      const p2type = this.player2.playerType[1].id;

      player1.playerType = p1type[0] == 'b' ? 'bot' : 'human';
      player2.playerType = p2type[0] == 'b' ? 'bot' : 'human';
    }

    function aiGoesFirst() {
      const totalGames = player1.wins + player2.wins + player1.ties; 
      if (player1.playerType == 'bot' && totalGames % 2 == 0) {
        setTimeout(placeAIMove, 1000);
      } else if (player2.playerType == 'bot' && totalGames % 2 != 0) {
        setTimeout(placeAIMove, 1000);
      }
    }

    const changePlayer = function() {
      const totalGames = player1.wins + player2.wins + player1.ties; 
      const newGameArray = currentGame.every((piece) => piece == '');
      if (newGameArray) {
        return totalGames % 2 != 0 ? 'O' : 'X'
      } else {
        return piecesPlayed[0] == 'X' ? 'O' : 'X';
      }
    }

    const render = function(that) {
        const move = document.createTextNode(changePlayer());
        that.appendChild(move);
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
      const firstDiagonal = [currentGame[0], currentGame[4], currentGame[8]];
      const secondDiagonal = [currentGame[2], currentGame[4], currentGame[6]];
      if (firstDiagonal.every(field => field === 'X') || secondDiagonal.every(field => field === 'X')) {
        return 'xWins';
      } else if (firstDiagonal.every(field => field == 'O') || secondDiagonal.every(field  => field == 'O')) {
        return 'oWins'
      } 
    }

    function _checkWin() {
      const [...winners] = [_checkColumns(), _checkDiagonals(), _checkRows()];
      if (winners.some((winner) => winner == 'xWins')) {
        ++player1.wins;
        postGameProcess(); 
      } else if (winners.some((winner) => winner == 'oWins')) {
        ++player2.wins;
        postGameProcess();
      } else if (currentGame.every((piece) => piece != '')) {
        ++player1.ties;
        ++player2.ties;
        postGameProcess();
      } else {
        return 'continue';
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
        board.updateScore();
        board.reset();
        bindOnCommand();
      }, 500);
      if (player1.wins != 3 && player2.wins != 3) {
        aiGoesFirst();
      } 
      
    }

    return {player1, player2, bindOnCommand, assignAItoBot, placeAIMove};
})();


function player(token, playerType) {
  
  let wins = 0;
  let ties = 0;

  return {wins, ties, playerType, token};
}