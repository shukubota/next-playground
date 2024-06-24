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
    // コマの有効性を判定するロジックをここに実装
    return true;
  };

  const flipDiscs = (board: Player[][], x: number, y: number, color: Player): Player[][] => {
    // コマをひっくり返すロジックをここに実装
    return board;
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
