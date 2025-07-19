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
  tossWinner: string | null;
  current_batting: string | null;
  current_bowling: string | null;
  gameState: 'waiting' | 'toss' | 'chooseRole' | 'playing' | 'switch' | 'result';
  current_round: number;
  movesSubmitted: number;
}

export interface GameState {
  room: Room | null;
  playerId: string;
  playerName: string;
  isConnected: boolean;
  currentScreen: 'welcome' | 'toss' | 'game' | 'result';
}