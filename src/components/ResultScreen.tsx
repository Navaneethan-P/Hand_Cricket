import React from 'react';
import { Trophy, Target, RotateCcw, LogOut } from 'lucide-react';
import { Room } from '../types/game';
import Confetti from 'react-confetti';

interface ResultScreenProps {
  room: Room;
  playerId: string;
  onPlayAgain: () => void;
  onExit: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  room,
  playerId,
  onPlayAgain,
  onExit
}) => {
  const isPlayer1 = room.player1?.id === playerId;
  const currentPlayer = isPlayer1 ? room.player1! : room.player2!;
  const opponent = isPlayer1 ? room.player2! : room.player1!;

  const isWinner = currentPlayer.score > opponent.score;
  const isDraw = currentPlayer.score === opponent.score;

  const getResultMessage = () => {
    if (isDraw) return "It's a Draw!";
    return isWinner ? "You Win!" : "You Lose!";
  };

  const getResultColor = () => {
    if (isDraw) return "text-orange-500";
    return isWinner ? "text-green-500" : "text-red-500";
  };

  const getResultBg = () => {
    if (isDraw) return "from-orange-50 to-yellow-100";
    return isWinner ? "from-green-50 to-blue-100" : "from-red-50 to-pink-100";
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getResultBg()} p-4 relative`}>
      {isWinner && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Result Header */}
          <div className="mb-8">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
              isDraw ? 'bg-orange-500' : isWinner ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${getResultColor()}`}>
              {getResultMessage()}
            </h1>
            <p className="text-gray-600">
              {isDraw ? "Both players scored equally!" : isWinner ? "Congratulations!" : "Better luck next time!"}
            </p>
          </div>

          {/* Final Scores */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Final Scores</h3>
            <div className="space-y-4">
              <div className={`flex justify-between items-center p-4 rounded-xl ${
                isWinner ? 'bg-green-100 border-2 border-green-500' : 'bg-white'
              }`}>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{currentPlayer.name}</span>
                  {isWinner && <Trophy className="w-4 h-4 text-green-500" />}
                </div>
                <span className="text-2xl font-bold text-gray-800">{currentPlayer.score}</span>
              </div>
              <div className={`flex justify-between items-center p-4 rounded-xl ${
                !isWinner && !isDraw ? 'bg-green-100 border-2 border-green-500' : 'bg-white'
              }`}>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-500" />
                  <span className="font-medium">{opponent.name}</span>
                  {!isWinner && !isDraw && <Trophy className="w-4 h-4 text-green-500" />}
                </div>
                <span className="text-2xl font-bold text-gray-800">{opponent.score}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={onPlayAgain}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
            <button
              onClick={onExit}
              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Exit Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};