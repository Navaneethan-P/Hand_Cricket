import React from 'react';
import { Trophy, Target, RotateCcw, LogOut, Crown, Star } from 'lucide-react';
import { Room } from '../types/game';
import Confetti from 'react-confetti';

interface TeamResultScreenProps {
  room: Room;
  playerId: string;
  onPlayAgain: () => void;
  onExit: () => void;
}

export const TeamResultScreen: React.FC<TeamResultScreenProps> = ({
  room,
  playerId,
  onPlayAgain,
  onExit
}) => {
  const playerTeam = room.teamA?.players.find(p => p.id === playerId) ? 'teamA' : 'teamB';
  const myTeam = playerTeam === 'teamA' ? room.teamA! : room.teamB!;
  const opponentTeam = playerTeam === 'teamA' ? room.teamB! : room.teamA!;

  const getWinningTeam = () => {
    if (myTeam.totalScore > opponentTeam.totalScore) return myTeam;
    if (opponentTeam.totalScore > myTeam.totalScore) return opponentTeam;
    return null; // Draw
  };

  const winningTeam = getWinningTeam();
  const isWinner = winningTeam === myTeam;
  const isDraw = !winningTeam;

  const getResultMessage = () => {
    if (isDraw) return "It's a Draw!";
    return isWinner ? `${myTeam.name} Wins!` : `${opponentTeam.name} Wins!`;
  };

  const getResultColor = () => {
    if (isDraw) return "text-orange-500";
    return isWinner ? "text-green-500" : "text-red-500";
  };

  const getResultBg = () => {
    if (isDraw) return "from-orange-50 to-yellow-100";
    return isWinner ? "from-green-50 to-blue-100" : "from-red-50 to-pink-100";
  };

  const formatOvers = (balls: number) => {
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return `${overs}.${remainingBalls}`;
  };

  const getTopScorer = (team: typeof myTeam) => {
    return team.players.reduce((top, player) => 
      player.runsScored > top.runsScored ? player : top
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getResultBg()} p-4 relative`}>
      {isWinner && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center mb-6">
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
              {isDraw ? "Both teams scored equally!" : 
               isWinner ? "Congratulations to your team!" : "Well played!"}
            </p>
          </div>

          {/* Match Summary */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Match Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${
                winningTeam === myTeam ? 'bg-green-100 border-2 border-green-500' : 'bg-white'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{myTeam.name}</span>
                  {winningTeam === myTeam && <Trophy className="w-4 h-4 text-green-500" />}
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {myTeam.totalScore}/{myTeam.wickets}
                </div>
                <div className="text-sm text-gray-500">
                  {formatOvers(myTeam.balls)} overs
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${
                winningTeam === opponentTeam ? 'bg-green-100 border-2 border-green-500' : 'bg-white'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-red-500" />
                  <span className="font-medium">{opponentTeam.name}</span>
                  {winningTeam === opponentTeam && <Trophy className="w-4 h-4 text-green-500" />}
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {opponentTeam.totalScore}/{opponentTeam.wickets}
                </div>
                <div className="text-sm text-gray-500">
                  {formatOvers(opponentTeam.balls)} overs
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player Statistics */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* My Team Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-blue-600">{myTeam.name}</h3>
            </div>
            <div className="space-y-3">
              {myTeam.players
                .sort((a, b) => b.runsScored - a.runsScored)
                .map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {index === 0 && player.runsScored > 0 && (
                      <Star className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="font-medium">{player.name}</span>
                    {player.id === playerId && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">You</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{player.runsScored}</div>
                    <div className="text-xs text-gray-500">
                      {player.ballsFaced} balls
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opponent Team Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-red-600">{opponentTeam.name}</h3>
            </div>
            <div className="space-y-3">
              {opponentTeam.players
                .sort((a, b) => b.runsScored - a.runsScored)
                .map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {index === 0 && player.runsScored > 0 && (
                      <Star className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{player.runsScored}</div>
                    <div className="text-xs text-gray-500">
                      {player.ballsFaced} balls
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex gap-4">
            <button
              onClick={onPlayAgain}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
            <button
              onClick={onExit}
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Exit Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};