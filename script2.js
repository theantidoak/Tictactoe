const dragAndDrop = (() => {
  //cache DOM
  const playerOptions = document.querySelectorAll('.draggables .positioned');
  const _draggables = document.querySelector('.draggables');
  const dropbox1 = document.querySelector('#drop1');
  const dropbox2 = document.querySelector('#drop2');
  const _leftDropbox = document.querySelector('.left-dropbox');
  const _rightDropbox = document.querySelector('.right-dropbox');
  const _difficultyInput = document.querySelector('.slider');
  const _playButton = document.querySelector('.play');

  const _notDrop1 = ['drop2', 'human1', 'human2', 'bot1', 'bot2'];
  const _notDrop2 = ['drop1', 'human1', 'human2', 'bot1', 'bot2'];
  const _mobileDraggableID = [];
  let _firstEventFlag = true;


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

  _difficultyInput.addEventListener('click', _setDifficulty);
  _playButton.addEventListener('click', _startGame);

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


  function _mobileDrag(e) {
    if (_mobileDraggableID.length == 0) {
      _mobileDraggableID.unshift(this.id);
    } 
    _changeDropboxContent(e);
  }

  function _drop(e) {
    if (_preventDoubleEvent.call(this, e)) return;
    const draggableID = e.type == 'touchstart' ? _mobileDraggableID.pop() : e.dataTransfer.getData("text/plain");
    const draggable = document.getElementById(draggableID);
    const previousDraggable = this.children.length > 1 ? this.children[1].firstElementChild : this.children[0].firstElementChild;
    if (previousDraggable == draggable) return;
    
    _preventWrongDrops.call(this, draggable, draggableID, e.target);
    _changeDraggable.call(this, previousDraggable);
    _modifyContent.call(this, draggableID, previousDraggable);
    _changeColors.call(this, draggableID);
    _removeNonPlayersAndBegin.call(this);
  }

  function _setDifficulty() {
    if (controller.player1.playerType == 'bot') {
      controller.player1.difficulty = this.value == 1 ? 'easy' : 'hard';
    } else if (controller.player2.playerType == 'bot') {
      controller.player2.difficulty = this.value == 1 ? 'easy' : 'hard';
    }
  }

  function _startGame() {
    _difficultyInput.parentElement.style.display = 'none';
    _draggables.parentElement.style.filter = 'blur(0px)';
    _init();
  }

  const _changeDropboxContent = function(e) {
    if (_firstEventFlag == false) return;
    if (e.type == 'touchstart') {
      dropbox1.textContent = 'Place Here';
      dropbox1.style.fontWeight = '700';
      dropbox2.textContent = 'Place Here';
      dropbox2.style.fontWeight = '700';
      _firstEventFlag = false;
    }
  }

  const _preventDoubleEvent = function(e) {
    if (e.type == 'touchstart' && _mobileDraggableID.length == 0 && (this == _leftDropbox || this == _rightDropbox)) {
      return true;
    }
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

  const _changeColors = function(draggableID) {
    const dropBox = this.children[1] || this.children[0];
    const dropBoxID = dropBox.getAttribute('class')[0];
 
    if (dropBoxID == 'd') {
      dropBox.parentElement.firstElementChild.style.color = draggableID[0] == 'h' ? 'blue' : 'red';
    } 
    if (_notDrop2.some((drop) => drop == this.lastElementChild.id) && !dropbox2.firstElementChild) {
      dropbox2.parentElement.firstElementChild.style.color = 'black';
    } 
    if (_notDrop1.some((drop) => drop == this.lastElementChild.id) && !dropbox1.firstElementChild) {
      dropbox1.parentElement.firstElementChild.style.color = 'black';
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
      _setAI();
    }
  }

  const _displayDifficultyOption = function() {
    const bot1 = controller.player1.playerType == 'bot';
    const bot2 = controller.player2.playerType == 'bot';
    if ((bot1 || bot2) && (!(bot1 && bot2))) {
      _difficultyInput.parentElement.style.display = 'block';
      _draggables.parentElement.style.filter = 'blur(2px)';
      return true;
    }
  }

  const _setAI = function() {
    aiOpponent.assignAItoBot.call(controller);
    if (_displayDifficultyOption()) return;
    _init();
  }

  const _init = function() {
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

    const checkRows = (gameBoard, thePlayer, ai) => {
      for (let i = 0; i < 3; i++) {
        const winningRow = [];
        const game = gameBoard || currentGame;
        for (let j = i*3; j < i*3 + 3; j++) {
          winningRow.push(game[j]);
        }
        if (ai && winningRow.every(field => field === thePlayer)) {
          return true;
        } else if (ai && gameBoard && winningRow.every(field => field !== thePlayer)) {
          return false;
        } else if (winningRow.every(field => field === 'X')) { 
          return 'xWins';
        } else if (winningRow.every(field => field === 'O')) {
          return 'oWins';
        } 
      }
    }
    
    const checkColumns = (gameBoard, thePlayer, ai) => {
      for (let i = 0; i < 3; i++) {
        const winningColumn = [];
        const game = gameBoard || currentGame;
   
        for (let j = i; j < i + 7; j+=3) {
          winningColumn.push(game[j]);
        }
        if (ai && winningColumn.every(field => field === thePlayer)) {
          return true;
        } else if (ai && winningColumn.every(field => field !== thePlayer)) {
          return false;
        } else if (winningColumn.every(field => field === 'X')) { 
          return 'xWins';
        } else if (winningColumn.every(field => field === 'O')) {
          return 'oWins';
        } 
      }
    }
    
    const checkDiagonals = (gameBoard, thePlayer, ai) => {
      const game = gameBoard || currentGame;
      let firstDiagonal = [game[0], game[4], game[8]];
      let secondDiagonal = [game[2], game[4], game[6]];
      
      if (ai && (firstDiagonal.every(field => field === thePlayer) || secondDiagonal.every(field => field === thePlayer))) {
        return true;
      } else if (ai && (gameBoard && firstDiagonal.every(field => field !== thePlayer) || secondDiagonal.every(field => field !== thePlayer))) {
        return false;
      } else if (firstDiagonal.every(field => field === 'X') || secondDiagonal.every(field => field === 'X')) {
        return 'xWins';
      } else if (firstDiagonal.every(field => field == 'O') || secondDiagonal.every(field  => field == 'O')) {
        return 'oWins'
      } 
    }

    const checkWin = function() {
      const [...winners] = [checkColumns(), checkDiagonals(), checkRows()];

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

    return {player1, player2, piecesPlayed, currentGame, bindtoSquares, removeBind, changePlayer, giveColorToToken, checkRows, checkColumns, checkDiagonals, checkWin};
})();


function player(token, playerType) {
  this.token = token;
  this.playerType = playerType;
  this.difficulty = undefined;
  let wins = 0;
  let ties = 0;
  return {wins, ties, playerType, token, difficulty};
}


const aiOpponent = (function() {

  const placeAIMove = function() {
    if (controller.player1.difficulty == 'easy' || controller.player2.difficulty == 'easy') {
      usableNumber = _generateOpenSquare();
    } else {
      usableNumber = bestAiMove().index;
    }
    const aiMove = board.squares[usableNumber];
    board.render(aiMove);
    board.updateBoard(aiMove);
    controller.piecesPlayed.unshift(aiMove.textContent);
    controller.checkWin();
  }

  const _generateOpenSquare = function() {
    const randomNumber = Math.floor(Math.random()*9);
    const openSquare = board.squares[randomNumber];
    const usableNumber = openSquare.textContent == "" ? randomNumber : _generateOpenSquare();
    return usableNumber;
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

  const bestAiMove = function() {
    let playerX;
    let playerO;
    if (controller.player1.playerType == 'bot') {
      playerX = controller.player1.token;
      playerO = controller.player2.token;
    } else {
      playerX = controller.player2.token;
      playerO = controller.player1.token;
    }
    const [...gameBoard] = controller.currentGame;
    gameBoard.forEach((space) => {
      gameBoard[gameBoard.indexOf(space)] = space == '' ? gameBoard.indexOf(space) : space;
    });
    return _minimax(gameBoard, playerX, playerX, playerO); 
  }

  const _winning =  function(board, player){
    if (controller.checkColumns(board, player, true) || controller.checkDiagonals(board, player, true) || controller.checkRows(board, player, true)) {
    return true;
    } else {
    return false;
    }
   }

  const _emptyIndexies = function(gameBoard) {
    return  gameBoard.filter(space => space != 'O' && space != 'X');
  }

  const _minimax = function(newBoard, thePlayer, playerX, playerO) {
    const availSpots = _emptyIndexies(newBoard);

    if (_winning(newBoard, playerO)) {
      return {score:-10};
    } else if (_winning(newBoard, playerX)) {
      return {score:10};
    } else if (availSpots.length === 0) {
      return {score:0};
    }
    
    const moves = [];

    for (let i = 0; i < availSpots.length; i++){
      const move = {};
      move.index = newBoard[availSpots[i]];
      newBoard[availSpots[i]] = thePlayer;

      if (thePlayer == playerX) {
        const result = _minimax(newBoard, playerO, playerX, playerO);
        move.score = result.score;
      }
      else {
        const result = _minimax(newBoard, playerX, playerX, playerO);
        move.score = result.score;
      }
      newBoard[availSpots[i]] = move.index;
      moves.push(move);
    }

  let bestMove;

  if (thePlayer === playerX) {
    let bestScore = -10000;
    for(let i = 0; i < moves.length; i++) {
      if(moves[i].score > bestScore){
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = 10000;
    for(var i = 0; i < moves.length; i++){
      if(moves[i].score < bestScore){
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}

  return {aiAgainstAi, placeAIMove, assignAItoBot, aiGoesFirst}
})();