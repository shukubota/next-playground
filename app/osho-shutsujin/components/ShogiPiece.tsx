'use client';

interface ShogiPieceProps {
  type: string;
  position: [number, number];
  isSelected?: boolean;
  onClick?: () => void;
  canMove?: boolean;
}

export function ShogiPiece({ 
  type, 
  position, 
  isSelected = false, 
  onClick, 
  canMove = true 
}: ShogiPieceProps) {
  // 空のマスの場合は何も表示しない
  if (type === 'empty') {
    return <div className="w-16 h-16" onClick={onClick}></div>;
  }

  // 駒の表示用テキスト
  const getPieceLabel = () => {
    switch (type) {
      case 'king':
        return '王';
      case 'gold':
        return '金';
      case 'silver':
        return '銀';
      case 'knight':
        return '桂';
      case 'lance':
        return '香';
      case 'bishop':
        return '角';
      case 'rook':
        return '飛';
      case 'pawn':
        return '歩';
      case 'block':
        return '■';
      default:
        return type;
    }
  };

  // 駒の背景色
  const getPieceColor = () => {
    switch (type) {
      case 'king':
        return 'bg-amber-400';
      case 'gold':
        return 'bg-yellow-300';
      case 'silver':
        return 'bg-gray-300';
      case 'knight':
        return 'bg-green-200';
      case 'lance':
        return 'bg-blue-200';
      case 'bishop':
        return 'bg-purple-200';
      case 'rook':
        return 'bg-red-200';
      case 'pawn':
        return 'bg-amber-100';
      case 'block':
        return 'bg-gray-800';
      default:
        return 'bg-white';
    }
  };

  return (
    <div 
      className={`
        w-16 h-16 flex items-center justify-center
        transition-all duration-200
        ${canMove && type !== 'block' ? 'cursor-pointer hover:scale-105' : ''}
        ${isSelected ? 'scale-105' : ''}
      `}
      onClick={onClick}
    >
      <div className={`
        w-14 h-14 flex items-center justify-center 
        border-2 ${isSelected ? 'border-blue-500' : 'border-amber-900'} shadow-md
        ${getPieceColor()}
        rounded-sm transform rotate-0
        ${isSelected ? 'ring-2 ring-blue-300' : ''}
      `}>
        <span className={`text-3xl font-bold ${type === 'block' ? 'text-white' : 'text-amber-950'}`}>
          {getPieceLabel()}
        </span>
      </div>
    </div>
  );
}