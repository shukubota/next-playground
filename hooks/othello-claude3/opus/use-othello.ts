import { useState, useEffect } from 'react'

type Player = 'black' | 'white'
type Cell = Player | null
type Board = Cell[][]
type Position = [number, number]

const initialBoard: Board = [
  [null, null, null, null],
  [null, 'white', 'black', null],
  [null, 'black', 'white', null],
  [null, null, null, null],
]

const directions: Position[] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
]

export const useOthello = () => {
  const [board, setBoard] = useState<Board>(initialBoard)
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black')
  const [playerCount, setPlayerCount] = useState({ black: 2, white: 2 })
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState('')

  const isValidMove = (x: number, y: number, player: Player): boolean => {
    if (board[y][x] !== null) return false

    for (const [dx, dy] of directions) {
      let nx = x + dx, ny = y + dy
      let hasOpponent = false

      while (nx >= 0 && nx < 4 && ny >= 0 && ny < 4) {
        if (board[ny][nx] === null) break
        if (board[ny][nx] === player) {
          if (hasOpponent) return true
          break
        }
        hasOpponent = true
        nx += dx
        ny += dy
      }
    }

    return false
  }

  const flipCells = (x: number, y: number, player: Player) => {
    const newBoard = board.map(row => [...row])
    newBoard[y][x] = player

    for (const [dx, dy] of directions) {
      let nx = x + dx, ny = y + dy
      const flipCells: Position[] = []

      while (nx >= 0 && nx < 4 && ny >= 0 && ny < 4) {
        if (board[ny][nx] === null) break
        if (board[ny][nx] === player) {
          flipCells.forEach(([fx, fy]) => {
            newBoard[fy][fx] = player
          })
          break
        }
        flipCells.push([nx, ny])
        nx += dx
        ny += dy
      }
    }

    setBoard(newBoard)
    setCurrentPlayer(player === 'black' ? 'white' : 'black')
    setPlayerCount({
      black: newBoard.flat().filter(cell => cell === 'black').length,
      white: newBoard.flat().filter(cell => cell === 'white').length,
    })
  }

  const handleClick = (x: number, y: number) => {
    if (currentPlayer !== 'black' || gameOver) return
    if (!isValidMove(x, y, currentPlayer)) return

    flipCells(x, y, currentPlayer)
  }

  const computerMove = () => {
    if (currentPlayer !== 'white' || gameOver) return

    const validMoves: Position[] = []
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (isValidMove(x, y, currentPlayer)) {
          validMoves.push([x, y])
        }
      }
    }

    if (validMoves.length === 0) {
      alert('Computer passes')
      setCurrentPlayer('black')
      return
    }

    const [x, y] = validMoves[Math.floor(Math.random() * validMoves.length)]
    setTimeout(() => flipCells(x, y, currentPlayer), 500)
  }

  const resetGame = () => {
    setBoard(initialBoard)
    setCurrentPlayer('black')
    setPlayerCount({ black: 2, white: 2 })
    setGameOver(false)
    setWinner('')
  }

  useEffect(() => {
    if (currentPlayer === 'white') {
      computerMove()
    }
  }, [currentPlayer])

  useEffect(() => {
    if (playerCount.black + playerCount.white === 16) {
      setGameOver(true)
      setWinner(playerCount.black > playerCount.white ? '黒' : '白')
    }
  }, [playerCount])

  return { board, playerCount, handleClick, resetGame, gameOver, winner }
}
