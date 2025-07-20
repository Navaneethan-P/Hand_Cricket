import React from 'react';
import { Toaster } from 'react-hot-toast';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { TeamTossScreen } from './components/TeamTossScreen';
import { TeamGameScreen } from './components/TeamGameScreen';
import { TeamResultScreen } from './components/TeamResultScreen';
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
    shufflePlayers,
    movePlayer,
    startMatch,
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
      case 'lobby':
        return gameState.room ? (
          <LobbyScreen
            room={gameState.room}
            playerId={gameState.playerId}
            isHost={gameState.isHost}
            onShufflePlayers={shufflePlayers}
            onMovePlayer={movePlayer}
            onStartMatch={startMatch}
          />
        ) : null;
      case 'toss':
        return gameState.room ? (
          <TeamTossScreen
            room={gameState.room}
            playerId={gameState.playerId}
            onChooseRole={chooseRole}
          />
        ) : null;
      case 'game':
        return gameState.room ? (
          <TeamGameScreen
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
          <TeamResultScreen
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