'use client'

import { useState, useCallback, useEffect } from 'react'

type Player = 'black' | 'white'
type Position = [number, number]
type Cell = { player: Player; position: Position }
type Board = Cell[]

const BOARD_SIZE = 4
const INITIAL_BOARD: Board = [
  { player: 'black', position: [2, 2] },
  { player: 'white', position: [2, 3] },
  { player: 'black', position: [3, 2] },
  { player: 'white', position: [3, 3] },
]

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
]

export const useOthello = () => {
  const [board, setBoard] = useState<Board>(INITIAL_BOARD)
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black')
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<Player | null>(null)

  const isValidMove = useCallback((player: Player, position: Position): boolean => {
    if (board.some(cell => cell.position[0] === position[0] && cell.position[1] === position[1])) {
      return false
    }

    for (const dir of DIRECTIONS) {
      let x = position[0] + dir[0]
      let y = position[1] + dir[1]
      let foundOpponent = false

      while (x >= 1 && x <= BOARD_SIZE && y >= 1 && y <= BOARD_SIZE) {
        const cell = board.find(c => c.position[0] === x && c.position[1] === y)
        if (!cell) break
        if (cell.player === player) {
          if (foundOpponent) return true
          break
        }
        foundOpponent = true
        x += dir[0]
        y += dir[1]
      }
    }

    return false
  }, [board])

  const getValidMoves = useCallback((player: Player): Position[] => {
    const validMoves: Position[] = []
    for (let x = 1; x <= BOARD_SIZE; x++) {
      for (let y = 1; y <= BOARD_SIZE; y++) {
        if (isValidMove(player, [x, y])) {
          validMoves.push([x, y])
        }
      }
    }
    return validMoves
  }, [isValidMove])

  const flipCells = useCallback((player: Player, position: Position): Board => {
    const newBoard = [...board]

    for (const dir of DIRECTIONS) {
      let x = position[0] + dir[0]
      let y = position[1] + dir[1]
      const cellsToFlip: Position[] = []

      while (x >= 1 && x <= BOARD_SIZE && y >= 1 && y <= BOARD_SIZE) {
        const cellIndex = newBoard.findIndex(c => c.position[0] === x && c.position[1] === y)
        if (cellIndex === -1) break
        if (newBoard[cellIndex].player === player) {
          cellsToFlip.forEach(pos => {
            const idx = newBoard.findIndex(c => c.position[0] === pos[0] && c.position[1] === pos[1])
            if (idx !== -1) newBoard[idx].player = player
          })
          break
        }
        cellsToFlip.push([x, y])
        x += dir[0]
        y += dir[1]
      }
    }

    newBoard.push({ player, position })
    return newBoard
  }, [board])

  const makeMove = useCallback((position: Position) => {
    if (gameOver || !isValidMove(currentPlayer, position)) return

    const newBoard = flipCells(currentPlayer, position)
    setBoard(newBoard)
    console.log(JSON.stringify(newBoard))

    const nextPlayer = currentPlayer === 'black' ? 'white' : 'black'
    setCurrentPlayer(nextPlayer)

    if (getValidMoves(nextPlayer).length === 0) {
      if (getValidMoves(currentPlayer).length === 0) {
        endGame()
      } else {
        alert(`${nextPlayer === 'black' ? '黒' : '白'}はパスします`)
        setCurrentPlayer(currentPlayer)
      }
    }
  }, [currentPlayer, gameOver, isValidMove, flipCells, getValidMoves])

  const getCellCounts = useCallback(() => {
    const counts = { black: 0, white: 0 }
    board.forEach(cell => {
      counts[cell.player]++
    })
    return counts
  }, [board])

  const endGame = useCallback(() => {
    setGameOver(true)
    const counts = getCellCounts()
    if (counts.black > counts.white) setWinner('black')
    else if (counts.white > counts.black) setWinner('white')
    else setWinner(null)
  }, [getCellCounts])

  const resetGame = useCallback(() => {
    setBoard(INITIAL_BOARD)
    setCurrentPlayer('black')
    setGameOver(false)
    setWinner(null)
  }, [])

  useEffect(() => {
    if (currentPlayer === 'white' && !gameOver) {
      setTimeout(() => {
        const validMoves = getValidMoves('white')
        if (validMoves.length > 0) {
          const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
          makeMove(randomMove)
        } else {
          alert('白はパスします')
          setCurrentPlayer('black')
        }
      }, 500)
    }
  }, [currentPlayer, gameOver, getValidMoves, makeMove])

  return {
    board,
    currentPlayer,
    gameOver,
    winner,
    makeMove,
    getCellCounts,
    resetGame,
  }
}