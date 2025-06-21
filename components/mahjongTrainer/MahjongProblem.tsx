'use client';

import { useState } from 'react';
import { MahjongTile } from './MahjongTile';

interface MahjongProblemProps {
  tiles: string[];  // 手牌の配列
  onSelect: (tile: string) => void;
  disabled: boolean;
}

export default function MahjongProblem({ tiles, onSelect, disabled }: MahjongProblemProps) {
  const [selectedTile, setSelectedTile] = useState<string | null>(null);

  const handleTileClick = (tile: string) => {
    if (disabled) return;
    setSelectedTile(tile);
  };

  const handleSubmit = () => {
    if (!selectedTile || disabled) return;
    onSelect(selectedTile);
  };

  return (
    <div className="mahjong-problem">
      <div className="mb-4">
        <p className="font-medium mb-2">手牌（何を切りますか？）:</p>
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {tiles.map((tile, index) => (
            <MahjongTile 
              key={`${tile}-${index}`}
              tile={tile}
              selected={tile === selectedTile}
              onClick={() => handleTileClick(tile)}
              disabled={disabled}
            />
          ))}
        </div>
        
        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            disabled={!selectedTile || disabled}
            className={`
              px-6 py-3 rounded-lg text-white font-bold
              ${!selectedTile || disabled 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'}
              transition-colors
            `}
          >
            {selectedTile ? `「${selectedTile}」を切る` : '牌を選択してください'}
          </button>
        </div>
      </div>
    </div>
  );
}