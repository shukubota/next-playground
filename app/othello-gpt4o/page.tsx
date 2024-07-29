'use client'

import React from 'react';
import { useOthello } from '../../hooks/othello-gpt4o/use-othello';

const Page = () => {
  const { gameState, currentPlayer, handlePlayerMove, resetGame, getCounts } = useOthello();

  const { blackCount, whiteCount } = getCounts(gameState);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-4/5 aspect-square max-w-lg">
        <div className="grid grid-cols-4 gap-0 bg-green-600 border border-black">
          {gameState.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className="aspect-square border border-black flex items-center justify-center cursor-pointer"
                onClick={() => handlePlayerMove(x, y)}
              >
                {cell && (
                  <div
                    className={`w-[90%] h-[90%] rounded-full ${
                      cell === 'black' ? 'bg-black' : 'bg-white'
                    }`}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-4 text-lg">
        <span className="mr-4">黒: {blackCount}</span>
        <span>白: {whiteCount}</span>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={resetGame}
      >
        リセット
      </button>
    </div>
  );
};

export default Page;