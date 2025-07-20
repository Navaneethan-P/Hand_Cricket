import React from 'react';
import { Users, Crown, Shuffle, Play, Copy, UserPlus } from 'lucide-react';
import { Room } from '../types/game';
import toast from 'react-hot-toast';

interface LobbyScreenProps {
  room: Room;
  playerId: string;
  isHost: boolean;
  onShufflePlayers: () => void;
  onMovePlayer: (playerId: string, toTeam: 'teamA' | 'teamB') => void;
  onStartMatch: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  room,
  playerId,
  isHost,
  onShufflePlayers,
  onMovePlayer,
  onStartMatch
}) => {
  const allPlayers = [
    ...(room.teamA?.players || []),
    ...(room.teamB?.players || [])
  ];

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.id);
    toast.success('Room code copied!');
  };

  const canStartMatch = () => {
    const teamACount = room.teamA?.players.length || 0;
    const teamBCount = room.teamB?.players.length || 0;
    return teamACount >= 1 && teamBCount >= 1 && teamACount === teamBCount;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-100 p-4 animate-gradient-x">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6 transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🏏 Match Lobby
            </h1>
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Copy className="w-4 h-4" />
              <span className="font-mono font-bold">{room.id}</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{allPlayers.length}/{room.maxPlayers} players</span>
            </div>
            <div>
              {room.maxOvers} overs per innings
            </div>
          </div>

          {allPlayers.length < room.maxPlayers && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 animate-pulse">
              <div className="flex items-center gap-2 text-blue-700">
                <UserPlus className="w-4 h-4" />
                <span className="font-medium">Waiting for more players...</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Share the room code with your friends to join the match
              </p>
            </div>
          )}
        </div>

        {/* Teams */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Team A */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-6 transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                🔵 {room.teamA?.name || 'Team A'}
              </h2>
              <div className="text-sm text-gray-500">
                {room.teamA?.players.length || 0}/{room.maxPlayers / 2} players
              </div>
            </div>
            
            <div className="space-y-3">
              {room.teamA?.players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 transform hover:scale-[1.02] transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    {room.teamA?.captain === player.id && (
                      <Crown className="w-5 h-5 text-yellow-500 animate-bounce" />
                    )}
                    <span className="font-semibold text-gray-800">{player.name}</span>
                    {player.id === playerId && (
                      <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full font-bold animate-pulse">You</span>
                    )}
                  </div>
                  {isHost && (
                    <button
                      onClick={() => onMovePlayer(player.id, 'teamB')}
                      className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Move
                    </button>
                  )}
                </div>
              )) || (
                <div className="text-center text-gray-500 py-8 animate-pulse">
                  No players yet
                </div>
              )}
            </div>
          </div>

          {/* Team B */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 p-6 transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                🔴 {room.teamB?.name || 'Team B'}
              </h2>
              <div className="text-sm text-gray-500">
                {room.teamB?.players.length || 0}/{room.maxPlayers / 2} players
              </div>
            </div>
            
            <div className="space-y-3">
              {room.teamB?.players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 transform hover:scale-[1.02] transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    {room.teamB?.captain === player.id && (
                      <Crown className="w-5 h-5 text-yellow-500 animate-bounce" />
                    )}
                    <span className="font-semibold text-gray-800">{player.name}</span>
                    {player.id === playerId && (
                      <span className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold animate-pulse">You</span>
                    )}
                  </div>
                  {isHost && (
                    <button
                      onClick={() => onMovePlayer(player.id, 'teamA')}
                      className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Move
                    </button>
                  )}
                </div>
              )) || (
                <div className="text-center text-gray-500 py-8 animate-pulse">
                  No players yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Host Controls */}
        {isHost && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-200 p-6 transform hover:scale-[1.02] transition-all duration-300">
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              🎮 Host Controls
            </h3>
            <div className="flex gap-4">
              <button
                onClick={onShufflePlayers}
                disabled={allPlayers.length < 4}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none"
              >
                <Shuffle className="w-4 h-4" />
                Shuffle Teams
              </button>
              
              <button
                onClick={onStartMatch}
                disabled={!canStartMatch()}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none"
              >
                <Play className="w-4 h-4" />
                Start Match
              </button>
            </div>
            
            {!canStartMatch() && (
              <p className="text-sm text-gray-500 mt-2">
                Need equal teams with at least 1 player each to start
              </p>
            )}
          </div>
        )}

        {/* Non-host waiting message */}
        {!isHost && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 text-center transform hover:scale-[1.02] transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent mb-2">
              Waiting for host
            </h3>
            <p className="text-gray-600">The host will start the match when ready</p>
          </div>
        )}
      </div>
    </div>
  );
};