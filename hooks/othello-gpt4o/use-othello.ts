import { useState, useEffect } from 'react';

type Player = 'B' | 'W' | null;

const initialBoard: Player[][] = [
  [null, null, null, null],
  [null, 'W', 'B', null],
  [null, 'B', 'W', null],
  [null, null, null, null],
];

const directions = [
  [-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]
];

export const useOthello = () => {
  const [board, setBoard] = useState<Player[][]>(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('B');
  const [blackCount, setBlackCount] = useState(2);
  const [whiteCount, setWhiteCount] = useState(2);
  const [message, setMessage] = useState<string | null>(null);

  const resetGame = () => {
    setBoard(initialBoard);
    setCurrentPlayer('B');
    setBlackCount(2);
    setWhiteCount(2);
    setMessage(null);
  };

  const countPieces = (board: Player[][]) => {
    let black = 0;
    let white = 0;
    board.forEach(row => row.forEach(cell => {
      if (cell === 'B') black++;
      if (cell === 'W') white++;
    }));
    setBlackCount(black);
    setWhiteCount(white);
  };

  const isValidMove = (board: Player[][], row: number, col: number, player: Player) => {
    if (board[row][col] !== null) return false;

    const opponent = player === 'B' ? 'W' : 'B';
    for (const [dx, dy] of directions) {
      let x = row + dx;
      let y = col + dy;
      let hasOpponent = false;

      while (x >= 0 && x < 4 && y >= 0 && y < 4 && board[x][y] === opponent) {
        x += dx;
        y += dy;
        hasOpponent = true;
      }

      if (hasOpponent && x >= 0 && x < 4 && y >= 0 && y < 4 && board[x][y] === player) {
        return true;
      }
    }
    return false;
  };

  const getValidMoves = (board: Player[][], player: Player) => {
    const validMoves: [number, number][] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (isValidMove(board, row, col, player)) {
          validMoves.push([row, col]);
        }
      }
    }
    return validMoves;
  };

  const flipPieces = (board: Player[][], row: number, col: number, player: Player) => {
    const newBoard = board.map(r => r.slice());
    const opponent = player === 'B' ? 'W' : 'B';

    for (const [dx, dy] of directions) {
      let x = row + dx;
      let y = col + dy;
      const cellsToFlip: [number, number][] = [];

      while (x >= 0 && x < 4 && y >= 0 && y < 4 && board[x][y] === opponent) {
        cellsToFlip.push([x, y]);
        x += dx;
        y += dy;
      }

      if (x >= 0 && x < 4 && y >= 0 && y < 4 && board[x][y] === player) {
        cellsToFlip.forEach(([fx, fy]) => {
          newBoard[fx][fy] = player;
        });
      }
    }

    newBoard[row][col] = player;
    return newBoard;
  };

  const makeMove = (row: number, col: number, player: Player) => {
    if (!isValidMove(board, row, col, player)) return false;

    const newBoard = flipPieces(board, row, col, player);
    setBoard(newBoard);
    countPieces(newBoard);

    return true;
  };

  const handleClick = (row: number, col: number) => {
    if (currentPlayer !== 'B') return;

    const validMoves = getValidMoves(board, currentPlayer);
    if (validMoves.length === 0) {
      setMessage('パスします');
      setCurrentPlayer('W');
      return;
    }

    if (!makeMove(row, col, 'B')) return;

    setCurrentPlayer('W');

    setTimeout(() => {
      const cpuValidMoves = getValidMoves(board, 'W');
      if (cpuValidMoves.length === 0) {
        setMessage('パスします');
        setCurrentPlayer('B');
        return;
      }

      const [cpuRow, cpuCol] = cpuValidMoves[Math.floor(Math.random() * cpuValidMoves.length)];
      makeMove(cpuRow, cpuCol, 'W');
      setCurrentPlayer('B');
    }, 500);
  };

  useEffect(() => {
    const blackValidMoves = getValidMoves(board, 'B');
    const whiteValidMoves = getValidMoves(board, 'W');

    if (blackValidMoves.length === 0 && whiteValidMoves.length === 0) {
      const winner = blackCount > whiteCount ? '黒の勝' : '白の勝';
      setMessage(winner);
    }
  }, [board]);

  return {
    board,
    currentPlayer,
    handleClick,
    resetGame,
    blackCount,
    whiteCount,
    message,
  };
};
