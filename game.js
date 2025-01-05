import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Target, RotateCcw, Volume2, VolumeX, Award } from 'lucide-react';

const Game = () => {
  const [timer, setTimer] = useState(0);
  const [targetTime, setTargetTime] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [streak, setStreak] = useState(0);
  const [gameMessage, setGameMessage] = useState('¡Prepárate para jugar!');
  const [level, setLevel] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [achievements, setAchievements] = useState({
    perfectTiming: false,
    streakMaster: false,
    levelMaster: false
  });

  const difficultySettings = {
    easy: { margin: 500, points: 100, unlockScore: 0 },
    medium: { margin: 300, points: 200, unlockScore: 1000 },
    hard: { margin: 150, points: 300, unlockScore: 2500 }
  };

  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    
    const sounds = {
      success: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzeR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77NdGQg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHgU5k9Xxy3orBSN1xe/dkkILFF207Ou'),
      failure: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzeR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77NdGQg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHgU5k9Xxy3orBSN1xe/dkkILFF207Ou'),
      click: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzeR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77NdGQg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHgU5k9Xxy3orBSN1xe/dkkILFF207Ou')
    };
    sounds[type].play();
  }, [soundEnabled]);

  const generateTargetTime = useCallback(() => {
    const minTime = 2000;
    const maxTime = difficulty === 'easy' ? 8000 : 
                    difficulty === 'medium' ? 6000 : 4000;
    return Math.floor(Math.random() * (maxTime - minTime) + minTime);
  }, [difficulty]);

  useEffect(() => {
    setTargetTime(generateTargetTime());
  }, [difficulty, generateTargetTime]);

  useEffect(() => {
    let interval;
    if (isPressed) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isPressed]);

  useEffect(() => {
    const newLevel = Math.floor(score / 1000) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      setGameMessage(`¡Nivel ${newLevel} alcanzado!`);
      playSound('success');
    }
    
    const newAchievements = { ...achievements };
    if (streak >= 5 && !achievements.streakMaster) {
      newAchievements.streakMaster = true;
      setGameMessage('¡Logro desbloqueado: Maestro de rachas!');
    }
    if (level >= 5 && !achievements.levelMaster) {
      newAchievements.levelMaster = true;
      setGameMessage('¡Logro desbloqueado: Maestro de niveles!');
    }
    setAchievements(newAchievements);
  }, [score, streak, level, achievements, playSound]);

  const handleStart = (e) => {
    if (gameState === 'ready') {
      setIsPressed(true);
      setGameState('playing');
      setTimer(0);
      setGameMessage('¡Mantén pulsado el botón!');
      playSound('click');
    }
  };

  const handleStop = (e) => {
    if (gameState === 'playing') {
      setIsPressed(false);
      setGameState('finished');
      const difference = Math.abs(targetTime - timer);

      let points = 0;
      let resultMessage = '';

      if (difference <= difficultySettings[difficulty].margin) {
        points = Math.round(
          (1 - difference / difficultySettings[difficulty].margin) *
            difficultySettings[difficulty].points
        );
        setStreak((prev) => prev + 1);
        resultMessage = `¡Perfecto! Diferencia: ${(difference / 1000).toFixed(2)}s`;
        playSound('success');
        
        if (difference <= 50 && !achievements.perfectTiming) {
          setAchievements(prev => ({...prev, perfectTiming: true}));
          resultMessage = '¡LOGRO DESBLOQUEADO: Timing Perfecto!';
        }
      } else {
        setStreak(0);
        resultMessage = `No está mal. Diferencia: ${(difference / 1000).toFixed(2)}s`;
        playSound('failure');
      }

      setGameMessage(resultMessage);
      setScore((prev) => prev + points);

      setHistory((prev) =>
        [
          {
            target: targetTime,
            actual: timer,
            difference,
            points,
            difficulty
          },
          ...prev,
        ].slice(0, 5)
      );

      setTimeout(() => {
        setGameState('ready');
        setTargetTime(generateTargetTime());
        setGameMessage('¡Prepárate para el siguiente intento!');
      }, 1500);
    }
  };

  const resetGame = () => {
    setScore(0);
    setStreak(0);
    setHistory([]);
    setGameState('ready');
    setTimer(0);
    setTargetTime(generateTargetTime());
    setGameMessage('¡Prepárate para jugar!');
    setLevel(1);
  };

  const handleTouch = (e) => {
    e.preventDefault();
    if (e.type === 'touchstart') handleStart();
    if (e.type === 'touchend') handleStop();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">El Pulsador</h1>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>

        <div className="bg-blue-900 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-200">Nivel {level}</span>
            <div className="flex gap-2">
              {Object.entries(achievements).map(([key, achieved]) => (
                achieved && <Award key={key} className="w-6 h-6 text-yellow-500" />
              ))}
            </div>
          </div>
          <h2 className={`text-xl font-bold text-blue-200 ${gameState === 'ready' ? 'animate-pulse' : ''}`}>
            Objetivo: {(targetTime / 1000).toFixed(2)} segundos
          </h2>
          <p className="text-blue-300 mt-2">{gameMessage}</p>
        </div>

        <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-xl font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-red-500" />
            <span className="text-xl font-bold">x{streak}</span>
          </div>
          <select
            className="bg-gray-700 rounded px-2 py-1"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={gameState === 'playing' || score < difficultySettings[e.target.value].unlockScore}
          >
            <option value="easy">Fácil</option>
            <option value="medium">Medio ({difficultySettings.medium.unlockScore}+ puntos)</option>
            <option value="hard">Difícil ({difficultySettings.hard.unlockScore}+ puntos)</option>
          </select>
          <button
            onClick={resetGame}
            className="p-2 hover:bg-gray-700 rounded-full"
            disabled={gameState === 'playing'}
          >
            <RotateCcw className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <button
          onMouseDown={handleStart}
          onMouseUp={handleStop}
          onTouchStart={handleTouch}
          onTouchEnd={handleTouch}
          onMouseLeave={(e) => isPressed && handleStop(e)}
          disabled={gameState === 'playing' && !isPressed}
          className={`
            w-full py-8 rounded-xl font-bold text-xl select-none
            transition-all duration-150
            ${isPressed ? 'bg-red-600 scale-95' : 'bg-blue-600 hover:bg-blue-700'}
            ${gameState === 'finished' ? 'opacity-50' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {gameState === 'ready' ? 'Presiona y Mantén' : 
           gameState === 'playing' ? '¡Suelta!' : 
           'Preparando siguiente ronda...'}
        </button>

        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-100 ${
              gameState === 'finished' ? 
                (Math.abs(targetTime - timer) <= difficultySettings[difficulty].margin ? 
                  'bg-green-500' : 'bg-red-500') : 
                'bg-blue-600'
            }`}
            style={{ width: isPressed ? '100%' : '0%' }}
          />
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-bold mb-3">Últimos Intentos</h2>
          <div className="space-y-2">
            {history.map((entry, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-800 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded">
                    {entry.difficulty}
                  </span>
                  <span>Objetivo: {(entry.target / 1000).toFixed(2)}s</span>
                </div>
                <span>Tiempo: {(entry.actual / 1000).toFixed(2)}s</span>
                <span className={entry.points > 0 ? 'text-green-500' : 'text-red-500'}>
                  {entry.points > 0 ? `+${entry.points}` : 'Fallado'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
