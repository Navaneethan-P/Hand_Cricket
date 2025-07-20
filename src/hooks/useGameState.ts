import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Room, GameState, Team, Player } from '../types/game';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface MatchSettings {
  maxPlayersPerTeam: number;
  maxOvers: number;
  teamAName: string;
  teamBName: string;
}

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    room: null,
    playerId: uuidv4(),
    playerName: '',
    isConnected: false,
    currentScreen: 'welcome',
    isHost: false
  });

  const [timeLeft, setTimeLeft] = useState(3);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [moveSubmitted, setMoveSubmitted] = useState(false);

  // Real-time room subscription
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
        async (payload) => {
          if (payload.new) {
            const roomData = payload.new as any;
            const updatedRoom = await reconstructRoomFromDatabase(roomData);
            setGameState(prev => ({
              ...prev,
              room: updatedRoom
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameState.room?.id]);

  // Update screen based on room state changes
  useEffect(() => {
    if (!gameState.room) return;
    
    const { game_state } = gameState.room;
    
    if (game_state === 'waiting' || game_state === 'teamSetup') {
      setGameState(prev => ({ ...prev, currentScreen: 'lobby' }));
    } else if (game_state === 'toss' || game_state === 'chooseRole') {
      setGameState(prev => ({ ...prev, currentScreen: 'toss' }));
    } else if (game_state === 'playing' || game_state === 'innings_break') {
      setGameState(prev => ({ ...prev, currentScreen: 'game' }));
    } else if (game_state === 'result') {
      setGameState(prev => ({ ...prev, currentScreen: 'result' }));
    }
  }, [gameState.room?.game_state]);

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

  const reconstructRoomFromDatabase = async (roomData: any): Promise<Room> => {
    const allPlayers: Player[] = [];
    
    // Collect all players from database
    if (roomData.player1) {
      allPlayers.push({
        id: roomData.player1.id,
        name: roomData.player1.name,
        score: 0,
        move: null,
        isOut: false,
        ballsFaced: 0,
        runsScored: 0
      });
    }
    
    if (roomData.player2) {
      allPlayers.push({
        id: roomData.player2.id,
        name: roomData.player2.name,
        score: 0,
        move: null,
        isOut: false,
        ballsFaced: 0,
        runsScored: 0
      });
    }

    // Add more players from stored data if available
    if (roomData.player1?.allPlayers) {
      roomData.player1.allPlayers.forEach((p: any) => {
        if (!allPlayers.find(existing => existing.id === p.id)) {
          allPlayers.push(p);
        }
      });
    }

    // Distribute players into teams
    const maxPerTeam = roomData.player1?.maxPlayersPerTeam || 3;
    const teamAPlayers = allPlayers.slice(0, Math.ceil(allPlayers.length / 2));
    const teamBPlayers = allPlayers.slice(Math.ceil(allPlayers.length / 2));

    const teamA: Team = {
      id: 'teamA',
      name: roomData.player1?.teamName || 'Team A',
      players: teamAPlayers,
      totalScore: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      captain: teamAPlayers[0]?.id || '',
      currentBatsman: null,
      allOut: false
    };

    const teamB: Team = {
      id: 'teamB',
      name: roomData.player1?.teamBName || 'Team B',
      players: teamBPlayers,
      totalScore: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      captain: teamBPlayers[0]?.id || '',
      currentBatsman: null,
      allOut: false
    };

    return {
      id: roomData.id,
      host: roomData.player1?.id || '',
      teamA,
      teamB,
      toss_winner: roomData.toss_winner,
      current_batting: roomData.current_batting,
      current_bowling: roomData.current_bowling,
      game_state: roomData.game_state,
      current_round: roomData.current_round,
      moves_submitted: roomData.moves_submitted,
      target: null,
      maxPlayers: (roomData.player1?.maxPlayersPerTeam || 3) * 2,
      maxOvers: roomData.player1?.maxOvers || 2
    };
  };

  const createRoom = async (playerName: string, settings: MatchSettings) => {
    try {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newPlayer: Player = {
        id: gameState.playerId,
        name: playerName,
        score: 0,
        move: null,
        isOut: false,
        ballsFaced: 0,
        runsScored: 0
      };

      // Create room data that matches database schema
      const roomData = {
        id: roomId,
        player1: {
          id: gameState.playerId,
          name: playerName,
          teamName: settings.teamAName,
          maxPlayersPerTeam: settings.maxPlayersPerTeam,
          maxOvers: settings.maxOvers,
          teamBName: settings.teamBName,
          isHost: true,
          allPlayers: [newPlayer]
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
        .insert([roomData]);

      if (error) throw error;

      // Create the local room object for state management
      const teamA: Team = {
        id: 'teamA',
        name: settings.teamAName,
        players: [newPlayer],
        totalScore: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        captain: gameState.playerId,
        currentBatsman: null,
        allOut: false
      };

      const newRoom: Room = {
        id: roomId,
        host: gameState.playerId,
        teamA,
        teamB: {
          id: 'teamB',
          name: settings.teamBName,
          players: [],
          totalScore: 0,
          wickets: 0,
          overs: 0,
          balls: 0,
          captain: '',
          currentBatsman: null,
          allOut: false
        },
        toss_winner: null,
        current_batting: null,
        current_bowling: null,
        game_state: 'teamSetup',
        current_round: 1,
        moves_submitted: 0,
        target: null,
        maxPlayers: settings.maxPlayersPerTeam * 2,
        maxOvers: settings.maxOvers
      };

      setGameState(prev => ({
        ...prev,
        room: newRoom,
        playerName,
        isConnected: true,
        currentScreen: 'lobby',
        isHost: true
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

      // Check if room is full
      const currentPlayerCount = (room.player1?.allPlayers?.length || 1) + (room.player2 ? 1 : 0);
      const maxPlayers = (room.player1?.maxPlayersPerTeam || 3) * 2;
      
      if (currentPlayerCount >= maxPlayers) {
        toast.error('Room is full');
        return;
      }

      const newPlayer: Player = {
        id: gameState.playerId,
        name: playerName,
        score: 0,
        move: null,
        isOut: false,
        ballsFaced: 0,
        runsScored: 0
      };

      // Update database with player2
      const updatedRoomData = {
        ...room,
        player2: {
          id: gameState.playerId,
          name: playerName,
          isHost: false
        },
        player1: {
          ...room.player1,
          allPlayers: [
            ...(room.player1?.allPlayers || [{
              id: room.player1?.id || '',
              name: room.player1?.name || '',
              score: 0,
              move: null,
              isOut: false,
              ballsFaced: 0,
              runsScored: 0
            }]),
            newPlayer
          ]
        },
        game_state: 'teamSetup'
      };

      const { error: updateError } = await supabase
        .from('rooms')
        .update(updatedRoomData)
        .eq('id', roomId);

      if (updateError) throw updateError;

      // Reconstruct room from updated data
      const updatedRoom = await reconstructRoomFromDatabase(updatedRoomData);

      setGameState(prev => ({
        ...prev,
        room: updatedRoom,
        playerName,
        isConnected: true,
        currentScreen: 'lobby',
        isHost: false
      }));

      toast.success('Joined room successfully!');
      
    } catch (error) {
      toast.error('Failed to join room');
      console.error(error);
    }
  };

  const shufflePlayers = async () => {
    if (!gameState.room || !gameState.isHost) return;

    const allPlayers = [
      ...(gameState.room.teamA?.players || []),
      ...(gameState.room.teamB?.players || [])
    ];

    // Shuffle array
    const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);
    const midPoint = Math.ceil(shuffled.length / 2);

    const newTeamA = {
      ...gameState.room.teamA!,
      players: shuffled.slice(0, midPoint),
      captain: shuffled[0]?.id || ''
    };

    const newTeamB = {
      ...gameState.room.teamB!,
      players: shuffled.slice(midPoint),
      captain: shuffled[midPoint]?.id || ''
    };

    const { error } = await supabase
      .from('rooms')
      .update({
        teamA: newTeamA,
        teamB: newTeamB
      })
      .eq('id', gameState.room.id);

    if (error) {
      console.error('Shuffle error:', error);
      return;
    }

    toast.success('Teams shuffled!');
  };

  const movePlayer = async (playerId: string, toTeam: 'teamA' | 'teamB') => {
    if (!gameState.room || !gameState.isHost) return;

    const fromTeam = toTeam === 'teamA' ? 'teamB' : 'teamA';
    const player = gameState.room[fromTeam]?.players.find(p => p.id === playerId);
    
    if (!player) return;

    const updatedFromTeam = {
      ...gameState.room[fromTeam]!,
      players: gameState.room[fromTeam]!.players.filter(p => p.id !== playerId)
    };

    const updatedToTeam = {
      ...gameState.room[toTeam]!,
      players: [...gameState.room[toTeam]!.players, player]
    };

    // Update captain if needed
    if (updatedFromTeam.captain === playerId && updatedFromTeam.players.length > 0) {
      updatedFromTeam.captain = updatedFromTeam.players[0].id;
    }
    if (updatedToTeam.players.length === 1) {
      updatedToTeam.captain = playerId;
    }

    const { error } = await supabase
      .from('rooms')
      .update({
        [fromTeam]: updatedFromTeam,
        [toTeam]: updatedToTeam
      })
      .eq('id', gameState.room.id);

    if (error) {
      console.error('Move player error:', error);
      return;
    }
  };

  const startMatch = async () => {
    if (!gameState.room || !gameState.isHost) return;

    const { error } = await supabase
      .from('rooms')
      .update({
        game_state: 'toss'
      })
      .eq('id', gameState.room.id);

    if (error) {
      console.error('Start match error:', error);
      return;
    }

    // Trigger toss after a delay
    setTimeout(() => performToss(), 1000);
  };

  const performToss = async () => {
    if (!gameState.room || !gameState.isHost) return;

    const tossResult = Math.random() < 0.5 ? 'teamA' : 'teamB';
    
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

    const winner = tossResult === 'teamA' ? gameState.room.teamA?.name : gameState.room.teamB?.name;
    toast.success(`${winner} won the toss!`);
  };

  const chooseRole = async (role: 'bat' | 'bowl') => {
    if (!gameState.room || !gameState.room.toss_winner) return;

    const playerTeam = gameState.room.teamA?.players.find(p => p.id === gameState.playerId) ? 'teamA' : 'teamB';
    const isTossWinner = gameState.room.toss_winner === playerTeam;
    const isCaptain = (playerTeam === 'teamA' ? gameState.room.teamA?.captain : gameState.room.teamB?.captain) === gameState.playerId;

    if (!isTossWinner || !isCaptain) {
      toast.error('Only the winning captain can choose');
      return;
    }

    const currentBatting = role === 'bat' ? gameState.room.toss_winner : 
                          (gameState.room.toss_winner === 'teamA' ? 'teamB' : 'teamA');
    const currentBowling = role === 'bowl' ? gameState.room.toss_winner : 
                          (gameState.room.toss_winner === 'teamA' ? 'teamB' : 'teamA');

    // Set first batsman
    const battingTeam = currentBatting === 'teamA' ? gameState.room.teamA! : gameState.room.teamB!;
    const updatedBattingTeam = {
      ...battingTeam,
      currentBatsman: battingTeam.players[0]?.id || null
    };

    const { error } = await supabase
      .from('rooms')
      .update({
        current_batting: currentBatting,
        current_bowling: currentBowling,
        game_state: 'playing',
        [currentBatting]: updatedBattingTeam
      })
      .eq('id', gameState.room.id);

    if (error) {
      console.error('Role selection error:', error);
      return;
    }

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

    const playerTeam = gameState.room.teamA?.players.find(p => p.id === gameState.playerId) ? 'teamA' : 'teamB';
    const isBatting = gameState.room.current_batting === playerTeam;
    const team = gameState.room[playerTeam]!;
    
    // Update current batsman's move
    if (isBatting && team.currentBatsman === gameState.playerId) {
      const updatedPlayers = team.players.map(p => 
        p.id === gameState.playerId ? { ...p, move } : p
      );
      
      const updatedTeam = {
        ...team,
        players: updatedPlayers
      };

      const { error } = await supabase
        .from('rooms')
        .update({
          [playerTeam]: updatedTeam,
          moves_submitted: gameState.room.moves_submitted + 1
        })
        .eq('id', gameState.room.id);

      if (error) {
        console.error('Move submission error:', error);
        return;
      }
    }

    // Process round if both moves submitted
    if (gameState.room.moves_submitted + 1 === 2) {
      setTimeout(() => processRound(), 1000);
    }
  };

  const processRound = async () => {
    if (!gameState.room) return;

    const battingTeam = gameState.room.current_batting === 'teamA' ? gameState.room.teamA! : gameState.room.teamB!;
    const bowlingTeam = gameState.room.current_batting === 'teamA' ? gameState.room.teamB! : gameState.room.teamA!;
    
    const currentBatsman = battingTeam.players.find(p => p.id === battingTeam.currentBatsman);
    if (!currentBatsman) return;

    const batsmanMove = currentBatsman.move!;
    const bowlerMove = 3; // Random bowler move for now

    let updatedBattingTeam = { ...battingTeam };
    let gameOver = false;
    let inningsOver = false;

    // Check if OUT
    if (batsmanMove === bowlerMove) {
      // Batsman is OUT
      updatedBattingTeam.wickets += 1;
      
      // Update batsman stats
      updatedBattingTeam.players = updatedBattingTeam.players.map(p => 
        p.id === currentBatsman.id 
          ? { ...p, isOut: true, ballsFaced: p.ballsFaced + 1, move: null }
          : { ...p, move: null }
      );

      toast.error(`${currentBatsman.name} is OUT!`);

      // Check if all out or find next batsman
      const nextBatsman = updatedBattingTeam.players.find(p => !p.isOut && p.id !== currentBatsman.id);
      if (nextBatsman) {
        updatedBattingTeam.currentBatsman = nextBatsman.id;
      } else {
        updatedBattingTeam.allOut = true;
        inningsOver = true;
      }
    } else {
      // Add runs
      updatedBattingTeam.totalScore += batsmanMove;
      
      // Update batsman stats
      updatedBattingTeam.players = updatedBattingTeam.players.map(p => 
        p.id === currentBatsman.id 
          ? { 
              ...p, 
              runsScored: p.runsScored + batsmanMove,
              ballsFaced: p.ballsFaced + 1,
              move: null 
            }
          : { ...p, move: null }
      );

      toast.success(`${batsmanMove} runs scored!`);
    }

    // Update balls and overs
    updatedBattingTeam.balls += 1;
    if (updatedBattingTeam.balls % 6 === 0) {
      updatedBattingTeam.overs += 1;
      if (updatedBattingTeam.overs >= gameState.room.maxOvers) {
        inningsOver = true;
      }
    }

    // Check if target achieved
    if (gameState.room.target && updatedBattingTeam.totalScore >= gameState.room.target) {
      gameOver = true;
    }

    let updatedRoom = {
      ...gameState.room,
      [gameState.room.current_batting!]: updatedBattingTeam,
      moves_submitted: 0,
      current_round: gameState.room.current_round + 1
    };

    if (inningsOver && !gameState.room.target) {
      // First innings over, set target and switch
      updatedRoom.target = updatedBattingTeam.totalScore + 1;
      updatedRoom.current_batting = gameState.room.current_bowling;
      updatedRoom.current_bowling = gameState.room.current_batting;
      updatedRoom.game_state = 'innings_break';
      
      // Set first batsman for new batting team
      const newBattingTeam = updatedRoom.current_batting === 'teamA' ? updatedRoom.teamA! : updatedRoom.teamB!;
      updatedRoom[updatedRoom.current_batting!] = {
        ...newBattingTeam,
        currentBatsman: newBattingTeam.players[0]?.id || null
      };
    } else if (inningsOver || gameOver) {
      // Match over
      updatedRoom.game_state = 'result';
    }

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
    } else if (updatedRoom.game_state === 'innings_break') {
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
      currentScreen: 'welcome',
      isHost: false
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
    shufflePlayers,
    movePlayer,
    startMatch,
    chooseRole,
    selectMove,
    submitMove: () => submitMove(selectedMove || 0),
    resetGame
  };
};