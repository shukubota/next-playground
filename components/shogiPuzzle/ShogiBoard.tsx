'use client';

import { useState, useEffect } from 'react';
import { ShogiPiece } from './ShogiPiece';

interface ShogiBoardProps {
  board: string[][];
  onMove: (row: number, col: number, targetRow: number, targetCol: number) => void;
  isComplete: boolean;
}

export default function ShogiBoard({ board, onMove, isComplete }: ShogiBoardProps) {
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

  // 駒の選択処理
  const handlePieceClick = (row: number, col: number) => {
    const piece = board[row][col];
    
    // 駒を選択した場合
    if (piece !== 'empty' && piece !== 'block') {
      setSelectedPiece({ row, col });
      return;
    }
    
    // 空きマスをクリックした場合
    if (piece === 'empty' && selectedPiece) {
      // 隣接するマスのみ移動可能
      const rowDiff = Math.abs(selectedPiece.row - row);
      const colDiff = Math.abs(selectedPiece.col - col);
      
      if (rowDiff + colDiff === 1) {
        onMove(selectedPiece.row, selectedPiece.col, row, col);
        setSelectedPiece(null);
      }
    }
  };

  // ドラッグアンドドロップは一旦無効化し、クリック操作に集中する

  // マスのスタイルを決定
  const getCellStyle = (row: number, col: number) => {
    const cellId = `${row}-${col}`;
    const isHighlighted = highlightCells[cellId];
    const isSelected = selectedPiece && selectedPiece.row === row && selectedPiece.col === col;
    
    let className = "w-16 h-16 border border-amber-800 flex items-center justify-center relative";
    
    if (isSelected) {
      className += " bg-amber-200 ring-2 ring-amber-500";
    } else if (isHighlighted) {
      className += " bg-amber-100 cursor-pointer ring-2 ring-amber-300 ring-opacity-50";
    } else {
      className += " bg-amber-50";
      if (board[row][col] !== 'empty' && board[row][col] !== 'block') {
        className += " cursor-pointer hover:bg-amber-100";
      }
    }
    
    return className;
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-5 gap-0 bg-amber-100 border-2 border-amber-800 rounded-md overflow-hidden shadow-lg">
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => {
            const cellId = `${rowIndex}-${colIndex}`;
            return (
              <div
                key={cellId}
                data-cell-id={cellId}
                className={getCellStyle(rowIndex, colIndex)}
                onClick={() => handlePieceClick(rowIndex, colIndex)}
              >
                <ShogiPiece 
                  type={cell} 
                  position={[rowIndex, colIndex]}
                  canDrag={!isComplete && cell !== 'block' && cell !== 'empty'}
                />
                {highlightCells[cellId] && (
                  <div className="absolute inset-0 bg-yellow-400 bg-opacity-20 z-0 pointer-events-none" />
                )}
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