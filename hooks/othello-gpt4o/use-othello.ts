import { useState } from 'react';

export const useOthello = () => {
  const initialGameState = [
    [null, null, null, null],
    [null, 'black', 'white', null],
    [null, 'white', 'black', null],
    [null, null, null, null],
  ];

  const [gameState, setGameState] = useState(initialGameState);
  const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black');
  const [blackCount, setBlackCount] = useState(2);
  const [whiteCount, setWhiteCount] = useState(2);
  const [winner, setWinner] = useState<string | null>(null);
  const [moveHistory, setMoveHistory] = useState<{ player: 'black' | 'white'; position: [number, number] }[]>([]);

  // コマを置く処理
  const handleCellClick = (y: number, x: number) => {  // yが行（上から何列目）、xが列（左から何列目）
    if (gameState[y][x] !== null || winner) return;

    const newGameState = [...gameState];
    newGameState[y][x] = currentPlayer;

    // 着手履歴を追加
    const newMove = { player: currentPlayer as 'black' | 'white', position: [x + 1, y + 1] as [number, number] }; // [x, y]の順に修正
    const updatedMoveHistory = [...moveHistory, newMove];
    setMoveHistory(updatedMoveHistory);

    // 全ての履歴をJSON.stringifyしてconsoleに出力
    console.log(JSON.stringify(updatedMoveHistory));

    setGameState(newGameState);
    flipPieces(y, x, newGameState);

    updatePieceCounts(newGameState);
    checkForPassOrEndGame(newGameState);

    if (currentPlayer === 'black') {
      setTimeout(() => cpuMove(newGameState), 500);
    }
  };

  // CPUが白を置く処理
  const cpuMove = (currentGameState: any) => {
    const newGameState = [...currentGameState];
    // 仮に[0,0]にCPUが置く
    newGameState[0][0] = 'white';

    // CPUの着手履歴を追加
    const newMove = { player: 'white' as 'black' | 'white', position: [1, 1] as [number, number] }; // [1,1]に白を置く
    const updatedMoveHistory = [...moveHistory, newMove];
    setMoveHistory(updatedMoveHistory);

    // 全ての履歴をJSON.stringifyしてconsoleに出力
    console.log(JSON.stringify(updatedMoveHistory));

    setGameState(newGameState);
    flipPieces(0, 0, newGameState);

    updatePieceCounts(newGameState);
    checkForPassOrEndGame(newGameState);
    setCurrentPlayer('black');
  };

  const flipPieces = (x: number, y: number, newGameState: any) => {
    // 挟んだコマを反転させるロジックを実装
  };

  const updatePieceCounts = (newGameState: any) => {
    const blackCount = newGameState.flat().filter((cell: any) => cell === 'black').length;
    const whiteCount = newGameState.flat().filter((cell: any) => cell === 'white').length;
    setBlackCount(blackCount);
    setWhiteCount(whiteCount);
  };

  const checkForPassOrEndGame = (newGameState: any) => {
    // パスやゲーム終了をチェックするロジックを実装
    const noMovesLeft = false;
    if (noMovesLeft) {
      if (blackCount > whiteCount) {
        setWinner('black');
      } else if (whiteCount > blackCount) {
        setWinner('white');
      }
    }
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setCurrentPlayer('black');
    setBlackCount(2);
    setWhiteCount(2);
    setMoveHistory([]);
    setWinner(null);
  };

  return {
    gameState,
    handleCellClick,
    resetGame,
    blackCount,
    whiteCount,
    winner
  };
};
