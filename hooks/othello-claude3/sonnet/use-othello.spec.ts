import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useOthello } from './use-othello'

describe('useOthello', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  it('should initialize the board with correct initial state', () => {
    const { result } = renderHook(() => useOthello())

    // ボードの長さが4であることを確認（初期状態では4つの石）
    expect(result.current.board).toHaveLength(4)

    // 黒の石が正しい位置にあることを確認
    expect(result.current.board).toContainEqual({ player: 'black', position: [2, 2] })
    expect(result.current.board).toContainEqual({ player: 'black', position: [3, 3] })

    // 白の石が正しい位置にあることを確認
    expect(result.current.board).toContainEqual({ player: 'white', position: [2, 3] })
    expect(result.current.board).toContainEqual({ player: 'white', position: [3, 2] })

    // 黒と白の石がそれぞれ2つずつあることを確認
    const blackStones = result.current.board.filter(cell => cell.player === 'black')
    const whiteStones = result.current.board.filter(cell => cell.player === 'white')
    expect(blackStones).toHaveLength(2)
    expect(whiteStones).toHaveLength(2)

    // 初期プレイヤーが黒であることを確認
    expect(result.current.currentPlayer).toBe('black')
  })

  it('should correctly flip one white stone when black plays at [1, 3]', () => {
    const { result } = renderHook(() => useOthello())

    act(() => {
      result.current.makeMove([1, 3])
    })

    // ボードの状態を確認
    expect(result.current.board).toHaveLength(5)  // 4 initial + 1 new

    // board全体の状態を確認
    expect(result.current.board).toEqual([
      { player: 'black', position: [2, 2] },
      { player: 'black', position: [2, 3] },  // This was flipped from white to black
      { player: 'black', position: [3, 3] },
      { player: 'white', position: [3, 2] },
      { player: 'black', position: [1, 3] }   // Newly placed black stone
    ])

    // 新しく置かれた黒石を確認
    expect(result.current.board).toContainEqual({ player: 'black', position: [1, 3] })

    // 反転した石を確認 ([2, 3]が白から黒に変わっているはず)
    expect(result.current.board).toContainEqual({ player: 'black', position: [2, 3] })

    // 反転していない石を確認
    expect(result.current.board).toContainEqual({ player: 'black', position: [2, 2] })
    expect(result.current.board).toContainEqual({ player: 'black', position: [3, 3] })
    expect(result.current.board).toContainEqual({ player: 'white', position: [3, 2] })

    // 黒石が4つ、白石が1つになっていることを確認
    const blackStones = result.current.board.filter(cell => cell.player === 'black')
    const whiteStones = result.current.board.filter(cell => cell.player === 'white')
    expect(blackStones).toHaveLength(4)
    expect(whiteStones).toHaveLength(1)

    // プレイヤーが白に変わっていることを確認
    expect(result.current.currentPlayer).toBe('white')
  })

  it('should make an automatic move for white after 500ms', async () => {
    const { result } = renderHook(() => useOthello())

    console.log(result.current.board)

    act(() => {
      result.current.makeMove([1, 3])
    })

    console.log('Board after black move:', JSON.stringify(result.current.board))
    console.log('Current player after black move:', result.current.currentPlayer)

    // 黒の手後の状態を確認
    expect(result.current.board).toHaveLength(5)
    expect(result.current.currentPlayer).toBe('white')

    // 500ms以上経過させる
    await act(async () => {
      await vi.advanceTimersByTimeAsync(501)
    })

    console.log('Board after white move:', JSON.stringify(result.current.board))
    console.log('Current player after white move:', result.current.currentPlayer)

    // 白の自動着手後の状態を確認
    expect(result.current.board).toHaveLength(6)  // 5 previous + 1 new
    expect(result.current.currentPlayer).toBe('black')
  })
  it('should reset the game to initial state when reset button is pressed', () => {
    const { result } = renderHook(() => useOthello())

    // Set up a specific board state
    act(() => {
      result.current.setBoard([
        {player: "white", position: [2,2]},
        {player: "black", position: [2,3]},
        {player: "black", position: [3,3]},
        {player: "white", position: [3,2]},
        {player: "black", position: [1,3]},
        {player: "white", position: [1,2]}
      ])
      result.current.setCurrentPlayer('white')
    })

    // Verify the setup
    expect(result.current.board).toHaveLength(6)
    expect(result.current.currentPlayer).toBe('white')

    // Simulate pressing the reset button
    act(() => {
      result.current.resetGame()
    })

    // Verify the game has been reset to initial state
    expect(result.current.board).toHaveLength(4)
    expect(result.current.board).toEqual([
      { player: 'black', position: [2, 2] },
      { player: 'white', position: [2, 3] },
      { player: 'black', position: [3, 3] },
      { player: 'white', position: [3, 2] }
    ])
    expect(result.current.currentPlayer).toBe('black')
    expect(result.current.gameOver).toBe(false)
    expect(result.current.winner).toBeNull()

    // Verify the correct number of black and white stones
    const blackStones = result.current.board.filter(cell => cell.player === 'black')
    const whiteStones = result.current.board.filter(cell => cell.player === 'white')
    expect(blackStones).toHaveLength(2)
    expect(whiteStones).toHaveLength(2)
  })
})
