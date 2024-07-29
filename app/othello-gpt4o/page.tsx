'use client'

import { useEffect } from 'react';
import { useOthello } from '../../hooks/othello-gpt4o/use-othello';

const Page = () => {
  const { board, currentPlayer, handleClick, resetGame, blackCount, whiteCount, message } = useOthello();

  useEffect(() => {
    if (message) {
      alert(message);
    }
  }, [message]);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="grid grid-cols-4 gap-0 border border-black w-4/5" style={{ aspectRatio: '1' }}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="w-full h-full border border-black flex justify-center items-center bg-green-500"
              onClick={() => handleClick(rowIndex, colIndex)}
            >
              {cell !== null && (
                <div
                  className={`rounded-full ${cell === 'B' ? 'bg-black' : 'bg-white'}`}
                  style={{ width: '90%', height: '90%' }}
                />
              )}
            </div>
          ))
        )}
      </div>
      <div className="flex space-x-4">
        <button onClick={resetGame} className="px-4 py-2 bg-blue-500 text-white rounded">リセット</button>
        <div>黒: {blackCount}</div>
        <div>白: {whiteCount}</div>
      </div>
    </div>
  );
};

export default Page;
