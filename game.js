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
  const [level, setLevel] = React.useState(1);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [achievements, setAchievements] = React.useState({
    perfectTiming: false,
    streakMaster: false,
    levelMaster: false,
  });

  const difficultySettings = {
    easy: { margin: 500, points: 100, unlockScore: 0 },
    medium: { margin: 300, points: 200, unlockScore: 1000 },
    hard: { margin: 150, points: 300, unlockScore: 2500 },
  };

  const playSound = (type) => {
    if (!soundEnabled) return;

    const sounds = {
      success: new Audio(
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzeR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77NdGQg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHgU5k9Xxy3orBSN1xe/dkkILFF207Ou'
      ),
      failure: new Audio(
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzeR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77NdGQg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHgU5k9Xxy3orBSN1xe/dkkILFF207Ou'
      ),
      click: new Audio(
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzeR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77NdGQg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHgU5k9Xxy3orBSN1xe/dkkILFF207Ou'
      ),
    };
    sounds[type].play();
  };


  const generateTargetTime = () => {
    const minTime = 2000;
    const maxTime =
      difficulty === 'easy'
        ? 8000
        : difficulty === 'medium'
        ? 6000
        : 4000;
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

  React.useEffect(() => {
    const newLevel = Math.floor(score / 1000) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      setGameMessage(`¡Nivel ${newLevel} alcanzado!`);
      playSound('success');
    }
    if (streak >= 5 && !achievements.streakMaster) {
      setAchievements((prev) => ({ ...prev, streakMaster: true }));
      setGameMessage('¡Logro desbloqueado: Maestro de rachas!');
    }
    if (level >= 5 && !achievements.levelMaster) {
      setAchievements((prev) => ({ ...prev, levelMaster: true }));
      setGameMessage('¡Logro desbloqueado: Maestro de niveles!');
    }
  }, [score, streak, level, achievements]);

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
          setAchievements((prev) => ({ ...prev, perfectTiming: true }));
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
          { target: targetTime, actual: timer, difference, points, difficulty },
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

  // SVG Icon Components
  const VolumeIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {soundEnabled && <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />}
    </svg>
  );

  const AwardIcon = () => (
    <svg className="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold">El Pulsador</h1>
        <div className="bg-blue-900 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-blue-200">{gameMessage}</h2>
          <p className="text-blue-300 mt-2">Objetivo: {(targetTime / 1000).toFixed(2)} segundos</p>
        </div>
        <button
          onMouseDown={handleStart}
          onMouseUp={handleStop}
          onTouchStart={handleStart}
          onTouchEnd={handleStop}
          className={`w-full py-8 rounded-xl font-bold text-xl ${
            isPressed ? 'bg-red-600 scale-95' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {gameState === 'ready' ? 'Presiona y Mantén' : '¡Suelta!'}
        </button>
        <div className="flex justify-between items-center">
          <span>Nivel: {level}</span>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2">
            <VolumeIcon />
          </button>
        </div>
        <button onClick={resetGame} className="bg-gray-700 px-4 py-2 rounded">
          Reiniciar
        </button>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg">Historial</h2>
          {history.map((entry, index) => (
            <div key={index} className="flex justify-between">
              <span>Tiempo: {(entry.actual / 1000).toFixed(2)}s</span>
              <span>Puntos: {entry.points > 0 ? `+${entry.points}` : 'Fallado'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const rootNode = document.getElementById('root');
const root = ReactDOM.createRoot(rootNode);
root.render(<Game />);
