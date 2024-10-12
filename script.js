const Board = function () {
    let boardMatrix = [];

    const constructBoard = function () {
        for (let i = 0; i < 3; i++) {
            boardMatrix[i] = [];

            for (let j = 0; j < 3; j++)
                boardMatrix[i].push(' ');
        }
    };

    constructBoard();

    const setMark = function (row, col, mark) {
        boardMatrix[row][col] = mark;
    };

    const setCircle = function (row, col) {
        setMark(row, col, 'O');
    }

    const setCross = function (row, col) {
        setMark(row, col, 'X');
    }

    const getBoardMatrix = function () {
        return boardMatrix;
    };

    const reset = function () {
        boardMatrix = [];
        constructBoard();
    }

    return { setCircle, setCross, getBoardMatrix, reset };
};

const BoardInspector = function (board) {
    const gameBoard = board;

    const checkPattern = function (row, col) {
        boardMatrix = gameBoard.getBoardMatrix();

        if (boardMatrix[row][col] !== 'O' && boardMatrix[row][col] !== 'X')
            return false;

        const possibleEncounters = [
            { r: row + 1, c: col },         // top
            { r: row + 1, c: col - 1 },     // topLeft
            { r: row + 1, c: col + 1 },     // topRight
            { r: row, c: col - 1 },         // left
            { r: row, c: col + 1 },         // right
            { r: row - 1, c: col },         // bottom
            { r: row - 1, c: col - 1 },     // bottomLeft
            { r: row - 1, c: col + 1 },     // bottomRight
        ];

        let inScope = (cell) => {
            return (cell.r >= 0 && cell.c >= 0) && (cell.r < 3 && cell.c < 3);
        };

        let encounters = [];

        possibleEncounters.forEach((el) => {
            if (inScope(el) && boardMatrix[el.r][el.c] === boardMatrix[row][col])
                encounters.push(el);
        });

        let subject = '';

        encounters.forEach((el) => {
            let dir = { x: el.c - col, y: el.r - row };
            let possibleThird = { r: el.r + dir.y, c: el.c + dir.x };

            if (!inScope(possibleThird))
            {
                possibleThird = { r: row - dir.y, c: col - dir.x};

                if (!inScope(possibleThird))
                    return;
            }

            if (boardMatrix[possibleThird.r][possibleThird.c] === boardMatrix[row][col]) {
                subject = boardMatrix[row][col];
                return;
            }
        });

        return subject !== '';
    };

    return { checkPattern };
};

const Game = function (
    playerA = 'Player A', playerB = 'player B'
) {
    const gameBoard = Board();
    const inspector = BoardInspector(gameBoard);

    let players = [
        { name: playerA, points: 0 },
        { name: playerB, points: 0 }
    ];
    let round = 0;
    let activePlayer = players[0];

    const switchActivePlayer = function () {
        activePlayer = activePlayer == players[0] ? players[1] : players[0];
    };

    const setPlayerMark = function (row, col) {
        if (activePlayer == players[0])
            gameBoard.setCircle(row, col);
        else if (activePlayer == players[1])
            gameBoard.setCross(row, col);
    }

    const resetPlayerPoints = function () {
        players[0].points = 0;
        players[1].points = 0;
    };

    const resetGame = function () {
        round = 0;
        gameBoard.reset();
    };

    const getGameStatus = function() {
        let playerAStatus = `${players[0].name} point(s): ${players[0].points}`;
        let playerBStatus = `${players[1].name} point(s): ${players[1].points}`;

        return `[GameStatus] ${playerAStatus}, ${playerBStatus}.`;
    };

    const playRound = function (row, col) {
        if (round === 9)
        {
            console.log("Tie!")
            resetGame();
        }

        if (gameBoard.getBoardMatrix()[row][col] !== ' ') {
            console.log('Position occupied! Try again.');
            return;
        }

        round++;
        setPlayerMark(row, col);
        let result = inspector.checkPattern(row, col);

        console.log(gameBoard.getBoardMatrix());
        
        if (result) {
            console.log(`${activePlayer} wins this round!`);
            activePlayer.points++;
            resetGame();
        }
        
        console.log(getGameStatus());
        switchActivePlayer();
    }

    return { playRound, resetGame, resetPlayerPoints };
};

const game = Game();
game.playRound(1,2);
game.playRound(1,1);
game.playRound(0,1);