import React, { useState, useEffect } from 'react';
import { Coins, Target, Shield, Users } from 'lucide-react';
import { Room } from '../types/game';

interface TossScreenProps {
  room: Room;
  playerId: string;
  onChooseRole: (role: 'bat' | 'bowl') => void;
}

export const TossScreen: React.FC<TossScreenProps> = ({
  room,
  playerId,
  onChooseRole
}) => {
  const [showCoin, setShowCoin] = useState(true);
  const [coinFlipping, setCoinFlipping] = useState(false);

  const isPlayer1 = room.player1?.id === playerId;
  const isTossWinner = (isPlayer1 && room.toss_winner === 'player1') || 
                      (!isPlayer1 && room.toss_winner === 'player2');
  const tossWinnerName = room.toss_winner === 'player1' ? room.player1?.name : room.player2?.name;

  useEffect(() => {
    if (room.game_state === 'toss' && room.player1 && room.player2) {
      setCoinFlipping(true);
      setTimeout(() => {
        setCoinFlipping(false);
        setShowCoin(false);
      }, 2000);
    }
  }, [room.game_state, room.player1, room.player2]);

  if (!room.player2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Waiting for Player 2</h2>
          <p className="text-gray-600 mb-6">Share room code: <span className="font-mono text-lg font-bold text-purple-600">{room.id}</span></p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
        {showCoin ? (
          <div className="mb-8">
            <div className={`w-24 h-24 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg ${coinFlipping ? 'animate-spin' : ''}`}>
              <Coins className="w-12 h-12 text-yellow-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Toss Time!</h2>
            <p className="text-gray-600">Flipping the coin...</p>
          </div>
        ) : (
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Target className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {tossWinnerName} won the toss!
            </h2>
            {isTossWinner ? (
              <p className="text-gray-600 mb-6">Choose your role:</p>
            ) : (
              <p className="text-gray-600 mb-6">Waiting for role selection...</p>
            )}
          </div>
        )}

        {!showCoin && room.game_state === 'chooseRole' && isTossWinner && (
          <div className="space-y-4">
            <button
              onClick={() => onChooseRole('bat')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <Target className="w-5 h-5" />
              Bat First
            </button>
            <button
              onClick={() => onChooseRole('bowl')}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Bowl First
            </button>
          </div>
        )}

        {!showCoin && room.game_state === 'chooseRole' && !isTossWinner && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};