export interface MahjongProblem {
  id: number;
  title: string;
  description: string;
  tiles: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

export const ProblemList: MahjongProblem[] = [
  {
    id: 1,
    title: "基本形の牌効率 - 両面と嵌張",
    description: "テンパイまであと1枚で、最も効率の良い打牌を選んでください。",
    tiles: ['2m', '3m', '4m', '5m', '6m', '1p', '2p', '4p', '5p', '2s', '3s', '5s', '6s'],
    correctAnswer: '1p',
    explanation: "1pを切ることで、2-3m, 4-5m, 5-6mの両面待ちと2-4pの嵌張待ちを維持できます。孤立した1pより、複数の塔子（搭子）を保持する方が効率的です。",
    difficulty: 'beginner',
    category: '牌効率'
  },
  {
    id: 2,
    title: "基本形の牌効率 - 辺張の扱い",
    description: "最も効率的な打牌を選んでください。",
    tiles: ['1m', '2m', '4m', '5m', '7p', '8p', '2s', '3s', '5s', '6s', '7s', '9s', '北'],
    correctAnswer: '北',
    explanation: "北を切ることで、1-2m（辺張）, 4-5m（両面）, 7-8p（辺張）, 2-3s（両面）, 5-6-7s（塔子+両面）を維持できます。字牌の北は発展性がないため切るべきです。",
    difficulty: 'beginner',
    category: '牌効率'
  },
  {
    id: 3,
    title: "複合形の判断 - 2つの選択肢",
    description: "この手牌から1枚切るとしたら？",
    tiles: ['2m', '4m', '5m', '6m', '7m', '3p', '4p', '5p', '1s', '2s', '6s', '7s', '8s'],
    correctAnswer: '1s',
    explanation: "1sを切ることで、2m（単騎）, 4-5-6-7m（リャンカン塔子）, 3-4-5p（完成した順子）, 2s（単騎）, 6-7-8s（完成した順子）という形になります。辺張の1-2sよりも、より多くの待ちを持つ可能性がある2mを単騎で残す方が効率的です。",
    difficulty: 'intermediate',
    category: '複合形'
  },
  {
    id: 4,
    title: "中張牌の扱い",
    description: "効率を考えて1枚切ってください。",
    tiles: ['1m', '9m', '2p', '3p', '4p', '5p', '6p', '7p', '3s', '4s', '5s', '6s', '7s'],
    correctAnswer: '9m',
    explanation: "9mを切ることで、1m（単騎）, 2-3-4p（順子）, 5-6-7p（順子）, 3-4-5s（順子）, 6-7s（両面）という形になります。端牌である9mは1mと比較して、1mは2と連携できる可能性があるため、より価値が低いです。",
    difficulty: 'beginner',
    category: '端牌と中張牌'
  },
  {
    id: 5,
    title: "対子の価値判断",
    description: "手牌効率を考えて1枚切ってください。",
    tiles: ['3m', '3m', '4m', '5m', '2p', '2p', '6p', '7p', '8p', '3s', '4s', '東', '東'],
    correctAnswer: '3s',
    explanation: "3sを切ることで、3-3m（対子）, 4-5m（両面）, 2-2p（対子）, 6-7-8p（順子）, 4s（単騎）, 東-東（対子）という形になります。孤立した4sより連携のない3sを切るのが正解です。",
    difficulty: 'intermediate',
    category: '対子の扱い'
  },
  {
    id: 6,
    title: "複合形の難問",
    description: "最も効率的な打牌を選んでください。",
    tiles: ['2m', '4m', '5m', '6m', '2p', '3p', '4p', '5p', '6p', '3s', '4s', '5s', '6s'],
    correctAnswer: '2m',
    explanation: "2mを切ることで、4-5-6m（順子）, 2-3-4p（順子）, 5-6p（両面）, 3-4-5-6s（一盃口形）という形になります。2mは孤立牌であり、他の牌と比較して発展性が低いです。",
    difficulty: 'advanced',
    category: '複合形'
  },
  {
    id: 7,
    title: "良形と愚形の選択",
    description: "打牌効率を考えてください。",
    tiles: ['2m', '3m', '7m', '8m', '9m', '2p', '3p', '4p', '2s', '3s', '4s', '5s', '6s'],
    correctAnswer: '9m',
    explanation: "9mを切ることで、2-3m（両面）, 7-8m（辺張）, 2-3-4p（順子）, 2-3-4s（順子）, 5-6s（両面）という形になります。端牌の9mは7-8mと辺張待ちになりますが、他の部分の発展性を考えると切るべき牌です。",
    difficulty: 'beginner',
    category: '良形と愚形'
  },
  {
    id: 8,
    title: "孤立牌の選択",
    description: "最も効率の悪い1枚を切ってください。",
    tiles: ['1m', '2m', '4m', '5m', '7m', '2p', '3p', '5p', '7p', '8p', '5s', '6s', '7s'],
    correctAnswer: '7p',
    explanation: "7pを切ることで、1-2m（辺張）, 4-5m（両面）, 7m（単騎）, 2-3p（両面）, 5p（単騎）, 8p（単騎）, 5-6-7s（順子）という形になります。7pは8pと辺張になりますが、周囲の牌との連携が最も弱いです。",
    difficulty: 'intermediate',
    category: '孤立牌の扱い'
  },
  {
    id: 9,
    title: "中張牌の価値",
    description: "手牌の効率を最大化するために1枚切ってください。",
    tiles: ['1m', '2m', '3m', '5m', '6m', '7m', '2p', '3p', '4p', '3s', '4s', '5s', '9s'],
    correctAnswer: '9s',
    explanation: "9sを切ることで、1-2-3m（順子）, 5-6-7m（順子）, 2-3-4p（順子）, 3-4-5s（順子）という非常に良い形になります。9sは孤立した端牌で、他の牌と比較して明らかに価値が低いです。",
    difficulty: 'beginner',
    category: '端牌と中張牌'
  },
  {
    id: 10,
    title: "対子と搭子の選択",
    description: "最も効率的な打牌を選んでください。",
    tiles: ['3m', '3m', '5m', '6m', '7m', '3p', '4p', '5p', '7p', '7p', '2s', '3s', '4s'],
    correctAnswer: '7p',
    explanation: "対子がある場合でも、7pを切って7pの対子を崩すのが正解です。残りの手牌は3-3m（対子）, 5-6-7m（順子）, 3-4-5p（順子）, 7p（単騎）, 2-3-4s（順子）という非常に良い形になります。",
    difficulty: 'advanced',
    category: '対子の扱い'
  }
];