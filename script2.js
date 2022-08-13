const dragAndDrop = (() => {
  //cache DOM
  const playerOptions = document.querySelectorAll('.draggables .positioned');
  const draggables = document.querySelector('.draggables');
  const dropbox1 = document.querySelector('#drop1');
  const dropbox2 = document.querySelector('#drop2')

  //bind events
  playerOptions.forEach((option) => option.addEventListener('dragstart', _drag));
  playerOptions.forEach((option) => option.parentElement.addEventListener('dragover', _allowDrop));
  playerOptions.forEach((option) => option.parentElement.addEventListener('drop', _drop));
  dropbox1.parentElement.addEventListener('dragstart', _drag);
  dropbox1.parentElement.addEventListener('dragover', _allowDrop);
  dropbox1.parentElement.addEventListener('drop', _drop);
  dropbox2.parentElement.addEventListener('dragstart', _drag);
  dropbox2.parentElement.addEventListener('dragover', _allowDrop);
  dropbox2.parentElement.addEventListener('drop', _drop);

  const _removeDragAndDropBind = function() {
    playerOptions.forEach((option) => option.removeEventListener('dragstart', _drag));
    playerOptions.forEach((option) => option.parentElement.removeEventListener('dragover', _allowDrop));
    playerOptions.forEach((option) => option.parentElement.removeEventListener('drop', _drop));
    dropbox1.parentElement.removeEventListener('dragstart', _drag);
    dropbox1.parentElement.removeEventListener('dragover', _allowDrop);
    dropbox1.parentElement.removeEventListener('drop', _drop);
    dropbox2.parentElement.removeEventListener('dragstart', _drag);
    dropbox2.parentElement.removeEventListener('dragover', _allowDrop);
    dropbox2.parentElement.removeEventListener('drop', _drop);
  };

  function _drag(e) {
    e.stopPropagation();
    e.dataTransfer.setData("text/plain", e.target.id);
  }

  function _allowDrop(e) {
    e.preventDefault();
  }

  function _drop(e) {
    e.preventDefault(); 
    const draggableID = e.dataTransfer.getData("text/plain");
    const draggable = document.getElementById(draggableID);
    const previousPlayer = this.children.length > 1 ? this.children[1].firstElementChild : null;
    _preventWrongDrops.call(this, draggable, draggableID);
    _returnPreviousPlayer.call(this, previousPlayer);
    _modifyContent.call(this, draggableID, previousPlayer);
    _changeColors.call(this, draggableID, e.target);
    _removeNonPlayersAndBegin.call(this);
  }

  const _preventWrongDrops = function(draggable, draggableID) {
    if (this.getAttribute('class')[0] == 'p') {
      draggableID[0] == 'b' ? draggables.lastElementChild.appendChild(draggable) : 
      draggables.firstElementChild.appendChild(draggable) 
    } else {
      this.children[1].appendChild(draggable);
    }
  }

  const _removeNonPlayersAndBegin = function() {
    const dropboxesFilled = dropbox1.firstElementChild && dropbox2.firstElementChild;
    if (dropboxesFilled) {
      playerOptions.forEach((option) => {
        if (option.parentElement.parentElement == draggables) {
          option.parentElement.parentElement.style.display = 'none';
        }
      })
      _init();
    }
  }

  const _init = function() {
    controller.bindtoSquares();
    controller.assignAItoBot();
    controller.aiGoesFirst();
    _removeDragAndDropBind();
  }

  const _modifyContent = function(draggableID, previousPlayer) {
    const draggable = document.getElementById(draggableID);
    const dropBox = this.children[1] || this.children[0];
    switch (dropBox.id) {
      case 'drop1':
          draggable.textContent = draggableID[0] == 'h' ? 'P1 : 0' : 'B1 : 0';
        break;
      case 'drop2':
        draggable.textContent = draggableID[0] == 'h' ? 'P2 : 0' : 'B2 : 0';
        break;
      default:
        draggable.textContent = draggableID[0] == 'h' ? 
          `Choose Player` : 
          `Choose Bot`;
    }
    if (previousPlayer) {
      previousPlayer.textContent = previousPlayer.textContent[0] == 'P' ? 'Choose Player' : 'Choose Bot';
    };
  }

  const _changeColors = function(draggableID, eventTarget) {
    const dropBox = this.children[1] || this.children[0];
    const dropBoxID = dropBox.getAttribute('class')[0];
    if (dropBoxID == 'd') {
      dropBox.parentElement.firstElementChild.style.color = draggableID[0] == 'h' ? 'blue' : 'red';
    } else if (dropBoxID == 'p' && eventTarget.id != draggableID && eventTarget.id[0] == draggableID[0]) {
      dropbox1.parentElement.firstElementChild.style.color = 'black';
      dropbox2.parentElement.firstElementChild.style.color = 'black';
    } 
  }

  const _returnPreviousPlayer = function(previousPlayer) {
    if (this.getAttribute('class')[0] != 'p' && previousPlayer != null) {
      previousPlayer.id[0] == 'h' ? draggables.firstElementChild.appendChild(previousPlayer) :
      draggables.lastElementChild.appendChild(previousPlayer);
    }
  }
  
  return {dropbox1, dropbox2, playerOptions, draggables};

})();


const board = (() => {

  //cache DOM
  const squares = [...document.querySelectorAll('.game-square')];
  const newGameButton = document.querySelector('.newGame-button');
  
  const currentGame = squares.map((square) => square.textContent);

  const updateBoard = function(that) {
      const index = squares.indexOf(that);
      currentGame.splice(index, 1, that.textContent);
  };

  const updateScore = function() {
    dragAndDrop.playerOptions.forEach((option) => {
      const content = option.textContent;
      if (content[0] == `C`) return;
      option.textContent = option.parentElement.id == 'drop1' ?
       content.substring(0, content.length-1) + controller.player1.wins :
       content.substring(0, content.length-1) + controller.player2.wins;
    })
  };

  const displayGameOver = function() {
    const header = document.querySelector('header');
    if (controller.player1.wins == 3) {
      header.textContent = 'Player One Wins the Game';
    } else {
      header.textContent = 'Player Two Wins the Game';
    }
    header.appendChild(newGameButton);
  }

  const createNewGame = function() {
    location.reload();
  };

  const reset = function() {
      squares.forEach((square) => {
        while (square.firstChild) {
          square.removeChild(square.lastChild);
        }
      });
    currentGame.splice(0, currentGame.length, ...squares.map((square) => square.textContent));
  }

  return {squares, currentGame, newGameButton, updateBoard, updateScore, displayGameOver, reset, createNewGame};
  
})();

const controller = (() => {
    const currentGame = board.currentGame;
    const piecesPlayed = [];
    const player1 = player(dragAndDrop.dropbox1.getAttribute('name'), dragAndDrop.dropbox1.childNodes);
    const player2 = player(dragAndDrop.dropbox2.getAttribute('name'), dragAndDrop.dropbox2.childNodes);

    //bind events
    const bindtoSquares = function() {
      board.squares.forEach((square) => square.addEventListener('click', placeMove));
    };
    const _removeBind = function() {
      board.squares.forEach((square) => square.removeEventListener('click', placeMove));
    }
    board.newGameButton.addEventListener('click', board.createNewGame);


    function placeMove() {
      if (_squareIsEmpty.call(this) == false) return;
      _render(this);
      board.updateBoard(this);
      piecesPlayed.unshift(this.textContent);
      const noWinner = _checkWin();
      if (assignAItoBot.call(controller) == 'bot' && 
        noWinner) {
        _removeBind();
        setTimeout(_placeAIMove, 500);
      } 
    }

    const _placeAIMove = function() {
      const aiMove = _generateOpenSquare();
      _render(aiMove);
      board.updateBoard(aiMove);
      piecesPlayed.unshift(aiMove.textContent);
      _checkWin();
    }

    const _generateOpenSquare = function() {
      const randomNumber = Math.floor(Math.random()*9);
      const openSquare = board.squares[randomNumber];
      const aiMove = openSquare.textContent != "" ? 
        _generateOpenSquare() : openSquare;
      return aiMove;
    }

    const assignAItoBot = function() {
      const p1type = this.player1.playerType[1].id || this.player1.playerType;
      const p2type = this.player2.playerType[1].id || this.player2.playerType;
      const noBots = p1type[0] == 'h' && p2type[0] == 'h';
      player1.playerType = p1type[0] == 'b' ? 'bot' : 'human';
      player2.playerType = p2type[0] == 'b' ? 'bot' : 'human';
      return noBots ? 'noBot' : 'bot';
    }

    const aiGoesFirst = function() {
      const totalGames = player1.wins + player2.wins + player1.ties; 
      if ((player1.playerType == 'bot' && totalGames % 2 == 0) || 
        (player2.playerType == 'bot' && totalGames % 2 != 0)) {
          _removeBind();
          setTimeout(_placeAIMove, 500);
      } 
    }

    const _changePlayer = function() {
      const totalGames = player1.wins + player2.wins + player1.ties; 
      const newGameArray = currentGame.every((piece) => piece == '');
      if (newGameArray) {
        return totalGames % 2 != 0 ? 'O' : 'X'
      } else {
        return piecesPlayed[0] == 'X' ? 'O' : 'X';
      }
    }

    const _render = function(that) {
      const token = _changePlayer();
      const move = document.createTextNode(token);
      giveColorToToken(that, token);
      that.appendChild(move);
    }

    const giveColorToToken = function(that, token) {
      if (token == 'X') {
        that.style.color = player1.playerType == 'human' ? 'blue' : 'red';
      } else {
        that.style.color = player2.playerType == 'human' ? 'blue' : 'red';
      };
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

    const _checkWin = function() {
      const [...winners] = [_checkColumns(), _checkDiagonals(), _checkRows()];
      if (winners.some((winner) => winner == 'xWins')) {
        ++player1.wins;
      } else if (winners.some((winner) => winner == 'oWins')) {
        ++player2.wins;
      } else if (currentGame.every((piece) => piece != '')) {
        ++player1.ties;
        ++player2.ties;
      } else {
        bindtoSquares();
        return true;
      }
      _postGameProcess();
    }

    const _postGameProcess = function() {
      _removeBind();
      board.updateScore();
      if (player1.wins != 3 && player2.wins != 3) {
        setTimeout(function() {
          board.reset();
          aiGoesFirst();
          bindtoSquares();
        }, 500);
      } else {
        board.displayGameOver();
      }
    }

    return {player1, player2, bindtoSquares, assignAItoBot, aiGoesFirst};
})();


function player(token, playerType) {
  this.token = token;
  this.playerType = playerType;
  let wins = 0;
  let ties = 0;
  return {wins, ties, playerType, token};
}