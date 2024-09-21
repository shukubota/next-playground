'use client'

import { useEffect } from 'react';
import { useOthello } from '../../hooks/othello-claude3/use-othello';

const Page = () => {
  const { board, currentPlayer, makeMove, cpuMove } = useOthello();

  useEffect(() => {
    if (currentPlayer === 'white') {
      const timer = setTimeout(cpuMove, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, cpuMove]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Othello Game</h1>
      <div className="w-4/5 aspect-square">
        <div className="grid grid-cols-8 gap-0 bg-green-600 border border-black">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="aspect-square border border-black flex items-center justify-center cursor-pointer"
                onClick={() => currentPlayer === 'black' && makeMove(rowIndex, colIndex)}
              >
                {cell && (
                  <div
                    className={`rounded-full w-[90%] h-[90%] ${
                      cell === 'black' ? 'bg-black' : 'bg-white'
                    }`}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-8 text-2xl font-semibold">
        Current Player: {currentPlayer === 'black' ? 'You (Black)' : 'CPU (White)'}
      </div>
    </div>
  );
};

export default Page;