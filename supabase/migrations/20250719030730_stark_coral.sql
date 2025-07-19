/*
  # Create rooms table for hand cricket game

  1. New Tables
    - `rooms`
      - `id` (text, primary key) - Room code for joining
      - `player1` (jsonb) - First player data including name, score, move, isOut status
      - `player2` (jsonb) - Second player data including name, score, move, isOut status  
      - `toss_winner` (text) - Which player won the toss (player1/player2)
      - `current_batting` (text) - Which player is currently batting (player1/player2)
      - `current_bowling` (text) - Which player is currently bowling (player1/player2)
      - `game_state` (text) - Current state of the game (waiting/toss/chooseRole/playing/switch/result)
      - `current_round` (integer) - Current round number
      - `moves_submitted` (integer) - Number of moves submitted in current round
      - `created_at` (timestamptz) - When the room was created

  2. Security
    - Enable RLS on `rooms` table
    - Add policies for anonymous users to read, insert, update, and delete rooms
    
  3. Indexes
    - Add index on created_at for cleanup queries
*/

CREATE TABLE IF NOT EXISTS rooms (
  id text PRIMARY KEY,
  player1 jsonb,
  player2 jsonb,
  toss_winner text,
  current_batting text,
  current_bowling text,
  game_state text DEFAULT 'waiting',
  current_round integer DEFAULT 1,
  moves_submitted integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rooms"
  ON rooms
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert rooms"
  ON rooms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update rooms"
  ON rooms
  FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete rooms"
  ON rooms
  FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS rooms_created_at_idx ON rooms (created_at);