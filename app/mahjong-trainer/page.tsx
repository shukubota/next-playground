'use client';

import { useState } from 'react';
import Link from 'next/link';
import MahjongProblem from '../../components/mahjongTrainer/MahjongProblem';
import { ProblemList } from '../../data/mahjongProblems';
import { MahjongTile } from '../../components/mahjongTrainer/MahjongTile';

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
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
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
    <div className="min-h-screen bg-green-800 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-white hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            ホームに戻る
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center">麻雀牌理トレーニング</h1>
          <div className="w-24"></div> {/* スペース調整用 */}
        </div>
        
        <div className="stats-bar bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap md:flex-nowrap justify-between">
          <div className="text-center md:text-left w-full md:w-auto">問題: {currentProblemIndex + 1} / {ProblemList.length}</div>
          <div className="text-center w-full md:w-auto mt-2 md:mt-0">正解率: {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</div>
          <div className="text-center md:text-right w-full md:w-auto mt-2 md:mt-0">正解: {stats.correct} 不正解: {stats.incorrect}</div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
          <div className="mb-6 pb-4 border-b border-gray-200">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mb-2">
              {currentProblem.category} - {currentProblem.difficulty === 'beginner' ? '初級' : currentProblem.difficulty === 'intermediate' ? '中級' : '上級'}
            </span>
            <h2 className="text-xl font-semibold">{currentProblem.title}</h2>
            <p className="text-gray-700 mt-2">{currentProblem.description}</p>
          </div>
          
          <MahjongProblem 
            tiles={currentProblem.tiles} 
            onSelect={handleAnswer}
            disabled={showAnswer}
          />
          
          {showAnswer && (
            <div className={`mt-6 p-4 rounded-lg ${answeredCorrectly ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'}`}>
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mr-2 ${answeredCorrectly ? 'text-green-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {answeredCorrectly 
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> 
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  }
                </svg>
                <h3 className="font-bold text-lg">
                  {answeredCorrectly ? '正解です!' : '不正解です!'}
                </h3>
              </div>
              
              <div className="mb-4">
                <p className="font-medium">正解は「{currentProblem.correctAnswer}」を切ることです。</p>
                <div className="mt-2 flex justify-center">
                  <MahjongTile tile={currentProblem.correctAnswer} />
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border border-gray-200 mb-4">
                <p className="text-gray-800">{currentProblem.explanation}</p>
              </div>
              
              <div className="flex justify-center">
                <button 
                  onClick={nextProblem}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  次の問題へ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}