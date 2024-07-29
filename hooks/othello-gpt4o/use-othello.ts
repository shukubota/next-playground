import { useState, useCallback, useEffect } from 'react';

type Player = 'black' | 'white';
type Cell = Player | null;
type Position = [number, number];
type GameState = Cell[][];
type Move = { player: Player; position: Position };

const initialState: GameState = [
  [null, null, null, null],
  [null, 'black', 'white', null],
  [null, 'white', 'black', null],
  [null, null, null, null],
];

const initialMoves: Move[] = [
  { player: 'black', position: [2, 2] },
  { player: 'white', position: [3, 2] },
  { player: 'black', position: [3, 3] },
  { player: 'white', position: [2, 3] },
];

const directions: Position[] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

export const useOthello = () => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [moves, setMoves] = useState<Move[]>(initialMoves);

  const isValidMove = useCallback((state: GameState, player: Player, [x, y]: Position): boolean => {
    if (state[y-1][x-1] !== null) return false;

    for (const [dx, dy] of directions) {
      let nx = x + dx, ny = y + dy;
      let foundOpponent = false;

      while (nx >= 1 && nx <= 4 && ny >= 1 && ny <= 4) {
        if (state[ny-1][nx-1] === null) break;
        if (state[ny-1][nx-1] === player) {
          if (foundOpponent) return true;
          break;
        }
        foundOpponent = true;
        nx += dx;
        ny += dy;
      }
    }

    return false;
  }, []);

  const getValidMoves = useCallback((state: GameState, player: Player): Position[] => {
    const validMoves: Position[] = [];
    for (let y = 1; y <= 4; y++) {
      for (let x = 1; x <= 4; x++) {
        if (isValidMove(state, player, [x, y])) {
          validMoves.push([x, y]);
        }
      }
    }
    return validMoves;
  }, [isValidMove]);

  const makeMove = useCallback((state: GameState, player: Player, [x, y]: Position): GameState => {
    if (!isValidMove(state, player, [x, y])) return state;

    const newState = state.map(row => [...row]);
    newState[y-1][x-1] = player;

    for (const [dx, dy] of directions) {
      let nx = x + dx, ny = y + dy;
      const toFlip: Position[] = [];

      while (nx >= 1 && nx <= 4 && ny >= 1 && ny <= 4) {
        if (newState[ny-1][nx-1] === null) break;
        if (newState[ny-1][nx-1] === player) {
          for (const [fx, fy] of toFlip) {
            newState[fy-1][fx-1] = player;
          }
          break;
        }
        toFlip.push([nx, ny]);
        nx += dx;
        ny += dy;
      }
    }

    return newState;
  }, [isValidMove]);

  const computerMove = useCallback(() => {
    const validMoves = getValidMoves(gameState, 'white');
    if (validMoves.length === 0) {
      alert('CPUがパスします');
      setCurrentPlayer('black');
      return;
    }

    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    const newState = makeMove(gameState, 'white', randomMove);
    setGameState(newState);
    setMoves(prev => [...prev, { player: 'white', position: randomMove }]);
    setCurrentPlayer('black');
  }, [gameState, getValidMoves, makeMove]);

  const handlePlayerMove = useCallback((x: number, y: number) => {
    if (currentPlayer !== 'black' || !isValidMove(gameState, 'black', [x, y])) return;

    const newState = makeMove(gameState, 'black', [x, y]);
    setGameState(newState);
    setMoves(prev => [...prev, { player: 'black', position: [x, y] }]);
    setCurrentPlayer('white');

    setTimeout(computerMove, 500);
  }, [currentPlayer, gameState, isValidMove, makeMove, computerMove]);

  const resetGame = useCallback(() => {
    setGameState(initialState);
    setCurrentPlayer('black');
    setMoves(initialMoves);
  }, []);

  const getCounts = useCallback((state: GameState) => {
    let blackCount = 0, whiteCount = 0;
    for (const row of state) {
      for (const cell of row) {
        if (cell === 'black') blackCount++;
        else if (cell === 'white') whiteCount++;
      }
    }
    return { blackCount, whiteCount };
  }, []);

  const checkGameEnd = useCallback(() => {
    const blackMoves = getValidMoves(gameState, 'black');
    const whiteMoves = getValidMoves(gameState, 'white');
    if (blackMoves.length === 0 && whiteMoves.length === 0) {
      const { blackCount, whiteCount } = getCounts(gameState);
      if (blackCount > whiteCount) {
        alert('黒の勝ち');
      } else if (whiteCount > blackCount) {
        alert('白の勝ち');
      } else {
        alert('引き分け');
      }
    }
  }, [gameState, getValidMoves, getCounts]);

  useEffect(() => {
    console.log(JSON.stringify(moves));
    checkGameEnd();
  }, [moves, checkGameEnd]);

  return {
    gameState,
    currentPlayer,
    handlePlayerMove,
    resetGame,
    getCounts,
  };
};
