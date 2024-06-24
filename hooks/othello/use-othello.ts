import { useState, useEffect, useCallback } from 'react';

type Player = 'black' | 'white' | null;

const BOARD_SIZE = 4;

const initialBoard: Player[][] = [
  [null, null, null, null],
  [null, 'black', 'white', null],
  [null, 'white', 'black', null],
  [null, null, null, null],
];

interface Move {
  player: Player;
  position: [number, number];
}

export const useOthello = () => {
  const [board, setBoard] = useState<Player[][]>(initialBoard);
  const [currentColor, setCurrentColor] = useState<Player>('black');
  const [blackCount, setBlackCount] = useState<number>(2);
  const [whiteCount, setWhiteCount] = useState<number>(2);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [canMove, setCanMove] = useState<boolean>(true);

  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1], // vertical and horizontal
    [-1, -1], [-1, 1], [1, -1], [1, 1] // diagonal
  ];

  const countDiscs = (board: Player[][]) => {
    let black = 0;
    let white = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell === 'black') black++;
        if (cell === 'white') white++;
      }
    }
    setBlackCount(black);
    setWhiteCount(white);
  };

  const isValidMove = (board: Player[][], x: number, y: number, color: Player): boolean => {
    if (board[x][y]) return false;

    const opponentColor = color === 'black' ? 'white' : 'black';

    for (const [dx, dy] of directions) {
      let nx = x + dx;
      let ny = y + dy;
      let hasOpponentDisc = false;

      while (nx >= 0 && ny >= 0 && nx < BOARD_SIZE && ny < BOARD_SIZE) {
        if (board[nx][ny] === opponentColor) {
          hasOpponentDisc = true;
        } else if (board[nx][ny] === color) {
          if (hasOpponentDisc) return true;
          break;
        } else {
          break;
        }

        nx += dx;
        ny += dy;
      }
    }

    return false;
  };

  const flipDiscs = (board: Player[][], x: number, y: number, color: Player): Player[][] => {
    const newBoard = board.map(row => row.slice());
    const opponentColor = color === 'black' ? 'white' : 'black';

    for (const [dx, dy] of directions) {
      let nx = x + dx;
      let ny = y + dy;
      let discsToFlip: [number, number][] = [];

      while (nx >= 0 && ny >= 0 && nx < BOARD_SIZE && ny < BOARD_SIZE) {
        if (newBoard[nx][ny] === opponentColor) {
          discsToFlip.push([nx, ny]);
        } else if (newBoard[nx][ny] === color) {
          for (const [fx, fy] of discsToFlip) {
            newBoard[fx][fy] = color;
          }
          break;
        } else {
          break;
        }

        nx += dx;
        ny += dy;
      }
    }

    return newBoard;
  };

  const getValidMoves = (board: Player[][], color: Player): [number, number][] => {
    const moves: [number, number][] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (isValidMove(board, i, j, color)) {
          moves.push([i, j]);
        }
      }
    }
    return moves;
  };

  const handleClick = (x: number, y: number) => {
    if (board[x][y] || !isValidMove(board, x, y, currentColor)) {
      return;
    }

    let newBoard = board.map(row => row.slice());
    newBoard[x][y] = currentColor;
    newBoard = flipDiscs(newBoard, x, y, currentColor);

    setBoard(newBoard);
    countDiscs(newBoard);
    setMoveHistory([...moveHistory, { player: currentColor, position: [x + 1, y + 1] }]);

    if (currentColor === 'black') {
      setCanMove(false);
      setTimeout(() => {
        setCurrentColor('white');
        setCanMove(true);
      }, 1000);
    } else {
      setCurrentColor('black');
    }
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setCurrentColor('black');
    setBlackCount(2);
    setWhiteCount(2);
    setGameOver(false);
    setWinner(null);
    setMoveHistory([]);
  };

  useEffect(() => {
    if (currentColor === 'white') {
      const validMoves = getValidMoves(board, 'white');
      if (validMoves.length > 0) {
        setTimeout(() => {
          const [x, y] = validMoves[Math.floor(Math.random() * validMoves.length)];
          handleClick(x, y);
        }, 1000);
      } else {
        alert('パスします');
        setCurrentColor('black');
      }
    } else {
      const validMoves = getValidMoves(board, 'black');
      if (validMoves.length === 0) {
        alert('パスします');
        setCurrentColor('white');
      }
    }

    if (getValidMoves(board, 'black').length === 0 && getValidMoves(board, 'white').length === 0) {
      setGameOver(true);
      setWinner(blackCount > whiteCount ? 'black' : 'white');
    }
  }, [currentColor]);

  return {
    board,
    currentColor,
    blackCount,
    whiteCount,
    handleClick,
    resetGame,
    gameOver,
    winner,
    moveHistory,
    canMove,
  };
};
