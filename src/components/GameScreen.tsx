import React from 'react';
import { Target, Shield, Clock, Trophy } from 'lucide-react';
import { Room } from '../types/game';

interface GameScreenProps {
  room: Room;
  playerId: string;
  timeLeft: number;
  timerActive: boolean;
  selectedMove: number | null;
  moveSubmitted: boolean;
  onSelectMove: (move: number) => void;
  onSubmitMove: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  room,
  playerId,
  timeLeft,
  timerActive,
  selectedMove,
  moveSubmitted,
  onSelectMove,
  onSubmitMove
}) => {
  const isPlayer1 = room.player1?.id === playerId;
  const currentPlayer = isPlayer1 ? room.player1! : room.player2!;
  const opponent = isPlayer1 ? room.player2! : room.player1!;
  const isBatting = room.currentBatting === (isPlayer1 ? 'player1' : 'player2');

  const numbers = [1, 2, 3, 4, 5, 6, 0];

  const getTimerColor = () => {
    if (timeLeft <= 1) return 'text-red-500 bg-red-100';
    if (timeLeft <= 2) return 'text-orange-500 bg-orange-100';
    return 'text-green-500 bg-green-100';
  };

  const bothMovesSubmitted = room.movesSubmitted === 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Score Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className={`flex items-center gap-2 mb-2 ${isBatting ? 'text-blue-500' : 'text-gray-500'}`}>
                <Target className="w-4 h-4" />
                <span className="font-medium">{currentPlayer.name}</span>
                {isBatting && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">BAT</span>}
              </div>
              <div className="text-2xl font-bold text-gray-800">{currentPlayer.score}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">Round</div>
              <div className="text-xl font-bold text-gray-800">{room.currentRound}</div>
            </div>
            <div className="text-center">
              <div className={`flex items-center gap-2 mb-2 ${!isBatting ? 'text-red-500' : 'text-gray-500'}`}>
                <Shield className="w-4 h-4" />
                <span className="font-medium">{opponent.name}</span>
                {!isBatting && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">BOWL</span>}
              </div>
              <div className="text-2xl font-bold text-gray-800">{opponent.score}</div>
            </div>
          </div>
        </div>

        {/* Timer */}
        {timerActive && !moveSubmitted && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold ${getTimerColor()}`}>
              {timeLeft}
            </div>
            <p className="text-gray-600 mt-2">Choose your number!</p>
          </div>
        )}

        {/* Move Display */}
        {bothMovesSubmitted && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">{currentPlayer.name}</div>
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {currentPlayer.move}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg">VS</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">{opponent.name}</div>
                <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {opponent.move}
                </div>
              </div>
            </div>
            {currentPlayer.move === opponent.move && (
              <div className="text-center mt-4 text-red-500 font-bold">OUT!</div>
            )}
          </div>
        )}

        {/* Move Submitted State */}
        {moveSubmitted && !bothMovesSubmitted && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Move Submitted!</h3>
            <p className="text-gray-600">Waiting for opponent...</p>
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            </div>
          </div>
        )}

        {/* Number Selection */}
        {timerActive && !moveSubmitted && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              {isBatting ? 'Choose your batting number' : 'Choose your bowling number'}
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {numbers.slice(0, 6).map((num) => (
                <button
                  key={num}
                  onClick={() => onSelectMove(num)}
                  className={`h-16 rounded-xl font-bold text-xl transition-all ${
                    selectedMove === num
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={() => onSelectMove(0)}
              className={`w-full h-16 rounded-xl font-bold text-xl transition-all ${
                selectedMove === 0
                  ? 'bg-red-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              0
            </button>
            
            {selectedMove !== null && (
              <button
                onClick={onSubmitMove}
                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl transition-colors"
              >
                Submit Move: {selectedMove}
              </button>
            )}
          </div>
        )}

        {/* Role Switch Message */}
        {room.gameState === 'switch' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Switching Roles!</h3>
            <p className="text-gray-600">Get ready for the next innings...</p>
          </div>
        )}
      </div>
    </div>
  );
};