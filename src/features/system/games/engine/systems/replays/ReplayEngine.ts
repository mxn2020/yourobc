/**
 * Replay Engine
 *
 * Record and playback game sessions
 * Features:
 * - Input recording with compression
 * - Frame-accurate playback
 * - Replay validation
 * - Fast forward/slow motion
 * - Replay metadata (score, duration, etc.)
 */

import type { ReplayData, CompressedInput } from '../../core/types';

export interface ReplayConfig {
  /** Replay format version */
  version: string;
  /** Enable input compression */
  enableCompression: boolean;
  /** Maximum replay duration (ms) */
  maxDuration?: number;
}

export interface RecordingSession {
  /** Session ID */
  id: string;
  /** Game ID */
  gameId: string;
  /** Initial game state */
  initialState: any;
  /** Recorded inputs */
  inputs: CompressedInput[];
  /** Start timestamp */
  startTime: number;
  /** Is currently recording */
  isRecording: boolean;
}

export interface PlaybackSession {
  /** Replay data */
  replay: ReplayData;
  /** Current frame */
  currentFrame: number;
  /** Current input index */
  currentInputIndex: number;
  /** Playback speed multiplier */
  speed: number;
  /** Is currently playing */
  isPlaying: boolean;
  /** Start time of playback */
  startTime: number;
}

type InputCallback = (frame: number, action: string, value?: number) => void;

export class ReplayEngine {
  private config: ReplayConfig;
  private recordingSession: RecordingSession | null = null;
  private playbackSession: PlaybackSession | null = null;
  private inputCallbacks: Set<InputCallback> = new Set();

  constructor(config: ReplayConfig) {
    this.config = config;
  }

  /**
   * Start recording a new session
   */
  public startRecording(gameId: string, initialState: any): string {
    if (this.recordingSession) {
      console.warn('[ReplayEngine] Already recording, stopping previous session');
      this.stopRecording();
    }

    const sessionId = this.generateSessionId();

    this.recordingSession = {
      id: sessionId,
      gameId,
      initialState: this.cloneState(initialState),
      inputs: [],
      startTime: Date.now(),
      isRecording: true,
    };

    return sessionId;
  }

  /**
   * Record an input action
   */
  public recordInput(frame: number, action: string, value?: number): void {
    if (!this.recordingSession || !this.recordingSession.isRecording) {
      return;
    }

    const input: CompressedInput = {
      f: frame,
      a: action,
    };

    if (value !== undefined) {
      input.v = value;
    }

    this.recordingSession.inputs.push(input);

    // Check max duration
    if (this.config.maxDuration) {
      const duration = Date.now() - this.recordingSession.startTime;
      if (duration > this.config.maxDuration) {
        console.warn('[ReplayEngine] Max duration reached, stopping recording');
        this.stopRecording();
      }
    }
  }

  /**
   * Stop recording and create replay data
   */
  public stopRecording(
    userId: string,
    score: number,
    metadata?: Record<string, any>
  ): ReplayData | null {
    if (!this.recordingSession) {
      return null;
    }

    const session = this.recordingSession;
    session.isRecording = false;

    const duration = Date.now() - session.startTime;

    const replayData: ReplayData = {
      id: session.id,
      gameId: session.gameId,
      userId,
      score,
      duration,
      version: this.config.version,
      inputs: this.config.enableCompression
        ? this.compressInputs(session.inputs)
        : session.inputs,
      initialState: session.initialState,
      createdAt: session.startTime,
      metadata,
    };

    this.recordingSession = null;

    return replayData;
  }

  /**
   * Cancel recording without saving
   */
  public cancelRecording(): void {
    this.recordingSession = null;
  }

  /**
   * Check if currently recording
   */
  public isRecording(): boolean {
    return this.recordingSession?.isRecording ?? false;
  }

  /**
   * Start replay playback
   */
  public startPlayback(replay: ReplayData, speed: number = 1.0): boolean {
    if (this.playbackSession) {
      console.warn('[ReplayEngine] Already playing, stopping previous playback');
      this.stopPlayback();
    }

    // Validate replay version
    if (replay.version !== this.config.version) {
      console.error('[ReplayEngine] Replay version mismatch');
      return false;
    }

    // Decompress inputs if needed
    const inputs = this.config.enableCompression
      ? this.decompressInputs(replay.inputs)
      : replay.inputs;

    this.playbackSession = {
      replay: { ...replay, inputs },
      currentFrame: 0,
      currentInputIndex: 0,
      speed,
      isPlaying: true,
      startTime: Date.now(),
    };

    return true;
  }

  /**
   * Update playback (call this each frame)
   */
  public updatePlayback(currentFrame: number): void {
    if (!this.playbackSession || !this.playbackSession.isPlaying) {
      return;
    }

    const session = this.playbackSession;

    // Process all inputs for this frame (accounting for speed)
    const targetFrame = Math.floor(currentFrame * session.speed);

    while (
      session.currentInputIndex < session.replay.inputs.length &&
      session.replay.inputs[session.currentInputIndex].f <= targetFrame
    ) {
      const input = session.replay.inputs[session.currentInputIndex];

      // Trigger input callbacks
      this.inputCallbacks.forEach(callback => {
        try {
          callback(input.f, input.a, input.v);
        } catch (error) {
          console.error('[ReplayEngine] Error in input callback:', error);
        }
      });

      session.currentInputIndex++;
    }

    session.currentFrame = targetFrame;

    // Check if playback is complete
    if (session.currentInputIndex >= session.replay.inputs.length) {
      this.stopPlayback();
    }
  }

  /**
   * Stop playback
   */
  public stopPlayback(): void {
    this.playbackSession = null;
  }

  /**
   * Pause playback
   */
  public pausePlayback(): void {
    if (this.playbackSession) {
      this.playbackSession.isPlaying = false;
    }
  }

  /**
   * Resume playback
   */
  public resumePlayback(): void {
    if (this.playbackSession) {
      this.playbackSession.isPlaying = true;
    }
  }

  /**
   * Set playback speed
   */
  public setPlaybackSpeed(speed: number): void {
    if (this.playbackSession) {
      this.playbackSession.speed = Math.max(0.1, Math.min(speed, 10.0));
    }
  }

  /**
   * Seek to specific frame
   */
  public seekToFrame(frame: number): void {
    if (!this.playbackSession) {
      return;
    }

    const session = this.playbackSession;

    // Find the input index for this frame
    let inputIndex = 0;
    while (
      inputIndex < session.replay.inputs.length &&
      session.replay.inputs[inputIndex].f < frame
    ) {
      inputIndex++;
    }

    session.currentFrame = frame;
    session.currentInputIndex = inputIndex;
  }

  /**
   * Check if currently playing
   */
  public isPlaying(): boolean {
    return this.playbackSession?.isPlaying ?? false;
  }

  /**
   * Get current playback progress (0-1)
   */
  public getPlaybackProgress(): number {
    if (!this.playbackSession) {
      return 0;
    }

    const session = this.playbackSession;
    const totalInputs = session.replay.inputs.length;

    if (totalInputs === 0) {
      return 1;
    }

    return session.currentInputIndex / totalInputs;
  }

  /**
   * Get current playback time (ms)
   */
  public getPlaybackTime(): number {
    if (!this.playbackSession) {
      return 0;
    }

    return Date.now() - this.playbackSession.startTime;
  }

  /**
   * Get playback session
   */
  public getPlaybackSession(): PlaybackSession | null {
    return this.playbackSession;
  }

  /**
   * Register input callback for playback
   */
  public onInput(callback: InputCallback): () => void {
    this.inputCallbacks.add(callback);
    return () => this.inputCallbacks.delete(callback);
  }

  /**
   * Validate replay data
   */
  public validateReplay(replay: ReplayData): boolean {
    // Check version
    if (replay.version !== this.config.version) {
      return false;
    }

    // Check required fields
    if (!replay.id || !replay.gameId || !replay.userId) {
      return false;
    }

    // Check inputs are valid
    if (!Array.isArray(replay.inputs)) {
      return false;
    }

    // Check inputs are sorted by frame
    for (let i = 1; i < replay.inputs.length; i++) {
      if (replay.inputs[i].f < replay.inputs[i - 1].f) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get replay summary
   */
  public getReplaySummary(replay: ReplayData): {
    duration: number;
    inputCount: number;
    averageInputsPerSecond: number;
    score: number;
  } {
    const inputCount = replay.inputs.length;
    const durationSeconds = replay.duration / 1000;
    const averageInputsPerSecond = durationSeconds > 0 ? inputCount / durationSeconds : 0;

    return {
      duration: replay.duration,
      inputCount,
      averageInputsPerSecond,
      score: replay.score,
    };
  }

  /**
   * Compress inputs (remove redundant data)
   */
  private compressInputs(inputs: CompressedInput[]): CompressedInput[] {
    // Simple compression: remove duplicate consecutive actions
    const compressed: CompressedInput[] = [];
    let lastAction: string | null = null;

    for (const input of inputs) {
      // Always include if action changed or has value
      if (input.a !== lastAction || input.v !== undefined) {
        compressed.push(input);
        lastAction = input.a;
      }
    }

    return compressed;
  }

  /**
   * Decompress inputs
   */
  private decompressInputs(inputs: CompressedInput[]): CompressedInput[] {
    // Currently no decompression needed as compression is simple
    return inputs;
  }

  /**
   * Clone state
   */
  private cloneState(state: any): any {
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `replay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export replay as JSON
   */
  public exportReplay(replay: ReplayData): string {
    return JSON.stringify(replay);
  }

  /**
   * Import replay from JSON
   */
  public importReplay(json: string): ReplayData | null {
    try {
      const replay: ReplayData = JSON.parse(json);

      if (!this.validateReplay(replay)) {
        console.error('[ReplayEngine] Invalid replay data');
        return null;
      }

      return replay;
    } catch (error) {
      console.error('[ReplayEngine] Failed to import replay:', error);
      return null;
    }
  }
}
