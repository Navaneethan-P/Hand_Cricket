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
    return teamACount >= 2 && teamBCount >= 2 && teamACount === teamBCount;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Match Lobby</h1>
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              {room.id}
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
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
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
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-600">{room.teamA?.name || 'Team A'}</h2>
              <div className="text-sm text-gray-500">
                {room.teamA?.players.length || 0}/{room.maxPlayers / 2} players
              </div>
            </div>
            
            <div className="space-y-3">
              {room.teamA?.players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {room.teamA?.captain === player.id && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="font-medium">{player.name}</span>
                    {player.id === playerId && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">You</span>
                    )}
                  </div>
                  {isHost && (
                    <button
                      onClick={() => onMovePlayer(player.id, 'teamB')}
                      className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition-colors"
                    >
                      Move
                    </button>
                  )}
                </div>
              )) || (
                <div className="text-center text-gray-500 py-8">
                  No players yet
                </div>
              )}
            </div>
          </div>

          {/* Team B */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-red-600">{room.teamB?.name || 'Team B'}</h2>
              <div className="text-sm text-gray-500">
                {room.teamB?.players.length || 0}/{room.maxPlayers / 2} players
              </div>
            </div>
            
            <div className="space-y-3">
              {room.teamB?.players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {room.teamB?.captain === player.id && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="font-medium">{player.name}</span>
                    {player.id === playerId && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">You</span>
                    )}
                  </div>
                  {isHost && (
                    <button
                      onClick={() => onMovePlayer(player.id, 'teamA')}
                      className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition-colors"
                    >
                      Move
                    </button>
                  )}
                </div>
              )) || (
                <div className="text-center text-gray-500 py-8">
                  No players yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Host Controls */}
        {isHost && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Host Controls</h3>
            <div className="flex gap-4">
              <button
                onClick={onShufflePlayers}
                disabled={allPlayers.length < 4}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                Shuffle Teams
              </button>
              
              <button
                onClick={onStartMatch}
                disabled={!canStartMatch()}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Start Match
              </button>
            </div>
            
            {!canStartMatch() && (
              <p className="text-sm text-gray-500 mt-2">
                Need equal teams with at least 2 players each to start
              </p>
            )}
          </div>
        )}

        {/* Non-host waiting message */}
        {!isHost && (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-gray-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Waiting for host</h3>
            <p className="text-gray-600">The host will start the match when ready</p>
          </div>
        )}
      </div>
    </div>
  );
};