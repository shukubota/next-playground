'use client';

import { useState } from 'react';
import MahjongProblem from '../../components/mahjongTrainer/MahjongProblem';
import { ProblemList } from '../../data/mahjongProblems';

export default function MahjongTrainerPage() {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total: 0 });

  const currentProblem = ProblemList[currentProblemIndex];

  const handleAnswer = (selectedTile: string) => {
    const isCorrect = selectedTile === currentProblem.correctAnswer;
    setAnsweredCorrectly(isCorrect);
    setShowAnswer(true);
    setStats(prev => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: isCorrect ? prev.incorrect : prev.incorrect + 1,
      total: prev.total + 1
    }));
  };

  const nextProblem = () => {
    const nextIndex = (currentProblemIndex + 1) % ProblemList.length;
    setCurrentProblemIndex(nextIndex);
    setShowAnswer(false);
    setAnsweredCorrectly(null);
  };

  return (
    <div className="min-h-screen bg-green-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">麻雀牌理トレーニング</h1>
      
      <div className="stats-bar bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between">
        <div>問題: {currentProblemIndex + 1} / {ProblemList.length}</div>
        <div>正解率: {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</div>
        <div>正解: {stats.correct} 不正解: {stats.incorrect}</div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">問題: {currentProblem.title}</h2>
        <p className="mb-4">{currentProblem.description}</p>
        
        <MahjongProblem 
          tiles={currentProblem.tiles} 
          onSelect={handleAnswer}
          disabled={showAnswer}
        />
        
        {showAnswer && (
          <div className={`mt-6 p-4 rounded-lg ${answeredCorrectly ? 'bg-green-100' : 'bg-red-100'}`}>
            <h3 className="font-bold">
              {answeredCorrectly ? '正解!' : '不正解!'}
            </h3>
            <p className="mt-2">{currentProblem.explanation}</p>
            <button 
              onClick={nextProblem}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              次の問題へ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}