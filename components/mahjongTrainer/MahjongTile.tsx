'use client';

interface MahjongTileProps {
  tile: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function MahjongTile({ tile, selected = false, onClick, disabled = false }: MahjongTileProps) {
  // 牌の種類に基づいて背景色を決定
  const getTileColor = (tile: string) => {
    if (tile.includes('m')) return 'bg-blue-50'; // 萬子
    if (tile.includes('p')) return 'bg-red-50';  // 筒子
    if (tile.includes('s')) return 'bg-green-50'; // 索子
    if (['東', '南', '西', '北'].includes(tile)) return 'bg-yellow-50'; // 風牌
    if (['白', '發', '中'].includes(tile)) return 'bg-purple-50'; // 三元牌
    return 'bg-gray-50';
  };

  // 牌の数字や種類を表示用にフォーマット
  const formatTile = (tile: string) => {
    // 数牌の場合
    if (tile.match(/^[1-9][mps]$/)) {
      const number = tile[0];
      const suit = tile[1];
      const suitName = {
        'm': '萬',
        'p': '筒',
        's': '索'
      }[suit] || '';
      return `${number}${suitName}`;
    }
    // 字牌の場合はそのまま返す
    return tile;
  };

  return (
    <div 
      className={`
        w-12 h-16 flex items-center justify-center 
        border-2 rounded-md cursor-pointer transition-all
        ${getTileColor(tile)}
        ${selected ? 'border-blue-500 shadow-md' : 'border-gray-300'}
        ${disabled ? 'opacity-80' : 'hover:border-blue-300 hover:shadow-sm'}
      `}
      onClick={disabled ? undefined : onClick}
    >
      <span className="text-xl font-bold">{formatTile(tile)}</span>
    </div>
  );
}