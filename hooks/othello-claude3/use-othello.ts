import { useState, useCallback } from 'react';

type Player = 'black' | 'white';
type Cell = Player | null;
type Board = Cell[][];

const BOARD_SIZE = 8;
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

const createInitialBoard = (): Board => {
  const board: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  const mid = BOARD_SIZE / 2 - 1;
  board[mid][mid] = 'white';
  board[mid][mid + 1] = 'black';
  board[mid + 1][mid] = 'black';
  board[mid + 1][mid + 1] = 'white';
  return board;
};

const getOpponent = (player: Player): Player => player === 'black' ? 'white' : 'black';

export const useOthello = () => {
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');

  const isValidMove = useCallback((row: number, col: number, player: Player): boolean => {
    if (board[row][col] !== null) return false;

    for (const [dx, dy] of DIRECTIONS) {
      let x = row + dx;
      let y = col + dy;
      let hasOpponent = false;

      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
        if (board[x][y] === null) break;
        if (board[x][y] === player) {
          if (hasOpponent) return true;
          break;
        }
        hasOpponent = true;
        x += dx;
        y += dy;
      }
    }

    return false;
  }, [board]);

  const makeMove = useCallback((row: number, col: number) => {
    if (!isValidMove(row, col, currentPlayer)) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;

    for (const [dx, dy] of DIRECTIONS) {
      let x = row + dx;
      let y = col + dy;
      const toFlip: [number, number][] = [];

      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
        if (newBoard[x][y] === null) break;
        if (newBoard[x][y] === currentPlayer) {
          for (const [flipX, flipY] of toFlip) {
            newBoard[flipX][flipY] = currentPlayer;
          }
          break;
        }
        toFlip.push([x, y]);
        x += dx;
        y += dy;
      }
    }

    setBoard(newBoard);
    setCurrentPlayer(getOpponent(currentPlayer));
  }, [board, currentPlayer, isValidMove]);

  const cpuMove = useCallback(() => {
    const validMoves: [number, number][] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (isValidMove(i, j, currentPlayer)) {
          validMoves.push([i, j]);
        }
      }
    }

    if (validMoves.length > 0) {
      const [row, col] = validMoves[Math.floor(Math.random() * validMoves.length)];
      makeMove(row, col);
    }
  }, [currentPlayer, isValidMove, makeMove]);

  return { board, currentPlayer, makeMove, cpuMove };
};