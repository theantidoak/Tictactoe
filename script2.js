const board = (() => {

    const squares = [...document.querySelectorAll('.game-square')];
    const currentGame = squares.map((square) => square.textContent);

    const updateGame = function() {
        const index = squares.indexOf(this);
        currentGame.splice(index, 1, this.textContent);
    };

    return {squares, currentGame, updateGame};
    
})();

const gameController = (() => {
    const currentGame = board.currentGame;

    board.squares.forEach((square) => square.addEventListener('click', placeMove));

    function render() {
        const move = document.createTextNode('X');
        this.appendChild(move);
    }

    function placeMove() {
        if (_squareIsEmpty.call(this) == false) return;
        render.call(this);
        board.updateGame.call(this);
        _checkWin();
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
          if (winningRow.every(field => field === 'X') || 
            winningRow.every(field => field === 'O')) {
            return true;
          } 
        }
      }
    
      const _checkColumns = () => {
        for (let i = 0; i < 3; i++) {
          const winningColumn = [];
          for (let j = i; j < i + 7; j+=3) {
            winningColumn.push(currentGame[j]);
          }
          if (winningColumn.every(field => field === 'X') || 
            winningColumn.every(field => field === 'O')) {
            return true;
          }
        }
      }
    
      const _checkDiagonals = () => {
        console.log(currentGame);
        const firstDiagonal = [currentGame[0], currentGame[4], currentGame[8]];
        const secondDiagonal = [currentGame[0], currentGame[4], currentGame[8]];
        if (firstDiagonal.every(field => field === 'X') || secondDiagonal.every(field => field === 'X') ||
          firstDiagonal.every(field => field == 'O') || secondDiagonal.every(field  => field == 'O')) {
              return true;
            } 
      }

      function _checkWin() {
        if (_checkDiagonals() || _checkColumns() || _checkRows()) {
          console.log('You Win');
        }
      }

    // const changePlayer;
    
    return {currentGame};

})();