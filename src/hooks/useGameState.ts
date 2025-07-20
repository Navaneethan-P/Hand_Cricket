import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Room, GameState } from '../types/game';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    room: null,
    playerId: uuidv4(),
    playerName: '',
    isConnected: false,
    currentScreen: 'welcome'
  });

  const [timeLeft, setTimeLeft] = useState(3);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [moveSubmitted, setMoveSubmitted] = useState(false);

  // Update screen based on room state changes
  useEffect(() => {
    if (!gameState.room) return;
    
    if (gameState.room.game_state === 'waiting') {
      setGameState(prev => ({ ...prev, currentScreen: 'toss' }));
    } else if (gameState.room.game_state === 'toss' || gameState.room.game_state === 'chooseRole') {
      setGameState(prev => ({ ...prev, currentScreen: 'toss' }));
    } else if (gameState.room.game_state === 'playing' || gameState.room.game_state === 'switch') {
      setGameState(prev => ({ ...prev, currentScreen: 'game' }));
    } else if (gameState.room.game_state === 'result') {
      setGameState(prev => ({ ...prev, currentScreen: 'result' }));
    }
  }, [gameState.room?.game_state]);

  // Trigger toss when both players join
  useEffect(() => {
    if (gameState.room && 
        gameState.room.player1 && 
        gameState.room.player2 && 
        gameState.room.game_state === 'toss' && 
        !gameState.room.toss_winner) {
      // Only trigger toss if we're player1 to avoid duplicate calls
      if (gameState.room.player1.id === gameState.playerId) {
        setTimeout(() => performToss(), 1000);
      }
    }
  }, [gameState.room?.player1, gameState.room?.player2, gameState.room?.game_state, gameState.room?.toss_winner]);

  // Subscribe to room changes
  useEffect(() => {
    if (!gameState.room?.id) return;

    const channel = supabase
      .channel(`room:${gameState.room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${gameState.room.id}`
        },
        (payload) => {
          if (payload.new) {
            setGameState(prev => ({
              ...prev,
              room: payload.new as Room
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameState.room?.id]);

  // Timer logic
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          if (!moveSubmitted) {
            submitMove(0); // Auto-submit 0 if timer expires
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [timerActive, timeLeft, moveSubmitted]);

  const createRoom = async (playerName: string) => {
    try {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newRoom: Room = {
        id: roomId,
        player1: {
          id: gameState.playerId,
          name: playerName,
          score: 0,
          move: null,
          isOut: false
        },
        player2: null,
        toss_winner: null,
        current_batting: null,
        current_bowling: null,
        game_state: 'waiting',
        current_round: 1,
        moves_submitted: 0,
      };

      const { error } = await supabase
        .from('rooms')
        .insert([newRoom]);

      if (error) throw error;

      setGameState(prev => ({
        ...prev,
        room: newRoom,
        playerName,
        isConnected: true,
        currentScreen: 'toss'
      }));

      toast.success(`Room created! Code: ${roomId}`);
    } catch (error) {
      toast.error('Failed to create room');
      console.error(error);
    }
  };

  const joinRoom = async (roomId: string, playerName: string) => {
    try {
      const { data: room, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error || !room) {
        toast.error('Room not found');
        return;
      }

      if (room.player2) {
        toast.error('Room is full');
        return;
      }

      const updatedRoom = {
        ...room,
        player2: {
          id: gameState.playerId,
          name: playerName,
          score: 0,
          move: null,
          isOut: false
        },
        game_state: 'toss' as const
      };

      const { error: updateError } = await supabase
        .from('rooms')
        .update(updatedRoom)
        .eq('id', roomId);

      if (updateError) throw updateError;

      setGameState(prev => ({
        ...prev,
        room: updatedRoom,
        playerName,
        isConnected: true,
        currentScreen: 'toss'
      }));

      toast.success('Joined room successfully!');
      
    } catch (error) {
      toast.error('Failed to join room');
      console.error(error);
    }
  };

  const performToss = async () => {
    if (!gameState.room) return;

    // Only perform toss if we're in toss state and no winner yet
    if (gameState.room.game_state !== 'toss' || gameState.room.toss_winner) return;

    const tossResult = Math.random() < 0.5 ? 'player1' : 'player2';
    
    const { error } = await supabase
      .from('rooms')
      .update({
        toss_winner: tossResult,
        game_state: 'chooseRole'
      })
      .eq('id', gameState.room.id);

    if (error) {
      console.error('Toss error:', error);
      return;
    }

    const winner = tossResult === 'player1' ? gameState.room.player1?.name : gameState.room.player2?.name;
    toast.success(`${winner} won the toss!`);
  };

  const chooseRole = async (role: 'bat' | 'bowl') => {
    if (!gameState.room || !gameState.room.toss_winner) return;

    const isPlayer1 = gameState.room.player1?.id === gameState.playerId;
    const isTossWinner = (isPlayer1 && gameState.room.toss_winner === 'player1') || 
                        (!isPlayer1 && gameState.room.toss_winner === 'player2');

    if (!isTossWinner) {
      toast.error('Wait for toss winner to choose');
      return;
    }

    const currentBatting = role === 'bat' ? gameState.room.toss_winner : 
                          (gameState.room.toss_winner === 'player1' ? 'player2' : 'player1');
    const currentBowling = role === 'bowl' ? gameState.room.toss_winner : 
                          (gameState.room.toss_winner === 'player1' ? 'player2' : 'player1');

    const { error } = await supabase
      .from('rooms')
      .update({
        current_batting: currentBatting,
        current_bowling: currentBowling,
        game_state: 'playing'
      })
      .eq('id', gameState.room.id);

    if (error) {
      console.error('Role selection error:', error);
      return;
    }

    setGameState(prev => ({ ...prev, currentScreen: 'game' }));
    startNewRound();
  };

  const startNewRound = () => {
    setTimeLeft(3);
    setTimerActive(true);
    setSelectedMove(null);
    setMoveSubmitted(false);
  };

  const selectMove = (move: number) => {
    if (moveSubmitted || !timerActive) return;
    setSelectedMove(move);
  };

  const submitMove = async (move: number) => {
    if (!gameState.room || moveSubmitted) return;

    setMoveSubmitted(true);
    setTimerActive(false);

    const isPlayer1 = gameState.room.player1?.id === gameState.playerId;
    const playerKey = isPlayer1 ? 'player1' : 'player2';
    
    const updatedPlayer = {
      ...gameState.room[playerKey],
      move
    };

    const newMovesSubmitted = gameState.room.moves_submitted + 1;

    const { error } = await supabase
      .from('rooms')
      .update({
        [playerKey]: updatedPlayer,
        moves_submitted: newMovesSubmitted
      })
      .eq('id', gameState.room.id);

    if (error) {
      console.error('Move submission error:', error);
      return;
    }

    // If both players have submitted, process the round
    if (newMovesSubmitted === 2) {
      setTimeout(() => processRound(), 1000);
    }
  };

  const processRound = async () => {
    if (!gameState.room || !gameState.room.player1 || !gameState.room.player2) return;

    const player1Move = gameState.room.player1.move!;
    const player2Move = gameState.room.player2.move!;
    const battingPlayer = gameState.room.current_batting === 'player1' ? 'player1' : 'player2';
    const batsmanMove = gameState.room[battingPlayer]!.move!;

    let updatedRoom = { ...gameState.room };

    // Check if OUT
    if (player1Move === player2Move) {
      // Batsman is OUT
      updatedRoom[battingPlayer] = {
        ...updatedRoom[battingPlayer]!,
        isOut: true
      };
      
      toast.error('OUT!');
      
      // Check if both players have batted
      if (gameState.room.current_batting === gameState.room.toss_winner) {
        // Switch roles
        updatedRoom.current_batting = gameState.room.current_bowling;
        updatedRoom.current_bowling = gameState.room.current_batting;
        updatedRoom.game_state = 'switch';
        toast.success('Switching roles!');
      } else {
        // Game over
        updatedRoom.game_state = 'result';
        setGameState(prev => ({ ...prev, currentScreen: 'result' }));
      }
    } else {
      // Add score
      updatedRoom[battingPlayer] = {
        ...updatedRoom[battingPlayer]!,
        score: updatedRoom[battingPlayer]!.score + batsmanMove
      };
      toast.success(`+${batsmanMove} runs!`);
    }

    // Reset moves and counter
    updatedRoom.player1.move = null;
    updatedRoom.player2.move = null;
    updatedRoom.moves_submitted = 0;
    updatedRoom.current_round += 1;

    const { error } = await supabase
      .from('rooms')
      .update(updatedRoom)
      .eq('id', gameState.room.id);

    if (error) {
      console.error('Round processing error:', error);
      return;
    }

    // Continue game if not ended
    if (updatedRoom.game_state === 'playing') {
      setTimeout(() => startNewRound(), 2000);
    } else if (updatedRoom.game_state === 'switch') {
      setTimeout(async () => {
        const { error: switchError } = await supabase
          .from('rooms')
          .update({ game_state: 'playing' })
          .eq('id', gameState.room!.id);
        
        if (!switchError) {
          startNewRound();
        }
      }, 3000);
    }
  };

  const resetGame = async () => {
    if (!gameState.room) return;

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', gameState.room.id);

    if (error) {
      console.error('Reset error:', error);
    }

    setGameState(prev => ({
      ...prev,
      room: null,
      isConnected: false,
      currentScreen: 'welcome'
    }));

    setTimeLeft(3);
    setTimerActive(false);
    setSelectedMove(null);
    setMoveSubmitted(false);
  };

  return {
    gameState,
    timeLeft,
    timerActive,
    selectedMove,
    moveSubmitted,
    createRoom,
    joinRoom,
    chooseRole,
    selectMove,
    submitMove: () => submitMove(selectedMove || 0),
    resetGame
  };
};