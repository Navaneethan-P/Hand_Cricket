/*
  # Create rooms table for hand cricket game

  1. New Tables
    - `rooms`
      - `id` (text, primary key) - Room code for joining
      - `player1` (jsonb) - Player 1 data including score, moves, etc.
      - `player2` (jsonb) - Player 2 data including score, moves, etc.
      - `toss_winner` (text) - Which player won the toss
      - `current_batting` (text) - Currently batting player
      - `current_bowling` (text) - Currently bowling player
      - `game_state` (text) - Current state of the game
      - `current_round` (integer) - Round number
      - `moves_submitted` (integer) - Count of moves submitted in current round
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `rooms` table
    - Add policy for authenticated users to read and write room data
    - Add policy for anonymous users to access rooms (for game functionality)
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

-- Allow all users to read and write rooms for game functionality
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

-- Index for better performance
CREATE INDEX IF NOT EXISTS rooms_created_at_idx ON rooms(created_at);

-- Function to clean up old rooms (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;