'use client';

interface GameControlsProps {
  moves: number;
  isComplete: boolean;
  onReset: () => void;
  onNextLevel: () => void;
  bestMoves?: number;
  showNextButton: boolean;
}

export function GameControls({ 
  moves, 
  isComplete, 
  onReset, 
  onNextLevel, 
  bestMoves, 
  showNextButton 
}: GameControlsProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-amber-900">
            <span className="font-medium">現在の手数: </span>
            <span className="text-xl font-bold">{moves}</span>
          </div>
          
          {bestMoves && (
            <div className="text-green-600">
              <span className="font-medium">最短記録: </span>
              <span className="text-xl font-bold">{bestMoves}</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-amber-100 text-amber-900 rounded-md hover:bg-amber-200 transition-colors"
          >
            リセット
          </button>
          
          {isComplete && showNextButton && (
            <button
              onClick={onNextLevel}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              次のレベルへ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}