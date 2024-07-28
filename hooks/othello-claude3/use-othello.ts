import { useState, useEffect, useCallback } from 'react'

type Player = 'black' | 'white'
type Cell = Player | null
type Board = Cell[][]

const BOARD_SIZE = 4

const createInitialBoard = (): Board => [
  [null, null, null, null],
  [null, 'white', 'black', null],
  [null, 'black', 'white', null],
  [null, null, null, null],
]

export const useOthello = () => {
  const [board, setBoard] = useState<Board>(createInitialBoard)
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black')
  const [gameOver, setGameOver] = useState(false)

  const isValidMove = useCallback((row: number, col: number, player: Player): boolean => {
    if (board[row][col] !== null) return false

    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ]

    for (const [dx, dy] of directions) {
      let x = row + dx
      let y = col + dy
      let foundOpponent = false

      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
        if (board[x][y] === null) break
        if (board[x][y] === player) {
          if (foundOpponent) return true
          break
        }
        foundOpponent = true
        x += dx
        y += dy
      }
    }

    return false
  }, [board])

  const flipPieces = useCallback((row: number, col: number, player: Player): void => {
    const newBoard = [...board]
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ]

    for (const [dx, dy] of directions) {
      let x = row + dx
      let y = col + dy
      const piecesToFlip: [number, number][] = []

      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
        if (newBoard[x][y] === null) break
        if (newBoard[x][y] === player) {
          for (const [fx, fy] of piecesToFlip) {
            newBoard[fx][fy] = player
          }
          break
        }
        piecesToFlip.push([x, y])
        x += dx
        y += dy
      }
    }

    newBoard[row][col] = player
    setBoard(newBoard)
  }, [board])

  const makeMove = useCallback((row: number, col: number) => {
    if (gameOver || !isValidMove(row, col, currentPlayer)) return

    flipPieces(row, col, currentPlayer)

    const nextPlayer = currentPlayer === 'black' ? 'white' : 'black'
    setCurrentPlayer(nextPlayer)

    if (!hasValidMoves(nextPlayer)) {
      if (!hasValidMoves(currentPlayer)) {
        setGameOver(true)
      } else {
        alert(`${nextPlayer === 'black' ? '黒' : '白'}はパスします`)
        setCurrentPlayer(currentPlayer)
      }
    }
  }, [currentPlayer, gameOver, isValidMove, flipPieces])

  const hasValidMoves = useCallback((player: Player): boolean => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (isValidMove(row, col, player)) {
          return true
        }
      }
    }
    return false
  }, [isValidMove])

  const cpuMove = useCallback(() => {
    const validMoves: [number, number][] = []
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (isValidMove(row, col, 'white')) {
          validMoves.push([row, col])
        }
      }
    }

    if (validMoves.length > 0) {
      const [row, col] = validMoves[Math.floor(Math.random() * validMoves.length)]
      makeMove(row, col)
    } else {
      alert('白はパスします')
      setCurrentPlayer('black')
    }
  }, [isValidMove, makeMove])

  useEffect(() => {
    if (currentPlayer === 'white' && !gameOver) {
      const timer = setTimeout(cpuMove, 500)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, gameOver, cpuMove])

  const countPieces = useCallback((): { black: number, white: number } => {
    let black = 0
    let white = 0
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === 'black') black++
        if (board[row][col] === 'white') white++
      }
    }
    return { black, white }
  }, [board])

  const resetGame = useCallback(() => {
    console.log('Resetting game...')
    console.log('Current board before reset:', JSON.stringify(board))
    const newBoard = createInitialBoard()
    setBoard(newBoard)
    setCurrentPlayer('black')
    setGameOver(false)
    console.log('New board after reset:', JSON.stringify(newBoard))
  }, [])

  useEffect(() => {
    console.log('Current board state:', JSON.stringify(board))
  }, [board])

  return {
    board,
    currentPlayer,
    gameOver,
    makeMove,
    resetGame,
    countPieces,
  }
}