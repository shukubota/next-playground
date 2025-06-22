'use client';

import { Level } from '../data';

interface LevelSelectorProps {
  levels: Level[];
  currentLevel: number;
  bestMoves: Record<number, number>;
  onSelect: (level: number) => void;
}

export function LevelSelector({ levels, currentLevel, bestMoves, onSelect }: LevelSelectorProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-lg mb-3 text-amber-900">レベル選択</h3>
      <div className="grid grid-cols-3 gap-2">
        {levels.map((level, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`
              p-2 rounded-md text-center 
              ${index === currentLevel 
                ? 'bg-amber-500 text-white font-bold' 
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'}
              ${bestMoves[index] ? 'border-2 border-green-500' : ''}
              transition-colors
            `}
          >
            <div className="text-lg font-medium">{index + 1}</div>
            {bestMoves[index] && (
              <div className="text-xs mt-1">
                {bestMoves[index]}手
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}