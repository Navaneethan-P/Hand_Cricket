import React, { useState, useEffect } from 'react';
import { Coins, Target, Shield, Users, Trophy } from 'lucide-react';
import { Room } from '../types/game';

interface TeamTossScreenProps {
  room: Room;
  playerId: string;
  onChooseRole: (role: 'bat' | 'bowl') => void;
}

export const TeamTossScreen: React.FC<TeamTossScreenProps> = ({
  room,
  playerId,
  onChooseRole
}) => {
  const [showCoin, setShowCoin] = useState(true);
  const [coinFlipping, setCoinFlipping] = useState(false);

  const playerTeam = room.teamA?.players.find(p => p.id === playerId) ? 'teamA' : 'teamB';
  const isTossWinner = room.toss_winner === playerTeam;
  const tossWinnerTeam = room.toss_winner === 'teamA' ? room.teamA : room.teamB;
  const isCaptain = (playerTeam === 'teamA' ? room.teamA?.captain : room.teamB?.captain) === playerId;

  useEffect(() => {
    if (room.game_state === 'toss' && room.teamA && room.teamB) {
      setCoinFlipping(true);
      setTimeout(() => {
        setCoinFlipping(false);
        setShowCoin(false);
      }, 2000);
    }
  }, [room.game_state, room.teamA, room.teamB]);

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
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {tossWinnerTeam?.name} won the toss!
            </h2>
            {isTossWinner && isCaptain ? (
              <p className="text-gray-600 mb-6">As captain, choose your team's role:</p>
            ) : isTossWinner ? (
              <p className="text-gray-600 mb-6">Waiting for your captain to decide...</p>
            ) : (
              <p className="text-gray-600 mb-6">Waiting for {tossWinnerTeam?.name} captain's decision...</p>
            )}
          </div>
        )}

        {!showCoin && room.game_state === 'chooseRole' && isTossWinner && isCaptain && (
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

        {!showCoin && room.game_state === 'chooseRole' && (!isTossWinner || !isCaptain) && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Team info */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div className={`p-3 rounded-lg ${playerTeam === 'teamA' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}>
            <div className="font-semibold text-blue-600">{room.teamA?.name}</div>
            <div className="text-gray-600">{room.teamA?.players.length} players</div>
          </div>
          <div className={`p-3 rounded-lg ${playerTeam === 'teamB' ? 'bg-red-100 border-2 border-red-500' : 'bg-gray-100'}`}>
            <div className="font-semibold text-red-600">{room.teamB?.name}</div>
            <div className="text-gray-600">{room.teamB?.players.length} players</div>
          </div>
        </div>
      </div>
    </div>
  );
};