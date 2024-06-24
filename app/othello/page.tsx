'use client';

import { useEffect } from 'react';
import { useOthello } from '../../hooks/othello/use-othello';

const Page = () => {
  const {
    board,
    currentColor,
    blackCount,
    whiteCount,
    handleClick,
    resetGame,
    gameOver,
    winner,
  } = useOthello();

  useEffect(() => {
    if (gameOver) {
      alert(`${winner === 'black' ? '黒' : '白'}の勝`);
    }
  }, [gameOver, winner]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="grid grid-cols-4 gap-0 w-4/5" style={{ aspectRatio: '1 / 1' }}>
        {board.map((row, rowIndex) =>
          row.map((cell, cellIndex) => (
            <div
              key={`${rowIndex}-${cellIndex}`}
              onClick={() => handleClick(rowIndex, cellIndex)}
              className="relative w-full flex items-center justify-center bg-green-600 border border-black"
            >
              {cell && (
                <div className={`absolute w-[90%] h-[90%] rounded-full ${cell === 'black' ? 'bg-black' : 'bg-white'}`}></div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="flex justify-between w-4/5 mt-4">
        <button onClick={resetGame} className="bg-gray-500 text-white py-2 px-4 rounded">
          リセット
        </button>
        <div>
          黒: {blackCount} 白: {whiteCount}
        </div>
      </div>
    </div>
  );
};

export default Page;
