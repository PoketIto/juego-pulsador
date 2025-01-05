const Game = () => {
  const [timer, setTimer] = React.useState(0);
  const [targetTime, setTargetTime] = React.useState(0);
  const [isPressed, setIsPressed] = React.useState(false);
  const [gameState, setGameState] = React.useState('ready');
  const [score, setScore] = React.useState(0);
  const [history, setHistory] = React.useState([]);
  const [difficulty, setDifficulty] = React.useState('easy');
  const [streak, setStreak] = React.useState(0);
  const [gameMessage, setGameMessage] = React.useState('¡Prepárate para jugar!');
  const [level, setLevel] = React.useState(1);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [showHistory, setShowHistory] = React.useState(false);

  const levels = {
    1: { name: "Principiante", requirement: 0, color: "bg-green-600" },
    2: { name: "Aprendiz", requirement: 1000, color: "bg-blue-600" },
    3: { name: "Experto", requirement: 2500, color: "bg-purple-600" },
    4: { name: "Maestro", requirement: 5000, color: "bg-yellow-600" },
    5: { name: "Leyenda", requirement: 10000, color: "bg-red-600" }
  };

  const difficultySettings = {
    easy: { margin: 500, points: 100, unlockScore: 0, name: "Fácil" },
    medium: { margin: 300, points: 200, unlockScore: 1000, name: "Medio" },
    hard: { margin: 150, points: 300, unlockScore: 2500, name: "Difícil" }
  };

  // Reset history on component mount
  React.useEffect(() => {
    setHistory([]);
  }, []);

  const playSound = (type) => {
    if (!soundEnabled) return;
    const sounds = {
      success: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzeR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77NdGQg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHgU5k9Xxy3orBSN1xe/dkkILFF207Ou'),
      failure: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzeR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77NdGQg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHgU5k9Xxy3orBSN1xe/dkkILFF207Ou')
    };
    sounds[type].play().catch(() => {});
  };

  const generateTargetTime = () => {
    const minTime = 2000;
    const maxTime = difficulty === 'easy' ? 8000 : difficulty === 'medium' ? 6000 : 4000;
    return Math.floor(Math.random() * (maxTime - minTime) + minTime);
  };

  React.useEffect(() => {
    setTargetTime(generateTargetTime());
  }, [difficulty]);

  React.useEffect(() => {
    let interval;
    if (isPressed) {
      interval = setInterval(() => setTimer(prev => prev + 10), 10);
    }
    return () => clearInterval(interval);
  }, [isPressed]);

  React.useEffect(() => {
    const newLevel = Object.keys(levels).reduce((acc, lvl) => 
      score >= levels[lvl].requirement ? Number(lvl) : acc, 1);
    
    if (newLevel !== level) {
      setLevel(newLevel);
      setGameMessage(`¡Nivel ${newLevel} - ${levels[newLevel].name} alcanzado!`);
      playSound('success');
    }

    // Automatically unlock new difficulties
    if (score >= difficultySettings.medium.unlockScore && difficulty === 'easy') {
      setDifficulty('medium');
      setGameMessage('¡Dificultad Media desbloqueada!');
    } else if (score >= difficultySettings.hard.unlockScore && difficulty === 'medium') {
      setDifficulty('hard');
      setGameMessage('¡Dificultad Difícil desbloqueada!');
    }
  }, [score]);

  const handleStart = () => {
    if (gameState === 'ready') {
      setIsPressed(true);
      setGameState('playing');
      setTimer(0);
      setGameMessage('¡Mantén pulsado!');
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
        setStreak(prev => prev + 1);
        resultMessage = `¡Perfecto! Diferencia: ${(difference / 1000).toFixed(2)}s`;
        playSound('success');
      } else {
        setStreak(0);
        resultMessage = `Fallaste. Diferencia: ${(difference / 1000).toFixed(2)}s`;
        playSound('failure');
      }

      setGameMessage(resultMessage);
      setScore(prev => prev + points);
      setHistory(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        target: targetTime,
        actual: timer,
        difference,
        points,
        difficulty
      }, ...prev].slice(0, 10));

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
    setGameMessage('¡Juego reiniciado!');
    setLevel(1);
    setDifficulty('easy');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">El Pulsador</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className="p-2 hover:bg-gray-700 rounded"
            >
              {soundEnabled ? '🔊' : '🔈'}
            </button>
            <button
              onClick={resetGame}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Reiniciar
            </button>
          </div>
        </div>

        <div className={`${levels[level].color} p-4 rounded-lg transition-colors duration-300`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Nivel {level}: {levels[level].name}</h2>
            <span className="text-xl">🏆 {score}</span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-sm">
              <span>Racha: {streak}</span>
              <span>Dificultad: {difficultySettings[difficulty].name}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-900 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-blue-200">{gameMessage}</h2>
          <p className="text-blue-300 mt-2">
            Objetivo: {(targetTime / 1000).toFixed(2)} segundos
          </p>
        </div>

        <button
          onMouseDown={handleStart}
          onMouseUp={handleStop}
          onTouchStart={handleStart}
          onTouchEnd={handleStop}
          className={`w-full py-8 rounded-xl font-bold text-xl transition-all duration-150 ${
            isPressed ? 'bg-red-600 scale-95' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {gameState === 'ready' ? 'Presiona y Mantén' : '¡Suelta!'}
        </button>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Historial</h2>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="text-blue-400 hover:text-blue-300"
            >
              {showHistory ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          
          {showHistory && history.length > 0 ? (
            <div className="space-y-2">
              {history.map((entry, index) => (
                <div key={index} className="bg-gray-700 p-2 rounded flex justify-between text-sm">
                  <div>
                    <span className="text-gray-400">{entry.timestamp}</span>
                    <span className="ml-2">{(entry.actual / 1000).toFixed(2)}s</span>
                  </div>
                  <div>
                    <span className={entry.points > 0 ? 'text-green-400' : 'text-red-400'}>
                      {entry.points > 0 ? `+${entry.points}` : 'Fallado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center">
              {history.length === 0 ? 'No hay intentos registrados' : 'Haz clic en Mostrar para ver el historial'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
