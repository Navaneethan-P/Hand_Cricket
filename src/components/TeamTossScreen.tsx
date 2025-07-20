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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-100 flex items-center justify-center p-4 animate-gradient-x">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md text-center transform hover:scale-[1.02] transition-all duration-300">
        {showCoin ? (
          <div className="mb-8">
            <div className={`w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl ${coinFlipping ? 'animate-spin' : 'animate-float'}`}>
              <Coins className="w-12 h-12 text-yellow-700" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
              🪙 Toss Time!
            </h2>
            <p className="text-gray-600">Flipping the coin...</p>
          </div>
        ) : (
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl animate-glow">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
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
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Target className="w-5 h-5" />
              Bat First
            </button>
            <button
              onClick={() => onChooseRole('bowl')}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Bowl First
            </button>
          </div>
        )}

        {!showCoin && room.game_state === 'chooseRole' && (!isTossWinner || !isCaptain) && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-to-r from-orange-500 to-red-500"></div>
          </div>
        )}

        {/* Team info */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div className={`p-4 rounded-xl transition-all duration-300 ${playerTeam === 'teamA' ? 'bg-gradient-to-r from-blue-100 to-blue-200 border-2 border-blue-500 transform scale-105' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <div className="font-bold text-blue-600">{room.teamA?.name}</div>
            <div className="text-gray-600">{room.teamA?.players.length} players</div>
          </div>
          <div className={`p-4 rounded-xl transition-all duration-300 ${playerTeam === 'teamB' ? 'bg-gradient-to-r from-red-100 to-red-200 border-2 border-red-500 transform scale-105' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <div className="font-bold text-red-600">{room.teamB?.name}</div>
            <div className="text-gray-600">{room.teamB?.players.length} players</div>
          </div>
        </div>
      </div>
    </div>
  );
};