'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShogiBoard } from './components/ShogiBoard';
import { LevelSelector } from './components/LevelSelector';
import { GameControls } from './components/GameControls';
import { levels } from './data';

export default function OshoShutsujinPage() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [board, setBoard] = useState<string[][]>([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [bestMoves, setBestMoves] = useState<Record<number, number>>({});

  // 初期化と盤面のリセット
  useEffect(() => {
    resetBoard();
  }, [currentLevel]);

  // 盤面のリセット
  const resetBoard = () => {
    setBoard([...levels[currentLevel].initialBoard.map(row => [...row])]);
    setMoves(0);
    setIsComplete(false);
  };

  // 駒の移動
  const movePiece = (row: number, col: number, targetRow: number, targetCol: number) => {
    // 1マスの移動のみ許可
    const rowDiff = Math.abs(targetRow - row);
    const colDiff = Math.abs(targetCol - col);
    if (rowDiff + colDiff !== 1) return;

    // 移動先が空でない場合
    if (board[targetRow][targetCol] !== 'empty') return;

    const newBoard = [...board.map(row => [...row])];
    newBoard[targetRow][targetCol] = newBoard[row][col];
    newBoard[row][col] = 'empty';
    setBoard(newBoard);
    setMoves(moves + 1);

    // 勝利条件をチェック
    checkWinCondition(newBoard);
  };

  // 勝利条件のチェック
  const checkWinCondition = (currentBoard: string[][]) => {
    const { winCondition } = levels[currentLevel];
    const isWin = winCondition.every(condition => {
      const { piece, row, col } = condition;
      return currentBoard[row][col] === piece;
    });

    if (isWin) {
      setIsComplete(true);
      // ベストスコアの更新
      const currentBest = bestMoves[currentLevel] || Infinity;
      if (moves + 1 < currentBest) {
        setBestMoves({
          ...bestMoves,
          [currentLevel]: moves + 1
        });
      }
    }
  };

  // レベル選択
  const selectLevel = (level: number) => {
    setCurrentLevel(level);
  };

  // 次のレベルへ
  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-amber-900 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            ホームに戻る
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-amber-900 text-center">王将出陣</h1>
          <div className="w-24"></div> {/* スペース調整用 */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
              <h2 className="text-xl font-bold mb-4 text-amber-900">レベル {currentLevel + 1}: {levels[currentLevel].title}</h2>
              <p className="mb-4 text-gray-700">{levels[currentLevel].description}</p>
              
              <div className="flex justify-center">
                <ShogiBoard
                  board={board}
                  onMove={movePiece}
                  isComplete={isComplete}
                />
              </div>
            </div>

            <GameControls
              moves={moves}
              isComplete={isComplete}
              onReset={resetBoard}
              onNextLevel={nextLevel}
              bestMoves={bestMoves[currentLevel]}
              showNextButton={currentLevel < levels.length - 1}
            />
          </div>

          <div>
            <LevelSelector
              levels={levels}
              currentLevel={currentLevel}
              bestMoves={bestMoves}
              onSelect={selectLevel}
            />

            <div className="bg-white p-4 rounded-lg shadow-md mt-4">
              <h3 className="font-bold text-lg mb-2 text-amber-900">ルール説明</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>駒をスライドさせて、目標の配置を達成しましょう</li>
                <li>駒は隣接する空白マスにのみ移動できます</li>
                <li>王将（玉将）を指定された位置に移動させるのが目標です</li>
                <li>最小手数で解くことを目指しましょう</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md mt-4">
              <h3 className="font-bold text-lg mb-2 text-amber-900">操作方法</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>駒をクリックして選択</li>
                <li>移動先の空きマスをクリック</li>
                <li>ハイライト表示されたマスにのみ移動可能です</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}