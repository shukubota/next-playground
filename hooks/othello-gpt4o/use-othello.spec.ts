import { renderHook, act } from '@testing-library/react-hooks';
import { useOthello } from './use-othello';
import { describe, it, expect } from 'vitest';

describe('useOthello', () => {
  it('should initialize with the correct game state', () => {
    const { result } = renderHook(() => useOthello());

    const initialGameState = [
      [null, null, null, null],
      [null, 'black', 'white', null],
      [null, 'white', 'black', null],
      [null, null, null, null],
    ];

    // 初期盤面が正しいかをテスト
    expect(result.current.gameState).toEqual(initialGameState);

    // 初期プレイヤーが "black" かをテスト
    expect(result.current.blackCount).toBe(2);
    expect(result.current.whiteCount).toBe(2);

    // ゲームの勝者がいない状態で初期化されているかをテスト
    expect(result.current.winner).toBeNull();
  });

  it('should place a black piece on (2, 4) and update the game state', () => {
    const { result } = renderHook(() => useOthello());

    // 初手 (2,4) に黒が置かれる (0-indexedで考えるので [1, 3])
    act(() => {
      result.current.handleCellClick(1, 3); // (2, 4) に黒を配置
    });

    // コマが正しく置かれたかを確認
    const expectedGameState = [
      [null, null, null, null],
      [null, 'black', 'white', 'black'], // (2, 4) に黒が追加
      [null, 'white', 'black', null],
      [null, null, null, null],
    ];

    expect(result.current.gameState).toEqual(expectedGameState);

    // 黒のコマ数が増えているかを確認
    expect(result.current.blackCount).toBe(3);
    // 白のコマ数は変わらない
    expect(result.current.whiteCount).toBe(2);
  });
});
