import React from 'react';
import { Target, Shield, Clock, Trophy, Users, Star } from 'lucide-react';
import { Room } from '../types/game';

interface TeamGameScreenProps {
  room: Room;
  playerId: string;
  timeLeft: number;
  timerActive: boolean;
  selectedMove: number | null;
  moveSubmitted: boolean;
  onSelectMove: (move: number) => void;
  onSubmitMove: () => void;
}

export const TeamGameScreen: React.FC<TeamGameScreenProps> = ({
  room,
  playerId,
  timeLeft,
  timerActive,
  selectedMove,
  moveSubmitted,
  onSelectMove,
  onSubmitMove
}) => {
  const playerTeam = room.teamA?.players.find(p => p.id === playerId) ? 'teamA' : 'teamB';
  const myTeam = playerTeam === 'teamA' ? room.teamA! : room.teamB!;
  const opponentTeam = playerTeam === 'teamA' ? room.teamB! : room.teamA!;
  const isBatting = room.current_batting === playerTeam;
  
  const currentBatsman = myTeam.players.find(p => p.id === myTeam.currentBatsman);
  const isCurrentBatsman = myTeam.currentBatsman === playerId;
  const isMyTurn = isBatting && isCurrentBatsman;

  const numbers = [1, 2, 3, 4, 5, 6, 0];

  const getTimerColor = () => {
    if (timeLeft <= 1) return 'text-red-500 bg-red-100';
    if (timeLeft <= 2) return 'text-orange-500 bg-orange-100';
    return 'text-green-500 bg-green-100';
  };

  const formatOvers = (balls: number) => {
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return `${overs}.${remainingBalls}`;
  };

  const bothMovesSubmitted = room.moves_submitted === 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Score Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-center">
              <div className={`flex items-center gap-2 mb-2 ${isBatting ? 'text-blue-500' : 'text-gray-500'}`}>
                <Target className="w-4 h-4" />
                <span className="font-medium">{myTeam.name}</span>
                {isBatting && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">BAT</span>}
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {myTeam.totalScore}/{myTeam.wickets}
              </div>
              <div className="text-sm text-gray-500">
                {formatOvers(myTeam.balls)} overs
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">Round</div>
              <div className="text-xl font-bold text-gray-800">{room.current_round}</div>
              {room.target && (
                <div className="text-xs text-orange-600 mt-1">
                  Target: {room.target}
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className={`flex items-center gap-2 mb-2 ${!isBatting ? 'text-red-500' : 'text-gray-500'}`}>
                <Shield className="w-4 h-4" />
                <span className="font-medium">{opponentTeam.name}</span>
                {!isBatting && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">BOWL</span>}
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {opponentTeam.totalScore}/{opponentTeam.wickets}
              </div>
              <div className="text-sm text-gray-500">
                {formatOvers(opponentTeam.balls)} overs
              </div>
            </div>
          </div>

          {/* Current Batsman */}
          {isBatting && currentBatsman && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  {currentBatsman.name} batting
                </span>
                {isCurrentBatsman && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Your turn</span>
                )}
              </div>
              <div className="text-center text-sm text-gray-600 mt-1">
                {currentBatsman.runsScored} runs from {currentBatsman.ballsFaced} balls
              </div>
            </div>
          )}
        </div>

        {/* Timer */}
        {timerActive && isMyTurn && !moveSubmitted && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold ${getTimerColor()}`}>
              {timeLeft}
            </div>
            <p className="text-gray-600 mt-2">Choose your number!</p>
          </div>
        )}

        {/* Waiting for turn */}
        {isBatting && !isMyTurn && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Waiting for your turn</h3>
            <p className="text-gray-600">{currentBatsman?.name} is batting</p>
          </div>
        )}

        {/* Move Display */}
        {bothMovesSubmitted && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Batsman</div>
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {currentBatsman?.move}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg">VS</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Bowler</div>
                <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {/* Show opponent's move */}
                  ?
                </div>
              </div>
            </div>
            {currentBatsman?.move === 0 && (
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
        {timerActive && isMyTurn && !moveSubmitted && (
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

        {/* Innings Break */}
        {room.game_state === 'innings_break' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Innings Break!</h3>
            <p className="text-gray-600">Teams are switching roles...</p>
            {room.target && (
              <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                <p className="text-orange-700 font-semibold">
                  Target: {room.target} runs
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};