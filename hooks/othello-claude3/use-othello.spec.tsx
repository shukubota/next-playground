// use-othello.test.tsx
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useOthello } from './use-othello'

// テスト用のコンポーネント
const TestComponent: React.FC = () => {
  const { board, resetGame, makeMove } = useOthello()

  return (
    <div>
      <div data-testid="board">
        {JSON.stringify(board)}
      </div>
      <button onClick={() => resetGame()}>Reset</button>
      {/* カスタム盤面を作成するために必要な手を実行 */}
      <button onClick={() => {
        makeMove(0, 1)  // 黒を(0,1)に配置
        makeMove(1, 2)  // 白を(1,2)に配置
        makeMove(2, 0)  // 黒を(2,0)に配置
      }}>Make Custom Board</button>
    </div>
  )
}

describe('useOthello', () => {
  it('resets the game correctly after making moves', async () => {
    vi.useFakeTimers()

    render(<TestComponent />)

    // いくつかの手を打って盤面を変更
    fireEvent.click(screen.getByText('Make Custom Board'))

    // タイマーを進める（CPUの手を処理）
    act(() => {
      vi.runAllTimers()
    })

    // ゲームをリセット
    fireEvent.click(screen.getByText('Reset'))

    // タイマーを進める
    act(() => {
      vi.runAllTimers()
    })

    // 盤面が初期状態にリセットされていることを確認
    expect(screen.getByTestId('board').textContent).toBe(JSON.stringify([
      [null, null, null, null],
      [null, 'white', 'black', null],
      [null, 'black', 'white', null],
      [null, null, null, null]
    ]))

    vi.useRealTimers()
  })
})
