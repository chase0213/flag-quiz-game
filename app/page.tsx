'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Smile, Frown } from 'lucide-react';
import { AllCountries } from '@/consts/flags';

const difficultySettings = {
  easy: { countries: AllCountries.filter(c => c.difficulty === 'easy'), optionsCount: 3, questionCount: 10 },
  medium: { countries: AllCountries.filter(c => ['easy', 'medium'].includes(c.difficulty)), optionsCount: 4, questionCount: 15 },
  hard: { countries: AllCountries, optionsCount: 5, questionCount: 20 },
};

const FlagQuizGame = () => {
  const [difficulty, setDifficulty] = useState('easy');
  const [currentFlag, setCurrentFlag] = useState({});
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const correctSoundRef = useRef(null);
  const incorrectSoundRef = useRef(null);

  useEffect(() => {
    correctSoundRef.current = new Audio('/audio/correct-sound.mp3');
    incorrectSoundRef.current = new Audio('/audio/incorrect-sound.mp3');
  }, []);

  const playSound = useCallback((isCorrect) => {
    const sound = isCorrect ? correctSoundRef.current : incorrectSoundRef.current;
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => console.error('Error playing sound:', error));
    }
  }, []);

  const newQuestion = useCallback(() => {
    if (questionNumber >= difficultySettings[difficulty].questionCount) {
      setGameStarted(false);
      return;
    }

    const { countries, optionsCount } = difficultySettings[difficulty];
    const shuffledCountries = [...countries].sort(() => 0.5 - Math.random());
    const questionCountries = shuffledCountries.slice(0, optionsCount);
    const correctAnswer = questionCountries[Math.floor(Math.random() * questionCountries.length)];

    setCurrentFlag(correctAnswer);
    setOptions(questionCountries.map(country => country.yomikata));
    setShowResult(false);
    setIsTransitioning(false);
    setQuestionNumber(prev => prev + 1);
  }, [difficulty, questionNumber]);

  useEffect(() => {
    if (gameStarted && !isTransitioning) {
      setQuestionNumber(0);
      setScore(0);
      newQuestion();
    }
  }, [gameStarted, newQuestion, isTransitioning]);

  const handleAnswer = useCallback((answer) => {
    if (isTransitioning) return;

    const correct = answer === currentFlag.yomikata;
    setIsCorrect(correct);
    setShowResult(true);
    setIsTransitioning(true);
    playSound(correct);

    if (correct) {
      setScore(prevScore => prevScore + 1);
      setTimeout(() => {
        if (questionNumber >= difficultySettings[difficulty].questionCount) {
          setGameStarted(false);
        } else {
          newQuestion();
        }
      }, 2000);
    }
  }, [currentFlag.yomikata, questionNumber, difficulty, newQuestion, playSound]);

  const startGame = useCallback((selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    setQuestionNumber(0);
    setScore(0);
    setIsTransitioning(false);
  }, []);

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4">
        <h1 className="text-4xl font-bold mb-8 text-blue-600">こくき クイズ</h1>
        <Card className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-center">むずかしさを えらんでね</h2>
          <div className="grid grid-cols-1 gap-4">
            <Button onClick={() => startGame('easy')} className="text-xl py-3 bg-green-500 hover:bg-green-600">かんたん (10もん)</Button>
            <Button onClick={() => startGame('medium')} className="text-xl py-3 bg-yellow-500 hover:bg-yellow-600">ふつう (15もん)</Button>
            <Button onClick={() => startGame('hard')} className="text-xl py-3 bg-red-500 hover:bg-red-600">むずかしい (20もん)</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">こくき クイズ</h1>
      <Card className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg transform transition-all hover:scale-105">
        <div className="text-center">
          {!showResult ? (
            <>
              <p className="text-2xl mb-4 font-semibold text-gray-700">このこくきは どこのくに？</p>
              <p className="text-9xl mb-8">{currentFlag.flag}</p>
              <div className="grid grid-cols-1 gap-4">
                {options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="text-xl py-4 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md bg-blue-500 hover:bg-blue-600"
                    disabled={isTransitioning}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-8 animate-fade-in-down">
              {isCorrect ? (
                <div className="flex flex-col items-center justify-center text-green-500">
                  <Smile size={80} className="mb-4" />
                  <p className="text-5xl font-bold mb-4">せいかい！</p>
                  <p className="text-2xl">つぎのもんだいに すすみます</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-red-500">
                  <Frown size={80} className="mb-4" />
                  <p className="text-4xl font-bold mb-4">ざんねん...</p>
                  <p className="text-2xl mb-4">こたえ: {currentFlag.yomikata}</p>
                  <Button
                    onClick={newQuestion}
                    className="mt-6 text-xl bg-purple-500 hover:bg-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105 rounded-full py-3 px-8"
                  >
                    つぎのもんだい
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
      <div className="mt-8 text-center">
        <p className="text-3xl font-bold text-blue-700">とくてん: {score}</p>
        <p className="text-xl text-blue-600">{questionNumber} / {difficultySettings[difficulty].questionCount}</p>
      </div>
      {!gameStarted && questionNumber > 0 && (
        <div className="mt-8 text-center">
          <h2 className="text-3xl font-bold text-green-600">クイズ おわり！</h2>
          <p className="text-2xl mt-4">さいしゅうてん: {score}</p>
          <Button
            onClick={() => setGameStarted(false)}
            className="mt-6 text-xl bg-blue-500 hover:bg-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105 rounded-full py-3 px-8"
          >
            さいしょにもどる
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlagQuizGame;