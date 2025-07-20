export interface Player {
  id: string;
  name: string;
  score: number;
  move: number | null;
  isOut: boolean;
  ballsFaced: number;
  runsScored: number;
}

export interface Team {
  id: 'teamA' | 'teamB';
  name: string;
  players: Player[];
  totalScore: number;
  wickets: number;
  overs: number;
  balls: number;
  captain: string; // player id
  currentBatsman: string | null; // player id
  allOut: boolean;
}

export interface Room {
  id: string;
  host: string; // player id of room creator
  teamA: Team | null;
  teamB: Team | null;
  toss_winner: 'teamA' | 'teamB' | null;
  current_batting: 'teamA' | 'teamB' | null;
  current_bowling: 'teamA' | 'teamB' | null;
  game_state: 'waiting' | 'teamSetup' | 'toss' | 'chooseRole' | 'playing' | 'innings_break' | 'result';
  current_round: number;
  moves_submitted: number;
  target: number | null;
  maxPlayers: number;
  maxOvers: number;
  created_at?: string;
}

export interface GameState {
  room: Room | null;
  playerId: string;
  playerName: string;
  isConnected: boolean;
  currentScreen: 'welcome' | 'lobby' | 'teamSetup' | 'toss' | 'game' | 'result';
  isHost: boolean;
}

export interface MatchSettings {
  maxPlayersPerTeam: number;
  maxOvers: number;
  teamAName: string;
  teamBName: string;
}