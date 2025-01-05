import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Timer, Target, RotateCcw, Medal, Users, Gift } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const JuegoPulsador = () => {
  const [timer, setTimer] = useState(0);
  const [targetTime, setTargetTime] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [gameState, setGameState] = useState('ready'); // ready, playing, finished
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showTutorial, setShowTutorial] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showObjective, setShowObjective] = useState(true);

  // Configuración de dificultad
  const difficultySettings = {
    easy: { margin: 500, points: 100, minTime: 3000, maxTime: 8000 },
    medium: { margin: 300, points: 200, minTime: 2000, maxTime: 6000 },
    hard: { margin: 150, points: 300, minTime: 1000, maxTime: 4000 }
  };

  const generateTargetTime = useCallback(() => {
    const { minTime, maxTime } = difficultySettings[difficulty];
    return Math.floor(Math.random() * (maxTime - minTime) + minTime);
  }, [difficulty]);

  // Iniciar juego
  useEffect(() => {
    setTargetTime(generateTargetTime());
  }, [generateTargetTime]);

  // Temporizador
  useEffect(() => {
    let interval;
    if (isPressed) {
      interval = setInterval(() => {
        setTimer(prev => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isPressed]);

  // Sistema de logros
  const checkAchievements = (currentScore, currentStreak) => {
    const newAchievements = [];
    if (currentScore >= 1000 && !achievements.includes('scorer')) {
      newAchievements.push({ id: 'scorer', title: '¡1000 puntos!', icon: '🏆' });
    }
    if (currentStreak >= 5 && !achievements.includes('streaker')) {
      newAchievements.push({ id: 'streaker', title: '¡Racha de 5!', icon: '🔥' });
    }
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  };

  const handleStart = () => {
    if (gameState === 'ready') {
      setIsPressed(true);
      setGameState('playing');
      setTimer(0);
      setShowObjective(false);
    }
  };

  const handleStop = () => {
    if (gameState === 'playing') {
      setIsPressed(false);
      setGameState('finished');
      const difference = Math.abs(targetTime - timer);
      const margin = difficultySettings[difficulty].margin;
      
      // Calcula puntuación basada en precisión
      let points = 0;
      if (difference <= margin) {
        const accuracy = 1 - (difference / margin);
        points = Math.round(difficultySettings[difficulty].points * accuracy);
        setStreak(prev => {
          const newStreak = prev + 1;
          setBestStreak(current => Math.max(current, newStreak));
          return newStreak;
        });
        setFeedback(`¡Perfecto! Diferencia: ${(difference/1000).toFixed(2)}s 🎯`);
      } else {
        setStreak(0);
        setFeedback(`¡Inténtalo de nuevo! Te pasaste por ${(difference/1000).toFixed(2)}s 🎮`);
      }

      // Actualizar puntuación y récord
      setScore(prev => {
        const newScore = prev + points;
        setHighScore(current => Math.max(current, newScore));
        return newScore;
      });

      // Verificar logros
      checkAchievements(score + points, streak + (points > 0 ? 1 : 0));

      // Actualizar historial
      setHistory(prev => [{
        target: targetTime,
        actual: timer,
        difference,
        points,
        difficulty
      }, ...prev].slice(0, 5));

      // Preparar siguiente ronda
      setTimeout(() => {
        setGameState('ready');
        setTargetTime(generateTargetTime());
        setShowObjective(true);
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
    setFeedback('');
    setShowObjective(true);
  };

  return (
    <div className={`w-full min-h-screen max-w-2xl mx-auto p-4 space-y-6 ${isDarkMode ? 'dark bg-gray-900 text-white' : ''}`}>
      {/* Tutorial */}
      {showTutorial && (
        <Alert className="mb-4">
          <AlertTitle>¡Bienvenido al Pulsador Misterioso!</AlertTitle>
          <AlertDescription>
            Mantén presionado el botón durante el tiempo objetivo indicado.
            ¡Cuanto más preciso seas, más puntos ganarás!
            <button 
              onClick={() => setShowTutorial(false)}
              className="mt-2 text-sm text-blue-500 hover:text-blue-700"
            >
              Entendido
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Cabecera */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">El Pulsador Misterioso</h1>
        
        {/* Objetivo siempre visible antes de empezar */}
        {showObjective && (
          <div className="bg-blue-900 p-4 rounded-lg shadow-md animate-pulse">
            <h2 className="text-xl font-bold text-blue-200">
              Objetivo: {(targetTime/1000).toFixed(2)} segundos
            </h2>
            <p className="text-blue-300 mt-2">
              Pulsa y mantén el botón exactamente durante este tiempo
            </p>
          </div>
        )}
        
        {/* Feedback durante y después del juego */}
        {!showObjective && (
          <p className="text-lg text-gray-600">
            {gameState === 'playing' ? 
              'Mantén... ¡Confía en tu instinto!' : 
              feedback
            }
          </p>
        )}
      </div>

      {/* Panel de Control */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          <span className="font-bold">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="text-red-500" />
          <span className="font-bold">x{streak}</span>
        </div>
        <select 
          className="px-3 py-1 rounded border"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          disabled={gameState === 'playing'}
        >
          <option value="easy">Fácil</option>
          <option value="medium">Medio</option>
          <option value="hard">Difícil</option>
        </select>
        <button 
          onClick={resetGame}
          className="p-2 rounded-full hover:bg-gray-200"
          disabled={gameState === 'playing'}
        >
          <RotateCcw className="text-gray-600" />
        </button>
      </div>

      {/* Botón Principal */}
      <button
        onMouseDown={handleStart}
        onMouseUp={handleStop}
        onMouseLeave={() => isPressed && handleStop()}
        disabled={gameState === 'playing' && !isPressed}
        className={`w-full py-8 rounded-xl text-white font-bold text-xl transition-all ${
          isPressed ? 
          'bg-red-600 scale-95' : 
          'bg-blue-600 hover:bg-blue-700'
        } ${gameState === 'finished' ? 'opacity-50' : ''}`}
      >
        {gameState === 'ready' ? 'Presiona y Mantén' : 
         gameState === 'playing' ? 'Suelta!' : 
         'Preparando siguiente ronda...'}
      </button>

      {/* Temporizador Visual */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-100"
          style={{ 
            width: `${isPressed ? (timer / targetTime) * 100 : 0}%`,
            backgroundColor: gameState === 'finished' ? 
              (Math.abs(targetTime - timer) <= difficultySettings[difficulty].margin ? 
                '#10B981' : '#EF4444') : '#2563EB'
          }}
        />
      </div>

      {/* Logros */}
      {achievements.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-3">Logros Desbloqueados</h2>
          <div className="flex flex-wrap gap-2">
            {achievements.map(achievement => (
              <div 
                key={achievement.id}
                className="p-2 bg-yellow-100 rounded-lg flex items-center gap-2"
              >
                <span>{achievement.icon}</span>
                <span>{achievement.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-3">Últimos Intentos</h2>
        <div className="space-y-2">
          {history.map((entry, index) => (
            <div 
              key={index}
              className="p-3 bg-gray-800 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-2 text-gray-200"
            >
              <span>Objetivo: {(entry.target/1000).toFixed(2)}s</span>
              <span>Tiempo: {(entry.actual/1000).toFixed(2)}s</span>
              <span className={entry.points > 0 ? 'text-green-500' : 'text-red-500'}>
                {entry.points > 0 ? `+${entry.points}` : 'Fallado'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-800 rounded-lg text-center text-gray-200">
          <p className="text-sm text-gray-500">Mejor Racha</p>
          <p className="text-2xl font-bold">{bestStreak}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-500">Mejor Puntuación</p>
          <p className="text-2xl font-bold">{highScore}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-500">Dificultad</p>
          <p className="text-2xl font-bold capitalize">{difficulty}</p>
        </div>
      </div>
    </div>
  );
};

export default JuegoPulsador;
