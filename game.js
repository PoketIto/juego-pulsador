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
    levelMaster: false
  });

  const difficultySettings = {
    easy: { margin: 500, points: 100, unlockScore: 0 },
    medium: { margin: 300, points: 200, unlockScore: 1000 },
    hard: { margin: 150, points: 300, unlockScore: 2500 }
  };

  const playSound = React.useCallback((type) => {
    if (!soundEnabled) return;
    
    const sounds = {
      success: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzeR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77NdGQg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHgU5k9Xxy3orBSN1xe/dkkILFF207Ou'),
      failure: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzeR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77NdGQg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHgU5k9Xxy3orBSN1xe/dkkILFF207Ou'),
      click: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzeR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77NdGQg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHgU5k9Xxy3orBSN1xe/dkkILFF207Ou')
    };
    sounds[type].play();
  }, [soundEnabled]);

  const generateTargetTime = React.useCallback(() => {
    const minTime = 2000;
    const maxTime = difficulty === 'easy' ? 8000 : 
                    difficulty === 'medium' ? 6000 : 4000;
    return Math.floor(Math.random() * (maxTime - minTime) + minTime);
  }, [difficulty]);

  React.useEffect(() => {
    setTargetTime(generateTargetTime());
  }, [difficulty, generateTargetTime]);

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
    if (e.type === 'touchstart') handleStart(e);
    if (e.type === 'touchend') handleStop(e);
  };

  // SVG Icons como componentes
  const MedalIcon = () => (
    React.createElement('svg', {
      className: 'w-6 h-6 text-yellow-500',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2'
    },
    React.createElement('circle', { cx: '12', cy: '9', r: '3' }),
    React.createElement('path', { d: 'M12 12v9M8 21h8' })
    )
  );

  const TargetIcon = () => (
    React.createElement('svg', {
      className: 'w-6 h-6 text-red-500',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2'
    },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('circle', { cx: '12', cy: '12', r: '6' }),
    React.createElement('circle', { cx: '12', cy: '12', r: '2' })
    )
  );

  const VolumeIcon = () => (
    React.createElement('svg', {
      className: 'w-6 h-6',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2'
    },
    React.createElement('polygon', { points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5' }),
    soundEnabled && React.createElement('path', { d: 'M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07' })
    )
  );

  const ResetIcon = () => (
    React.createElement('svg', {
      className: 'w-6 h-6 text-gray-400',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2'
    },
    React.createElement('path', { d: 'M3 12a9 9 0 1 1 9 9M3 12h9' })
    )
  );

  const AwardIcon = () => (
    React.createElement('svg', {
      className: 'w-6 h-6 text-yellow-500',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2'
    },
    React.createElement('circle', { cx: '12', cy: '8', r: '6' }),
    React.createElement('path', { d: 'M15.477 12.89L17 22l-5-3-5 3 1.523-9.11' })
    )
  );

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-900 text-white p-4' },
    React.createElement(
      'div',
      { className: 'max-w-md mx-auto space-y-6' },
      React.createElement(
        'div',
        { className: 'flex justify-between items-center' },
        React.createElement('h1', { className: 'text-3xl font-bold' }, 'El Pulsador'),
        React.createElement(
          'button',
          {
            onClick: () => setSoundEnabled(!soundEnabled),
            className: 'p-2 hover:bg-gray-800 rounded-full'
          },
          React.createElement(VolumeIcon)
        )
      ),
      React.createElement(
        'div',
        { className: 'bg-blue-900 p-4 rounded-lg' },
        React.createElement(
          'div',
          { className: 'flex justify-between items-center mb-2' },
          React.createElement('span', { className: 'text-blue-200' }, `Nivel ${level}`),
          React.createElement(
            'div',
            { className: 'flex gap-2' },
            Object.entries(achievements).map(([key, achieved]) =>
              achieved && React.createElement(AwardIcon, { key })
            )
          )
        ),
        React.createElement(
          'h2',
          {
            className: `text-xl font-bold text-blue-200 ${
              gameState === 'ready' ? 'animate-pulse' : ''
            }`
          },
          `Objetivo: ${(targetTime / 1000).toFixed(2)} segundos`
        ),
        React.createElement('p', { className: 'text-blue-300 mt-2' }, gameMessage)
      ),
      React.createElement(
        'div',
        { className: 'flex justify-between items-center bg-gray-800 p-4 rounded-lg' },
        React.createElement(
          'div',
          { className: 'flex items-center gap-2' },
          React.createElement(MedalIcon),
          React.createElement('span', { className: 'text-xl font-bold' }, score)
        ),
        React.createElement(
          'div',
          { className: 'flex items-center gap-2' },
          React.createElement(TargetIcon),
          React.createElement('span', { className: 'text-xl font-bold' }, `x${streak}`)
        ),
        React.createElement(
          'select',
          {
            className: 'bg-gray-700 rounded px-2 py-1',
            value: difficulty,
            onChange: (e) => setDifficulty(e.target.value),
            disabled: gameState === 'playing' || score < difficultySettings[e.target.value].unlockScore
          },
          React.createElement('option', { value: 'easy' }, 'Fácil'),
          React.createElement(
            'option',
            { value: 'medium' },
            `Medio (${difficultySettings.medium.unlockScore}+ puntos)`
          ),
          React.createElement(
            'option',
            { value: 'hard' },
            `Difícil (${difficultySettings.hard.unlockScore}+ puntos)`
          )
        ),
        React.createElement(
          'button',
          {
            onClick: resetGame,
            onClick: resetGame,
            className: 'p-2 hover:bg-gray-700 rounded-full',
            disabled: gameState === 'playing'
          },
          React.createElement(ResetIcon)
        )
      ),
      React.createElement(
        'button',
        {
          onMouseDown: (e) => handleStart(e),
          onMouseUp: (e) => handleStop(e),
          onTouchStart: handleTouch,
          onTouchEnd: handleTouch,
          onMouseLeave: (e) => isPressed && handleStop(e),
          disabled: gameState === 'playing' && !isPressed,
          className: `
            w-full py-8 rounded-xl font-bold text-xl select-none
            transition-all duration-150
            ${isPressed ? 'bg-red-600 scale-95' : 'bg-blue-600 hover:bg-blue-700'}
            ${gameState === 'finished' ? 'opacity-50' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
          `
        },
        gameState === 'ready' ? 'Presiona y Mantén' : 
        gameState === 'playing' ? '¡Suelta!' : 
        'Preparando siguiente ronda...'
      ),
      React.createElement(
        'div',
        { className: 'h-2 bg-gray-800 rounded-full overflow-hidden' },
        React.createElement('div', {
          className: `h-full transition-all duration-100 ${
            gameState === 'finished' 
              ? (Math.abs(targetTime - timer) <= difficultySettings[difficulty].margin 
                ? 'bg-green-500' 
                : 'bg-red-500') 
              : 'bg-blue-600'
          }`,
          style: { width: isPressed ? '100%' : '0%' }
        })
      ),
      React.createElement(
        'div',
        { className: 'mt-6' },
        React.createElement('h2', { className: 'text-xl font-bold mb-3' }, 'Últimos Intentos'),
        React.createElement(
          'div',
          { className: 'space-y-2' },
          history.map((entry, index) =>
            React.createElement(
              'div',
              {
                key: index,
                className: 'p-3 bg-gray-800 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-2'
              },
              React.createElement(
                'div',
                { className: 'flex items-center gap-2' },
                React.createElement(
                  'span',
                  { className: 'text-xs px-2 py-1 bg-gray-700 rounded' },
                  entry.difficulty
                ),
                React.createElement('span', null, `Objetivo: ${(entry.target / 1000).toFixed(2)}s`)
              ),
              React.createElement('span', null, `Tiempo: ${(entry.actual / 1000).toFixed(2)}s`),
              React.createElement(
                'span',
                { className: entry.points > 0 ? 'text-green-500' : 'text-red-500' },
                entry.points > 0 ? `+${entry.points}` : 'Fallado'
              )
            )
          )
        )
      )
    )
  );
};

const rootNode = document.getElementById('root');
const root = ReactDOM.createRoot(rootNode);
root.render(React.createElement(Game));
