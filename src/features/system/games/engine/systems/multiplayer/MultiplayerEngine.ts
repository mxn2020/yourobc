/**
 * Multiplayer Engine
 *
 * Room-based multiplayer system for turn-based and real-time games
 * Features:
 * - Room creation and management
 * - Player state synchronization
 * - Room codes for easy joining
 * - Host migration
 * - Ready check system
 * - Game mode configuration
 */

import type { MultiplayerRoomConfig, PlayerState } from '../../core/types';

export interface MultiplayerConfig {
  /** Enable auto-host migration */
  enableHostMigration: boolean;
  /** Max players per room */
  defaultMaxPlayers: number;
  /** Room timeout (ms) */
  roomTimeout?: number;
}

export interface RoomState {
  /** Room configuration */
  config: MultiplayerRoomConfig;
  /** Players in room */
  players: Map<string, PlayerState>;
  /** Room status */
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  /** Created timestamp */
  createdAt: number;
  /** Last activity timestamp */
  lastActivity: number;
}

type RoomEventCallback = (event: string, data: any) => void;
type PlayerUpdateCallback = (playerId: string, state: PlayerState) => void;

export class MultiplayerEngine {
  private config: MultiplayerConfig;
  private rooms: Map<string, RoomState> = new Map();
  private roomEventCallbacks: Map<string, Set<RoomEventCallback>> = new Map();
  private playerUpdateCallbacks: Set<PlayerUpdateCallback> = new Set();

  constructor(config: MultiplayerConfig) {
    this.config = config;
  }

  /**
   * Create a new multiplayer room
   */
  public createRoom(
    gameId: string,
    hostUserId: string,
    config: Partial<MultiplayerRoomConfig> = {}
  ): RoomState {
    const roomId = this.generateRoomId();
    const roomCode = this.generateRoomCode();

    const roomConfig: MultiplayerRoomConfig = {
      roomId,
      gameId,
      hostUserId,
      name: config.name || `Room ${roomCode}`,
      maxPlayers: config.maxPlayers || this.config.defaultMaxPlayers,
      roomCode,
      isPrivate: config.isPrivate ?? false,
      gameMode: config.gameMode,
      settings: config.settings || {},
    };

    const hostPlayer: PlayerState = {
      playerId: this.generatePlayerId(),
      userId: hostUserId,
      displayName: config.name || 'Host',
      isReady: false,
      isHost: true,
      score: 0,
    };

    const room: RoomState = {
      config: roomConfig,
      players: new Map([[hostPlayer.playerId, hostPlayer]]),
      status: 'waiting',
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    this.rooms.set(roomId, room);

    this.emitRoomEvent(roomId, 'room_created', { room });

    return room;
  }

  /**
   * Join a room
   */
  public joinRoom(
    roomId: string,
    userId: string,
    displayName: string
  ): PlayerState | null {
    const room = this.rooms.get(roomId);

    if (!room) {
      console.error('[MultiplayerEngine] Room not found:', roomId);
      return null;
    }

    if (room.players.size >= room.config.maxPlayers) {
      console.error('[MultiplayerEngine] Room is full');
      return null;
    }

    if (room.status !== 'waiting') {
      console.error('[MultiplayerEngine] Room is not accepting players');
      return null;
    }

    const player: PlayerState = {
      playerId: this.generatePlayerId(),
      userId,
      displayName,
      isReady: false,
      isHost: false,
      score: 0,
    };

    room.players.set(player.playerId, player);
    room.lastActivity = Date.now();

    this.emitRoomEvent(roomId, 'player_joined', { player });

    return player;
  }

  /**
   * Leave a room
   */
  public leaveRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    const player = room.players.get(playerId);
    if (!player) {
      return;
    }

    room.players.delete(playerId);
    room.lastActivity = Date.now();

    this.emitRoomEvent(roomId, 'player_left', { player });

    // Handle host migration
    if (player.isHost && room.players.size > 0 && this.config.enableHostMigration) {
      const newHost = Array.from(room.players.values())[0];
      newHost.isHost = true;
      room.config.hostUserId = newHost.userId;

      this.emitRoomEvent(roomId, 'host_changed', { newHost });
    }

    // Delete room if empty
    if (room.players.size === 0) {
      this.rooms.delete(roomId);
      this.emitRoomEvent(roomId, 'room_closed', { roomId });
    }
  }

  /**
   * Set player ready status
   */
  public setPlayerReady(roomId: string, playerId: string, isReady: boolean): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    player.isReady = isReady;
    room.lastActivity = Date.now();

    this.emitRoomEvent(roomId, 'player_ready_changed', { playerId, isReady });

    // Check if all players are ready
    const allReady = Array.from(room.players.values()).every(p => p.isReady);
    if (allReady && room.players.size >= 2) {
      room.status = 'ready';
      this.emitRoomEvent(roomId, 'room_ready', { room });
    }
  }

  /**
   * Start the game in a room
   */
  public startGame(roomId: string, hostPlayerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const host = room.players.get(hostPlayerId);
    if (!host || !host.isHost) {
      console.error('[MultiplayerEngine] Only host can start game');
      return false;
    }

    if (room.status !== 'ready' && room.status !== 'waiting') {
      console.error('[MultiplayerEngine] Room not ready to start');
      return false;
    }

    room.status = 'playing';
    room.lastActivity = Date.now();

    this.emitRoomEvent(roomId, 'game_started', { room });

    return true;
  }

  /**
   * Update player state during game
   */
  public updatePlayerState(roomId: string, playerId: string, gameState: any): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    player.gameState = gameState;
    room.lastActivity = Date.now();

    // Notify player update callbacks
    this.playerUpdateCallbacks.forEach(callback => {
      try {
        callback(playerId, player);
      } catch (error) {
        console.error('[MultiplayerEngine] Error in player update callback:', error);
      }
    });

    this.emitRoomEvent(roomId, 'player_state_updated', { playerId, gameState });
  }

  /**
   * Update player score
   */
  public updatePlayerScore(roomId: string, playerId: string, score: number): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    player.score = score;
    room.lastActivity = Date.now();

    this.emitRoomEvent(roomId, 'player_score_updated', { playerId, score });
  }

  /**
   * End the game
   */
  public endGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.status = 'finished';
    room.lastActivity = Date.now();

    // Calculate rankings
    const rankings = Array.from(room.players.values())
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        rank: index + 1,
        playerId: player.playerId,
        userId: player.userId,
        displayName: player.displayName,
        score: player.score,
      }));

    this.emitRoomEvent(roomId, 'game_ended', { rankings });
  }

  /**
   * Get room by ID
   */
  public getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get room by code
   */
  public getRoomByCode(roomCode: string): RoomState | undefined {
    for (const room of this.rooms.values()) {
      if (room.config.roomCode === roomCode) {
        return room;
      }
    }
    return undefined;
  }

  /**
   * Get all public rooms for a game
   */
  public getPublicRooms(gameId: string): RoomState[] {
    return Array.from(this.rooms.values()).filter(
      room => room.config.gameId === gameId && !room.config.isPrivate && room.status === 'waiting'
    );
  }

  /**
   * Register room event callback
   */
  public onRoomEvent(roomId: string, callback: RoomEventCallback): () => void {
    if (!this.roomEventCallbacks.has(roomId)) {
      this.roomEventCallbacks.set(roomId, new Set());
    }

    this.roomEventCallbacks.get(roomId)!.add(callback);

    return () => {
      const callbacks = this.roomEventCallbacks.get(roomId);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Register player update callback
   */
  public onPlayerUpdate(callback: PlayerUpdateCallback): () => void {
    this.playerUpdateCallbacks.add(callback);
    return () => this.playerUpdateCallbacks.delete(callback);
  }

  /**
   * Emit room event
   */
  private emitRoomEvent(roomId: string, event: string, data: any): void {
    const callbacks = this.roomEventCallbacks.get(roomId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event, data);
        } catch (error) {
          console.error('[MultiplayerEngine] Error in room event callback:', error);
        }
      });
    }
  }

  /**
   * Generate unique room ID
   */
  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate room code (6 characters)
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  /**
   * Generate unique player ID
   */
  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up inactive rooms
   */
  public cleanupInactiveRooms(): void {
    if (!this.config.roomTimeout) return;

    const now = Date.now();

    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.lastActivity > this.config.roomTimeout) {
        this.rooms.delete(roomId);
        this.emitRoomEvent(roomId, 'room_timeout', { roomId });
      }
    }
  }

  /**
   * Get statistics
   */
  public getStats(): {
    totalRooms: number;
    activeRooms: number;
    waitingRooms: number;
    playingRooms: number;
    totalPlayers: number;
  } {
    let activeRooms = 0;
    let waitingRooms = 0;
    let playingRooms = 0;
    let totalPlayers = 0;

    for (const room of this.rooms.values()) {
      if (room.status === 'waiting') waitingRooms++;
      if (room.status === 'playing' || room.status === 'ready') {
        playingRooms++;
        activeRooms++;
      }
      totalPlayers += room.players.size;
    }

    return {
      totalRooms: this.rooms.size,
      activeRooms,
      waitingRooms,
      playingRooms,
      totalPlayers,
    };
  }
}
