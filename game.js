const Game = () => {
  const [timer, setTimer] = React.useState(0);
  const [targetTime, setTargetTime] = React.useState(0);
  const [isPressed, setIsPressed] = React.useState(false);
  const [gameState, setGameState] = React.useState('ready');
  const [score, setScore] = React.useState(0);
  const [history, setHistory] = React.useState([]);
  const [difficulty, setDifficulty] = React.useState('medium');
  const [streak, setStreak] = React.useState(0);
  const [gameMessage, setGameMessage] = React.useState('¡Prepárate para jugar!');

  const difficultySettings = {
    easy: { margin: 500, points: 100 },
    medium: { margin: 300, points: 200 },
    hard: { margin: 150, points: 300 },
  };

  const generateTargetTime = () => {
    const minTime = 2000;
    const maxTime = difficulty === 'easy' ? 8000 : 
                    difficulty === 'medium' ? 6000 : 4000;
    return Math.floor(Math.random() * (maxTime - minTime) + minTime);
  };

  React.useEffect(() => {
    setTargetTime(generateTargetTime());
  }, [difficulty]);

  React.useEffect(() => {
    let interval;
    if (isPressed) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isPressed]);

  const handleStart = () => {
    if (gameState === 'ready') {
      setIsPressed(true);
      setGameState('playing');
      setTimer(0);
      setGameMessage('¡Mantén pulsado el botón!');
    }
  };

  const handleStop = () => {
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
        resultMessage = `¡Perfecto! Diferencia: ${(difference / 1000).toFixed(
          2
        )}s`;
      } else {
        setStreak(0);
        resultMessage = `No está mal. Diferencia: ${(difference / 1000).toFixed(
          2
        )}s`;
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
  };

  const MedalIcon = () => (
    <svg className="icon text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="9" r="3" />
      <path d="M12 12v9M8 21h8" />
    </svg>
  );

  const TargetIcon = () => (
    <svg className="icon text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );

  const ResetIcon = () => (
    <svg className="icon text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 1 9 9M3 12h9" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">El Pulsador</h1>
          <div className="bg-blue-900 p-4 rounded-lg min-h-[100px] flex flex-col justify-center">
            <h2 className={`text-xl font-bold text-blue-200 ${gameState === 'ready' ? 'animate-pulse' : ''}`}>
              Objetivo: {(targetTime / 1000).toFixed(2)} segundos
            </h2>
            <p className="text-blue-300 mt-2">{gameMessage}</p>
          </div>
        </div>
        <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <MedalIcon />
            <span className="text-xl font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <TargetIcon />
            <span className="text-xl font-bold">x{streak}</span>
          </div>
          <select
            className="bg-gray-700 rounded px-2 py-1"
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
            className="p-2 hover:bg-gray-700 rounded-full"
            disabled={gameState === 'playing'}
          >
            <ResetIcon />
          </button>
        </div>
        <button
          onMouseDown={handleStart}
          onMouseUp={handleStop}
          onMouseLeave={() => isPressed && handleStop()}
          disabled={gameState === 'playing' && !isPressed}
          className={`
            w-full py-8 rounded-xl font-bold text-xl
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
                <span>Objetivo: {(entry.target / 1000).toFixed(2)}s</span>
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
