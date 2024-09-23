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
});
