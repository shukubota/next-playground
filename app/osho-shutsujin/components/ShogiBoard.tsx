'use client';

import { useState, useEffect } from 'react';
import { ShogiPiece } from './ShogiPiece';

interface ShogiBoardProps {
  board: string[][];
  onMove: (row: number, col: number, targetRow: number, targetCol: number) => void;
  isComplete: boolean;
}

export function ShogiBoard({ board, onMove, isComplete }: ShogiBoardProps) {
  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null);
  const [highlightCells, setHighlightCells] = useState<{ [key: string]: boolean }>({});

  // 移動可能なマスをハイライト表示
  useEffect(() => {
    if (!selectedPiece) {
      setHighlightCells({});
      return;
    }

    const { row, col } = selectedPiece;
    const newHighlightCells: { [key: string]: boolean } = {};

    // 上下左右のマスをチェック
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    directions.forEach(([dRow, dCol]) => {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      // ボード内で、かつ空きマスの場合
      if (
        newRow >= 0 && newRow < board.length &&
        newCol >= 0 && newCol < board[0].length &&
        board[newRow][newCol] === 'empty'
      ) {
        newHighlightCells[`${newRow}-${newCol}`] = true;
      }
    });

    setHighlightCells(newHighlightCells);
  }, [selectedPiece, board]);

  // マス目のクリック処理
  const handleCellClick = (row: number, col: number) => {
    const piece = board[row][col];

    // 駒を選択した場合
    if (piece !== 'empty' && piece !== 'block') {
      setSelectedPiece({ row, col });
      return;
    }

    // 空きマスをクリックし、選択中の駒がある場合
    if (piece === 'empty' && selectedPiece) {
      const cellId = `${row}-${col}`;
      
      // 移動可能なマスの場合のみ移動
      if (highlightCells[cellId]) {
        onMove(selectedPiece.row, selectedPiece.col, row, col);
        setSelectedPiece(null);
      }
    }
  };

  // マスのスタイルを決定
  const getCellStyle = (row: number, col: number) => {
    const cellId = `${row}-${col}`;
    const isHighlighted = highlightCells[cellId];
    
    let className = "w-16 h-16 border border-amber-800 flex items-center justify-center relative";
    
    if (isHighlighted) {
      className += " bg-yellow-100 cursor-pointer ring-2 ring-yellow-300";
    } else {
      className += " bg-amber-50";
    }
    
    return className;
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-5 gap-0 bg-amber-100 border-2 border-amber-800 rounded-md overflow-hidden shadow-lg">
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => {
            const cellId = `${rowIndex}-${colIndex}`;
            const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
            
            return (
              <div
                key={cellId}
                className={getCellStyle(rowIndex, colIndex)}
              >
                <ShogiPiece 
                  type={cell} 
                  position={[rowIndex, colIndex]}
                  isSelected={isSelected}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  canMove={!isComplete && cell !== 'block'}
                />
              </div>
            );
          })
        ))}
      </div>
      
      {isComplete && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-md z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="text-3xl text-yellow-500 mb-2">🏆</div>
            <h3 className="text-xl font-bold text-amber-900 mb-2">クリア！</h3>
            <p className="text-gray-700">おめでとうございます！</p>
          </div>
        </div>
      )}
    </div>
  );
}