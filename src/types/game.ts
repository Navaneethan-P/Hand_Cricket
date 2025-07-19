export interface Player {
  id: string;
  name: string;
  score: number;
  move: number | null;
  isOut: boolean;
}

export interface Room {
  id: string;
  player1: Player | null;
  player2: Player | null;
  toss_winner: string | null;
  current_batting: string | null;
  current_bowling: string | null;
  game_state: 'waiting' | 'toss' | 'chooseRole' | 'playing' | 'switch' | 'result';
  current_round: number;
  moves_submitted: number;
}

export interface GameState {
  room: Room | null;
  playerId: string;
  playerName: string;
  isConnected: boolean;
  currentScreen: 'welcome' | 'toss' | 'game' | 'result';
}