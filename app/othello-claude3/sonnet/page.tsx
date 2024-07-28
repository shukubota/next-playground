'use client'

import { useOthello } from '../../../hooks/othello-claude3/sonnet/use-othello'

const Page = () => {
  const { board, currentPlayer, gameOver, winner, makeMove, getCellCounts, resetGame } = useOthello()

  const renderCell = (x: number, y: number) => {
    const cell = board.find(c => c.position[0] === x && c.position[1] === y)
    return (
      <div
        key={`${x}-${y}`}
        className="relative w-full h-full border border-black flex items-center justify-center cursor-pointer"
        onClick={() => makeMove([x, y])}
      >
        {cell && (
          <div
            className={`w-[90%] h-[90%] rounded-full ${
              cell.player === 'black' ? 'bg-black' : 'bg-white'
            }`}
          />
        )}
        <span className="absolute bottom-0 left-0 text-xs text-gray-600 dark:text-gray-400">
          ({x},{y})
        </span>
      </div>
    )
  }

  const counts = getCellCounts()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 p-4">
      <div
        className="w-4/5 aspect-square bg-green-600 dark:bg-green-800 grid grid-cols-4 grid-rows-4 gap-0 border-2 border-black"
      >
        {Array.from({ length: 16 }, (_, i) => renderCell(Math.floor(i / 4) + 1, (i % 4) + 1))}
      </div>
      <div className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-200">
        {gameOver
          ? `ゲーム終了: ${winner ? (winner === 'black' ? '黒の勝ち' : '白の勝ち') : '引き分け'}`
          : `現在のプレイヤー: ${currentPlayer === 'black' ? '黒' : '白'}`}
      </div>
      <div className="mt-2 text-gray-700 dark:text-gray-300">
        黒: {counts.black} | 白: {counts.white}
      </div>
      <button
        onClick={resetGame}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        リセット
      </button>
    </div>
  )
}

export default Page