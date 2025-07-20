import React, { useState } from 'react';
import { Users, Plus, ArrowRight, Trophy, Settings } from 'lucide-react';

interface WelcomeScreenProps {
  onCreateRoom: (name: string, settings: MatchSettings) => void;
  onJoinRoom: (roomId: string, name: string) => void;
}

interface MatchSettings {
  maxPlayersPerTeam: number;
  maxOvers: number;
  teamAName: string;
  teamBName: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onCreateRoom,
  onJoinRoom
}) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join' | 'settings' | null>(null);
  const [settings, setSettings] = useState<MatchSettings>({
    maxPlayersPerTeam: 3,
    maxOvers: 2,
    teamAName: 'Team A',
    teamBName: 'Team B'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    if (mode === 'create') {
      setMode('settings');
    } else if (mode === 'join' && roomCode.trim()) {
      onJoinRoom(roomCode.toUpperCase(), playerName);
    }
  };

  const handleCreateRoom = () => {
    onCreateRoom(playerName, settings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Team Cricket</h1>
          <p className="text-gray-600">Play team-based cricket online!</p>
        </div>

        {!mode ? (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Match
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Join Match
            </button>
          </div>
        ) : mode === 'settings' ? (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Settings className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-800">Match Settings</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Players per team
              </label>
              <select
                value={settings.maxPlayersPerTeam}
                onChange={(e) => setSettings(prev => ({ ...prev, maxPlayersPerTeam: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={2}>2 players</option>
                <option value={3}>3 players</option>
                <option value={4}>4 players</option>
                <option value={5}>5 players</option>
                <option value={6}>6 players</option>
                <option value={1}>1 player</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overs per innings
              </label>
              <select
                value={settings.maxOvers}
                onChange={(e) => setSettings(prev => ({ ...prev, maxOvers: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1 over</option>
                <option value={2}>2 overs</option>
                <option value={3}>3 overs</option>
                <option value={5}>5 overs</option>
                <option value={10}>10 overs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team A Name
              </label>
              <input
                type="text"
                value={settings.teamAName}
                onChange={(e) => setSettings(prev => ({ ...prev, teamAName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Team A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team B Name
              </label>
              <input
                type="text"
                value={settings.teamBName}
                onChange={(e) => setSettings(prev => ({ ...prev, teamBName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Team B"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('create')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreateRoom}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>

            {mode === 'join' && (
              <div>
                <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                  placeholder="ABC123"
                  maxLength={6}
                  required
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                {mode === 'create' ? 'Next' : 'Join'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};