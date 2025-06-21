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
    onSelect(tile);
  };

  return (
    <div className="mahjong-problem">
      <div className="mb-4">
        <p className="font-medium mb-2">手牌（何を切りますか？）:</p>
        <div className="flex flex-wrap gap-1">
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
      </div>
    </div>
  );
}