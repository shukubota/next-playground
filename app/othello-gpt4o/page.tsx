'use client'
import { useOthello } from '../../hooks/othello-gpt4o/use-othello';

const Page = () => {
  const {
    gameState,
    handleCellClick,
    resetGame,
    blackCount,
    whiteCount,
    winner
  } = useOthello();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="grid grid-cols-4 grid-rows-4 w-4/5 aspect-square bg-green-500 border-black border-2">
        {gameState.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="relative flex items-center justify-center border border-black"
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell && (
                <div
                  className={`rounded-full ${
                    cell === 'black' ? 'bg-black' : 'bg-white'
                  }`}
                  style={{ width: '90%', height: '90%' }}
                />
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex space-x-4 mt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={resetGame}
        >
          リセット
        </button>
      </div>

      <div className="mt-4">
        <p>黒のコマ数: {blackCount}</p>
        <p>白のコマ数: {whiteCount}</p>
      </div>

      {winner && (
        <div className="mt-4">
          <p>{winner === 'black' ? '黒の勝' : '白の勝'}</p>
        </div>
      )}
    </div>
  );
};

export default Page;
