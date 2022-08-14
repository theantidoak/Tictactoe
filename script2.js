const dragAndDrop = (() => {
  //cache DOM
  const playerOptions = document.querySelectorAll('.draggables .positioned');
  const _draggables = document.querySelector('.draggables');
  const dropbox1 = document.querySelector('#drop1');
  const dropbox2 = document.querySelector('#drop2');
  const _leftDropbox = document.querySelector('.left-dropbox');
  const _rightDropbox = document.querySelector('.right-dropbox');

  const _mobileDraggableID = [];


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

  playerOptions.forEach((option) => option.addEventListener('touchstart', _mobileDrag));
  dropbox1.parentElement.addEventListener('touchstart', _drop);
  dropbox2.parentElement.addEventListener('touchstart', _drop);
  



  function _drag(e) {
    e.stopPropagation();
    e.dataTransfer.setData("text/plain", e.target.id);
    
  }

  function _allowDrop(e) {
    e.preventDefault();
  }


  function _mobileDrag() {
    if (_mobileDraggableID.length == 0) {
      _mobileDraggableID.unshift(this.id);
    } 
  }

  const _preventDoubleEvent = function(e) {
    if (e.type == 'touchstart' && _mobileDraggableID.length == 0 && (this == _leftDropbox || this == _rightDropbox)) {
      return true;
    }
  }
  function _drop(e) {
    if (_preventDoubleEvent.call(this, e)) return;
    
    const draggableID = e.type == 'touchstart' ? _mobileDraggableID.pop() : e.dataTransfer.getData("text/plain");
    const draggable = document.getElementById(draggableID);
    const previousDraggable = this.children.length > 1 ? this.children[1].firstElementChild : this.children[0].firstElementChild;
   
    if ((draggableID == this.firstElementChild.id || draggableID[0] != this.firstElementChild.id[0] || draggable.parentElement.children.length == 2) && [..._draggables.children].some(drag => drag == this)) return;
    if (this == draggable.parentElement.parentElement) return;
    _preventWrongDrops.call(this, draggable, draggableID);
    _changeDraggable.call(this, previousDraggable, draggable);
    _modifyContent.call(this, draggableID, previousDraggable);
    _changeColors.call(this, draggableID, e.target, draggable);
    _removeNonPlayersAndBegin.call(this);
  }

  const _preventWrongDrops = function(draggable, draggableID) {
    if (this.getAttribute('class')[0] == 'p') {
      draggableID[0] == 'b' ? _draggables.lastElementChild.appendChild(draggable) : 
      _draggables.firstElementChild.appendChild(draggable) 
    } else {
      
      this.children[1].appendChild(draggable);
    }
  }

  const _changeDraggable = function(previous) {
    
    if (this.getAttribute('class')[0] != 'p' && previous != null) {
      previous.id[0] == 'h' ? _draggables.firstElementChild.appendChild(previous) :
      _draggables.lastElementChild.appendChild(previous);

    }
  }

  const _modifyContent = function(draggableID, previous) {
    const draggable = document.getElementById(draggableID);
    const dropBox = this.children[1] || this.children[0];
    switch (dropBox.id) {
      case 'drop1':
        draggable.textContent = draggableID[0] == 'h' ? 'P1 : 0' : 'B1 : 0';
        break;
      case 'drop2':
        draggable.textContent = draggableID[0] == 'h' ? 'P2 : 0': 'B2 : 0';
        break;
      default:
        draggable.textContent = '';
    }
    previous ? previous.textContent = '' : null;
  }

  const _changeColors = function(draggableID, draggable) {
  
    const dropBox = this.children[1] || this.children[0];
    const dropBoxID = dropBox.getAttribute('class')[0];
    
    if (dropBoxID == 'd') {
      dropBox.parentElement.firstElementChild.style.color = draggableID[0] == 'h' ? 'blue' : 'red';
    } else if (dropBoxID == 'p' && draggable.parentElement.parentElement == _draggables) {
      dropbox1.parentElement.firstElementChild.style.color = 'black';
      dropbox2.parentElement.firstElementChild.style.color = 'black';
    } 
  }

  const _removeNonPlayersAndBegin = function() {
    const dropboxesFilled = dropbox1.firstElementChild && dropbox2.firstElementChild;
    if (dropboxesFilled) {
      playerOptions.forEach((option) => {
        if (option.parentElement.parentElement == _draggables) {
          option.parentElement.parentElement.style.display = 'none';
        }
      })
      _init();
    }
  }

  const _init = function() {
    aiOpponent.assignAItoBot.call(controller);
    aiOpponent.aiAgainstAi();
    controller.bindtoSquares();
    aiOpponent.aiGoesFirst();
    _removeDragAndDropBind();
    
    
  }
  
  return {dropbox1, dropbox2, playerOptions};

})();


const board = (() => {

  //cache DOM
  const squares = [...document.querySelectorAll('.game-square')];
  const newGameButton = document.querySelector('.newGame-button');
  const header = document.querySelector('header');
  
  const currentGame = squares.map((square) => square.textContent);
  
  //bind
  newGameButton.addEventListener('click', _createNewGame);

  //render
  const render = function(that) {
    const token = controller.changePlayer();
    const move = document.createTextNode(token);
    controller.giveColorToToken(that, token);
    that.appendChild(move);
  }

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
    if (controller.player1.wins == 3) {
      header.textContent = 'Player One Wins the Game';
    } else {
      header.textContent = 'Player Two Wins the Game';
    }
    header.appendChild(newGameButton);
  }

  const reset = function() {
      squares.forEach((square) => {
        while (square.firstChild) {
          square.removeChild(square.lastChild);
        }
      });
    currentGame.splice(0, currentGame.length, ...squares.map((square) => square.textContent));
  }

  function _createNewGame() {
    location.reload();
  };

  return {squares, currentGame, newGameButton, render, updateBoard, updateScore, displayGameOver, reset};
  
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
    const removeBind = function() {
      board.squares.forEach((square) => square.removeEventListener('click', placeMove));
    }

    const placeMove = function() {
      if (_squareIsEmpty.call(this) == false) return;
      board.render(this);
      board.updateBoard(this);
      piecesPlayed.unshift(this.textContent);
      const noWinner = checkWin();
      if (aiOpponent.assignAItoBot.call(controller) == 'bot' && 
        noWinner) {
        removeBind();
        setTimeout(aiOpponent.placeAIMove, 500);
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

    const checkWin = function() {
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
      removeBind();
      board.updateScore();
      if (player1.wins != 3 && player2.wins != 3) {
        setTimeout(function() {
          board.reset();
          aiOpponent.aiGoesFirst();
          bindtoSquares();
        }, 500);
      } else {
        board.displayGameOver();
      }
    }

    return {player1, player2, piecesPlayed, bindtoSquares, removeBind, changePlayer, giveColorToToken, checkWin};
})();


function player(token, playerType) {
  this.token = token;
  this.playerType = playerType;
  let wins = 0;
  let ties = 0;
  return {wins, ties, playerType, token};
}


const aiOpponent = (function() {
  
  const placeAIMove = function() {
    const aiMove = _generateOpenSquare();
    board.render(aiMove);
    board.updateBoard(aiMove);
    controller.piecesPlayed.unshift(aiMove.textContent);
    controller.checkWin();
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
    this.player1.playerType = p1type[0] == 'b' ? 'bot' : 'human';
    this.player2.playerType = p2type[0] == 'b' ? 'bot' : 'human';
    return noBots ? 'noBot' : 'bot';
  }

  const aiGoesFirst = function() {
    const totalGames = controller.player1.wins + controller.player2.wins + controller.player1.ties; 
    const onlyBots = controller.player1.playerType == 'bot' && controller.player2.playerType == 'bot';
    if (onlyBots) return;
    if ((controller.player1.playerType == 'bot' && totalGames % 2 == 0) || 
      (controller.player2.playerType == 'bot' && totalGames % 2 != 0)) {
        controller.removeBind();
        setTimeout(placeAIMove, 500);
    } 
  }

  const aiAgainstAi = function() {
    if (controller.player1.playerType == 'bot' && controller.player2.playerType == 'bot') {
      placeAIMove();
      if (controller.player1.wins < 3 && controller.player2.wins < 3) {
        setTimeout(aiAgainstAi, 1000);
      }
    }
  }

  return {aiAgainstAi, placeAIMove, assignAItoBot, aiGoesFirst}
})();