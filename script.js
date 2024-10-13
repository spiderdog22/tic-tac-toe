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

const MovementInspector = function (board) {
    const gameBoard = board;

    let inScope = (cell) => {
        return (cell.r >= 0 && cell.c >= 0) && (cell.r < 3 && cell.c < 3);
    };

    const checkPattern = function (row, col) {
        boardMatrix = gameBoard.getBoardMatrix();

        if (boardMatrix[row][col] !== 'O' && boardMatrix[row][col] !== 'X')
            return { found: false };

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

        let encounters = [];

        possibleEncounters.forEach((el) => {
            if (inScope(el) && boardMatrix[el.r][el.c] === boardMatrix[row][col])
                encounters.push(el);
        });

        let response = { found: false };

        encounters.forEach((el) => {
            let dir = { x: el.c - col, y: el.r - row };
            let possibleThird = { r: el.r + dir.y, c: el.c + dir.x };

            if (!inScope(possibleThird)) {
                possibleThird = { r: row - dir.y, c: col - dir.x };

                if (!inScope(possibleThird))
                    return;
            }

            if (boardMatrix[possibleThird.r][possibleThird.c] === boardMatrix[row][col]) {
                subject = boardMatrix[row][col];

                response.found = true;
                response.marks = [
                    { r: row, c: col },
                    { r: el.r, c: el.c },
                    { r: possibleThird.r, c: possibleThird.c }
                ];

                return;
            }
        });

        return response;
    };

    const occupiedCell = function (row, col) {
        return gameBoard.getBoardMatrix()[row][col] !== ' ';
    }

    return { checkPattern, occupiedCell };
};

const Game = function (
    playerA = 'Player A', playerB = 'player B'
) {
    const gameBoard = Board();
    const inspector = MovementInspector(gameBoard);

    let players = [
        { name: playerA, points: 0 },
        { name: playerB, points: 0 }
    ];
    let round = 0;
    let waitingForGame = true;
    let activePlayer = players[0];

    const getBoardMatrix = function () {
        return gameBoard.getBoardMatrix();
    };

    const switchActivePlayer = function () {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const makePlayerMovement = function (row, col) {
        if (activePlayer === players[0])
            gameBoard.setCircle(row, col);
        else if (activePlayer === players[1])
            gameBoard.setCross(row, col);
    }

    const resetPlayerPoints = function () {
        players[0].points = 0;
        players[1].points = 0;
    };

    const prepareNewGame = function () {
        round = 0;
        gameBoard.reset();
        waitingForGame = false;
    };

    const getPlayerData = function () {
        return players;
    };

    const playRound = function (row, col) {
        if (waitingForGame) {
            prepareNewGame();
            return { msg: `Start ${activePlayer.name}`, waiting: true };
        }

        if (inspector.occupiedCell(row, col))
            return { msg: 'Position occupied! Try again.', noreload: true };

        console.log(activePlayer);
        makePlayerMovement(row, col);

        round++;
        let response = inspector.checkPattern(row, col);

        if (response.found) {
            activePlayer.points++;
            waitingForGame = true;
            let status = { msg: `${activePlayer.name} won this round!`, marks: response.marks };
            switchActivePlayer();
            return status;
        }

        switchActivePlayer();

        // Last round or if there's no available positions/movements.
        if (round === 9) {
            waitingForGame = true;
            return { msg: 'Tie!' };
        }

        return { msg: 'Playing...' };
    }

    const getActivePlayerData = function () {
        return activePlayer;
    }

    const setPlayerData = function (nameA, nameB) {
        players[0].name = nameA;
        players[1].name = nameB;
    };

    return {
        playRound, prepareNewGame,
        getPlayerData, getActivePlayerData, setPlayerData,
        resetPlayerPoints, getBoardMatrix
    };
};

const DisplayController = function () {
    const game = Game('PlayerA', 'PlayerB');

    const boardElement = document.querySelector('#board');
    let roundStatus = document.querySelector('#round-status');
    let startResetBtn = document.querySelector('#start-reset');

    const playerAStatus = document.querySelector('#player-a');
    const playerAPoints = document.querySelector('#a-points');
    const playerBStatus = document.querySelector('#player-b');
    const playerBPoints = document.querySelector('#b-points');

    const setNamesForm = document.querySelector('#name-form');

    const updatePlayerStatuses = function () {
        const playerData = game.getPlayerData();
        playerAStatus.textContent = playerData[0].name + "(O): ";
        playerAPoints.textContent = playerData[0].points;
        playerBStatus.textContent = playerData[1].name + "(X): ";
        playerBPoints.textContent = playerData[1].points;
    };

    const updateBoard = function () {
        boardElement.textContent = "";

        game.getBoardMatrix().forEach((rows, row) => {
            rows.forEach((cell, col) => {
                let cellContainer = document.createElement('div');
                cellContainer.classList.add('cell-container');

                let button = document.createElement('button');
                button.classList.add('cell-btn');
                button.classList.add(`p${row}-${col}`);

                if (cell !== ' ')
                    button.classList.add(cell.toLowerCase());

                cellContainer.appendChild(button);
                boardElement.appendChild(cellContainer);
            });
        });
    };

    const setWaitingState = function () {
        roundStatus.textContent = `Start ${game.getActivePlayerData().name}!`;
    };

    const boardInteractionCallback = function (evt) {
        const target = evt.target;

        if (target.classList.contains('cell-btn')) {
            let position = target.classList[1];
            position = position.replaceAll(/p|-/g, '').split('').map((el) => +el);

            const row = position[0];
            const col = position[1];
            let gameStatus = game.playRound(row, col);
            roundStatus.textContent = gameStatus.msg;

            if (!gameStatus.noreload) {
                updateBoard();
                setNamesForm.submit.disabled = true;
            }

            if (gameStatus.waiting) {
                setNamesForm.submit.disabled = false;
                setWaitingState();
                console.log('Hello!');
            }

            if (gameStatus.marks) {
                gameStatus.marks.forEach((cell) => {
                    const className = `p${cell.r}-${cell.c}`;
                    const winnerCell = boardElement.querySelector(`.${className}`);
                    winnerCell.classList.add('winner-cell');
                });

            }

            updatePlayerStatuses();
        }
    };

    const startResetCallback = function (evt) {
        startResetBtn = startResetBtn.textContent === 'Start' ? 'Reset' : 'Start';

        updatePlayerStatuses();
        setWaitingState();
        game.prepareNewGame();
        game.resetPlayerPoints();
        updateBoard();

        setNamesForm.submit.disabled = true;
    };

    boardElement.addEventListener('click', boardInteractionCallback);
    startResetBtn.addEventListener('click', startResetCallback);
    setNamesForm.addEventListener('submit', (evt) => {
        evt.preventDefault();

        game.setPlayerData(this.aName.value, this.bName.value);
        updatePlayerStatuses();
        setWaitingState();
    });
};

DisplayController();