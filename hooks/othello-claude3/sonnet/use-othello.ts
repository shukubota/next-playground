import { useState, useEffect, useCallback } from 'react';

type Player = 'black' | 'white';
type Position = [number, number];
type Cell = { player: Player; position: Position } | null;
type Board = Cell[][];

const BOARD_SIZE = 4;
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

const INITIAL_BOARD: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
INITIAL_BOARD[1][1] = { player: 'black', position: [1, 1] };
INITIAL_BOARD[1][2] = { player: 'white', position: [1, 2] };
INITIAL_BOARD[2][2] = { player: 'black', position: [2, 2] };
INITIAL_BOARD[2][1] = { player: 'white', position: [2, 1] };

const countPieces = (board: Board): { black: number; white: number } => {
  return board.flat().reduce(
    (acc, cell) => {
      if (cell?.player === 'black') acc.black++;
      if (cell?.player === 'white') acc.white++;
      return acc;
    },
    { black: 0, white: 0 }
  );
};

const isValidMove = (board: Board, player: Player, [x, y]: Position): boolean => {
  if (board[y][x] !== null) return false;

  return DIRECTIONS.some(([dx, dy]) => {
    let nx = x + dx;
    let ny = y + dy;
    let foundOpponent = false;

    while (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
      const cell = board[ny][nx];
      if (cell === null) return false;
      if (cell.player === player) return foundOpponent;
      foundOpponent = true;
      nx += dx;
      ny += dy;
    }

    return false;
  });
};

const getValidMoves = (board: Board, player: Player): Position[] => {
  const validMoves: Position[] = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (isValidMove(board, player, [x, y])) {
        validMoves.push([x, y]);
      }
    }
  }
  return validMoves;
};

const flipPieces = (board: Board, player: Player, [x, y]: Position): Board => {
  const newBoard = board.map(row => [...row]);
  newBoard[y][x] = { player, position: [x, y] };

  DIRECTIONS.forEach(([dx, dy]) => {
    let nx = x + dx;
    let ny = y + dy;
    const piecesToFlip: Position[] = [];

    while (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
      const cell = newBoard[ny][nx];
      if (cell === null) break;
      if (cell.player === player) {
        piecesToFlip.forEach(([fx, fy]) => {
          newBoard[fy][fx] = { player, position: [fx, fy] };
        });
        break;
      }
      piecesToFlip.push([nx, ny]);
      nx += dx;
      ny += dy;
    }
  });

  return newBoard;
};

const getBestMove = (board: Board, player: Player): Position | null => {
  const validMoves = getValidMoves(board, player);
  if (validMoves.length === 0) return null;

  // Simple AI: choose the move that flips the most pieces
  return validMoves.reduce((bestMove, move) => {
    const newBoard = flipPieces(board, player, move);
    const score = countPieces(newBoard)[player];
    return score > bestMove.score ? { move, score } : bestMove;
  }, { move: validMoves[0], score: -1 }).move;
};

export const useOthello = () => {
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);

  const resetGame = useCallback(() => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer('black');
    setGameOver(false);
    setWinner(null);
  }, []);

  const makeMove = useCallback((position: Position) => {
    if (gameOver || currentPlayer !== 'black') return;

    if (isValidMove(board, currentPlayer, position)) {
      const newBoard = flipPieces(board, currentPlayer, position);
      setBoard(newBoard);
      setCurrentPlayer('white');
    }
  }, [board, currentPlayer, gameOver]);

  const cpuMove = useCallback(() => {
    const bestMove = getBestMove(board, 'white');
    if (bestMove) {
      setTimeout(() => {
        const newBoard = flipPieces(board, 'white', bestMove);
        setBoard(newBoard);
        setCurrentPlayer('black');
      }, 500);
    } else {
      alert('CPUがパスします');
      setCurrentPlayer('black');
    }
  }, [board]);

  useEffect(() => {
    if (currentPlayer === 'white' && !gameOver) {
      cpuMove();
    }
  }, [currentPlayer, gameOver, cpuMove]);

  useEffect(() => {
    const blackMoves = getValidMoves(board, 'black');
    const whiteMoves = getValidMoves(board, 'white');

    if (blackMoves.length === 0 && whiteMoves.length === 0) {
      setGameOver(true);
      const { black, white } = countPieces(board);
      if (black > white) setWinner('black');
      else if (white > black) setWinner('white');
      else setWinner('draw');
    } else if (currentPlayer === 'black' && blackMoves.length === 0) {
      alert('黒がパスします');
      setCurrentPlayer('white');
    }
  }, [board, currentPlayer]);

  return {
    board,
    currentPlayer,
    makeMove,
    resetGame,
    gameOver,
    winner,
    pieces: countPieces(board),
  };
};
