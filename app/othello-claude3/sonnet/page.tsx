'use client'

import React from 'react';
import { useOthello } from '../../../hooks/othello-claude3/sonnet/use-othello';

const Page = () => {
  const { board, currentPlayer, makeMove, resetGame, gameOver, winner, pieces } = useOthello();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-4/5 aspect-square max-w-lg">
        <div className="grid grid-cols-4 gap-0 bg-green-600 border border-black">
          {board.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className="aspect-square border border-black flex items-center justify-center"
                onClick={() => makeMove([x, y])}
              >
                {cell && (
                  <div
                    className={`w-[90%] h-[90%] rounded-full ${
                      cell.player === 'black' ? 'bg-black' : 'bg-white'
                    }`}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-4 text-lg">
        <span className="mr-4">黒: {pieces.black}</span>
        <span>白: {pieces.white}</span>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={resetGame}
      >
        リセット
      </button>
      {gameOver && (
        <div className="mt-4 text-xl font-bold">
          {winner === 'draw' ? '引き分け' : `${winner === 'black' ? '黒' : '白'}の勝ち`}
        </div>
      )}
    </div>
  );
};

export default Page;
