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
  const handleCellClick = (y: number, x: number) => {
    if (gameState[y][x] !== null || winner) return;

    const newGameState = [...gameState];

    // コマを置く
    newGameState[y][x] = currentPlayer;

    // 挟んだコマを反転する処理を実行
    const flippedPieces = flipPieces(y, x, newGameState);

    // 反転が発生した場合のみ、ゲームの状態を更新
    if (flippedPieces.length > 0) {
      setGameState(newGameState);

      // 着手履歴を追加
      const newMove = { player: currentPlayer, position: [x + 1, y + 1] as [number, number] };
      const updatedMoveHistory = [...moveHistory, newMove];
      setMoveHistory(updatedMoveHistory);
      console.log(JSON.stringify(updatedMoveHistory));

      // コマ数を更新
      updatePieceCounts(newGameState);

      // プレイヤー交代
      setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    }
  };

  // コマを挟んで反転させる処理
  const flipPieces = (y: number, x: number, newGameState: any) => {
    const directions = [
      [0, 1],  // 右
      [0, -1], // 左
      [1, 0],  // 下
      [-1, 0], // 上
      [1, 1],  // 右下
      [1, -1], // 左下
      [-1, 1], // 右上
      [-1, -1] // 左上
    ];

    const flippedPieces: [number, number][] = [];

    directions.forEach(([dy, dx]) => {
      const toFlip = [];
      let ny = y + dy;
      let nx = x + dx;

      // ボードの範囲内で、相手のコマが続いている間は追加
      while (ny >= 0 && ny < 4 && nx >= 0 && nx < 4 && newGameState[ny][nx] !== null && newGameState[ny][nx] !== currentPlayer) {
        toFlip.push([ny, nx]);
        ny += dy;
        nx += dx;
      }

      // 自分のコマで挟める場所なら、反転を実行
      if (ny >= 0 && ny < 4 && nx >= 0 && nx < 4 && newGameState[ny][nx] === currentPlayer) {
        toFlip.forEach(([fy, fx]) => {
          newGameState[fy][fx] = currentPlayer;
          flippedPieces.push([fy, fx]);
        });
      }
    });

    return flippedPieces;
  };

  const updatePieceCounts = (newGameState: any) => {
    const blackCount = newGameState.flat().filter((cell: any) => cell === 'black').length;
    const whiteCount = newGameState.flat().filter((cell: any) => cell === 'white').length;
    setBlackCount(blackCount);
    setWhiteCount(whiteCount);
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
