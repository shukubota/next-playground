'use client'

import { useOthello } from '../../hooks/othello-claude3/use-othello'

const Page = () => {
  const { board, currentPlayer, gameOver, makeMove, resetGame, countPieces } = useOthello()
  const { black, white } = countPieces()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-4/5 aspect-square">
        <div className="grid grid-cols-4 gap-0 bg-green-600 border border-black">
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="aspect-square border border-black flex items-center justify-center"
                onClick={() => currentPlayer === 'black' && makeMove(rowIndex, colIndex)}
              >
                {cell && (
                  <div className={`w-[90%] h-[90%] rounded-full ${cell === 'black' ? 'bg-black' : 'bg-white'}`} />
                )}
              </div>
            ))
          ))}
        </div>
      </div>
      <div className="mt-4 text-xl">
        <span className="mr-4">黒: {black}</span>
        <span>白: {white}</span>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={resetGame}
      >
        リセット
      </button>
      {gameOver && (
        <div className="mt-4 text-2xl font-bold">
          {black > white ? '黒の勝ち' : black < white ? '白の勝ち' : '引き分け'}
        </div>
      )}
    </div>
  )
}

export default Page
