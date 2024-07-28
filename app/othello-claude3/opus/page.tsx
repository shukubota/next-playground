'use client'

import { useOthello } from '../../../hooks/othello-claude3/opus/use-othello'

const Page = () => {
  const { board, playerCount, handleClick, resetGame, gameOver, winner } = useOthello()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="grid grid-cols-4 gap-1 w-4/5 aspect-square bg-green-500">
        {board.map((row, y) => (
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="flex items-center justify-center bg-green-500 border border-black"
              onClick={() => handleClick(x, y)}
            >
              {cell !== null && (
                <div
                  className={`w-[90%] h-[90%] rounded-full ${
                    cell === 'black' ? 'bg-black' : 'bg-white'
                  }`}
                />
              )}
            </div>
          ))
        ))}
      </div>
      <div className="mt-4 text-xl">
        Black: {playerCount.black}, White: {playerCount.white}
      </div>
      {gameOver && <div className="mt-4 text-2xl font-bold">{winner}の勝ち</div>}
      <button
        className="mt-8 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={resetGame}
      >
        リセット
      </button>
    </div>
  )
}

export default Page