import React, { useState } from 'react';
import { Users, Plus, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (roomId: string, name: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onCreateRoom,
  onJoinRoom
}) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    if (mode === 'create') {
      onCreateRoom(playerName);
    } else if (mode === 'join' && roomCode.trim()) {
      onJoinRoom(roomCode.toUpperCase(), playerName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hand Cricket</h1>
          <p className="text-gray-600">Play with friends online!</p>
        </div>

        {!mode ? (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Room
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Join Room
            </button>
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
                {mode === 'create' ? 'Create' : 'Join'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};