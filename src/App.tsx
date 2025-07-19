import React from 'react';
import { Toaster } from 'react-hot-toast';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TossScreen } from './components/TossScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { useGameState } from './hooks/useGameState';

function App() {
  const {
    gameState,
    timeLeft,
    timerActive,
    selectedMove,
    moveSubmitted,
    createRoom,
    joinRoom,
    chooseRole,
    selectMove,
    submitMove,
    resetGame
  } = useGameState();

  const renderCurrentScreen = () => {
    switch (gameState.currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
          />
        );
      case 'toss':
        return gameState.room ? (
          <TossScreen
            room={gameState.room}
            playerId={gameState.playerId}
            onChooseRole={chooseRole}
          />
        ) : null;
      case 'game':
        return gameState.room ? (
          <GameScreen
            room={gameState.room}
            playerId={gameState.playerId}
            timeLeft={timeLeft}
            timerActive={timerActive}
            selectedMove={selectedMove}
            moveSubmitted={moveSubmitted}
            onSelectMove={selectMove}
            onSubmitMove={submitMove}
          />
        ) : null;
      case 'result':
        return gameState.room ? (
          <ResultScreen
            room={gameState.room}
            playerId={gameState.playerId}
            onPlayAgain={resetGame}
            onExit={resetGame}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      {renderCurrentScreen()}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '500'
          }
        }}
      />
    </>
  );
}

export default App;