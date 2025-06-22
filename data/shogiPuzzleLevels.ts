// レベルの型定義
export interface Level {
  title: string;
  description: string;
  initialBoard: string[][];
  winCondition: { piece: string; row: number; col: number }[];
}

// 各レベルの定義
export const levels: Level[] = [
  // レベル1: 基本的な移動
  {
    title: "王の前進",
    description: "王将を前に進めよう！隣接する空白マスに駒を移動させることができます。",
    initialBoard: [
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'king', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
    ],
    winCondition: [
      { piece: 'king', row: 0, col: 2 }
    ]
  },
  
  // レベル2: 障害物がある
  {
    title: "障害物を回避",
    description: "障害物を回避して王将を目標地点に移動させよう！",
    initialBoard: [
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'block', 'block', 'block', 'empty'],
      ['empty', 'block', 'empty', 'block', 'empty'],
      ['empty', 'block', 'king', 'block', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
    ],
    winCondition: [
      { piece: 'king', row: 0, col: 2 }
    ]
  },
  
  // レベル3: 金将を使って道を作る
  {
    title: "金将の助け",
    description: "金将を移動させて王将の通り道を作ろう！",
    initialBoard: [
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'block', 'block', 'block', 'empty'],
      ['empty', 'gold', 'empty', 'gold', 'empty'],
      ['empty', 'block', 'king', 'block', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
    ],
    winCondition: [
      { piece: 'king', row: 0, col: 2 }
    ]
  },
  
  // レベル4: 複数の駒
  {
    title: "王将護衛",
    description: "王将を目標地点に移動させつつ、金将も指定位置に配置しよう！",
    initialBoard: [
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'gold', 'gold', 'empty', 'empty'],
      ['empty', 'empty', 'king', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
    ],
    winCondition: [
      { piece: 'king', row: 0, col: 2 },
      { piece: 'gold', row: 1, col: 1 },
      { piece: 'gold', row: 1, col: 3 }
    ]
  },
  
  // レベル5: より複雑な配置
  {
    title: "攻略への道",
    description: "複数の駒を適切に移動させて、王将を目標地点へ導こう！",
    initialBoard: [
      ['block', 'empty', 'empty', 'empty', 'block'],
      ['empty', 'block', 'gold', 'block', 'empty'],
      ['empty', 'silver', 'empty', 'silver', 'empty'],
      ['empty', 'block', 'king', 'block', 'empty'],
      ['block', 'empty', 'empty', 'empty', 'block'],
    ],
    winCondition: [
      { piece: 'king', row: 0, col: 2 },
      { piece: 'gold', row: 4, col: 2 }
    ]
  },
  
  // レベル6: 高度な配置
  {
    title: "将棋の戦術",
    description: "複数の駒を協力させて王将を目標位置へ！この問題は難しいぞ！",
    initialBoard: [
      ['block', 'empty', 'empty', 'empty', 'block'],
      ['empty', 'silver', 'gold', 'silver', 'empty'],
      ['empty', 'gold', 'empty', 'gold', 'empty'],
      ['empty', 'silver', 'king', 'silver', 'empty'],
      ['block', 'empty', 'empty', 'empty', 'block'],
    ],
    winCondition: [
      { piece: 'king', row: 0, col: 2 },
      { piece: 'gold', row: 1, col: 1 },
      { piece: 'gold', row: 1, col: 3 },
      { piece: 'silver', row: 3, col: 1 },
      { piece: 'silver', row: 3, col: 3 }
    ]
  }
];