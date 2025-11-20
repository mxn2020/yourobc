/**
 * Rendering Strategy Interface
 *
 * Abstraction layer that allows games to use different rendering approaches:
 * - Canvas 2D
 * - React Components
 * - WebGL (future)
 */

import type { RenderContext } from '../core/types';

/**
 * Abstract rendering strategy
 */
export abstract class RenderingStrategy {
  protected container: HTMLElement | null = null;

  /**
   * Initialize the rendering strategy with a container element
   */
  abstract initialize(container: HTMLElement): void;

  /**
   * Render a frame
   */
  abstract render(context: RenderContext, gameState: any): void;

  /**
   * Clean up resources
   */
  abstract destroy(): void;

  /**
   * Resize handler
   */
  abstract resize(width: number, height: number): void;

  /**
   * Get the container element
   */
  public getContainer(): HTMLElement | null {
    return this.container;
  }
}

/**
 * Canvas 2D Rendering Strategy
 *
 * Used for games like Dino that use canvas-based rendering
 */
export class CanvasRenderingStrategy extends RenderingStrategy {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private width: number = 0;
  private height: number = 0;

  constructor(
    private canvasWidth: number = 800,
    private canvasHeight: number = 600,
    private options: {
      alpha?: boolean;
      antialias?: boolean;
      backgroundColor?: string;
    } = {}
  ) {
    super();
  }

  initialize(container: HTMLElement): void {
    this.container = container;

    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.canvas.style.width = '100%';
    this.canvas.style.height = 'auto';
    this.canvas.style.maxWidth = `${this.canvasWidth}px`;
    this.canvas.style.display = 'block';
    this.canvas.style.margin = '0 auto';

    // Get 2D context
    this.ctx = this.canvas.getContext('2d', {
      alpha: this.options.alpha ?? false,
    });

    if (!this.ctx) {
      throw new Error('Failed to get 2D rendering context');
    }

    // Configure context
    if (this.options.antialias === false) {
      this.ctx.imageSmoothingEnabled = false;
    }

    // Append to container
    container.appendChild(this.canvas);

    this.width = this.canvasWidth;
    this.height = this.canvasHeight;
  }

  render(context: RenderContext, gameState: any): void {
    if (!this.ctx || !this.canvas) {
      return;
    }

    // Clear canvas
    if (this.options.backgroundColor) {
      this.ctx.fillStyle = this.options.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Provide context to game
    context.ctx = this.ctx;
    context.canvas = this.canvas;
  }

  destroy(): void {
    if (this.canvas && this.container) {
      this.container.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
    this.container = null;
  }

  resize(width: number, height: number): void {
    if (!this.canvas) return;

    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
  }

  public getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  public getContext(): CanvasRenderingContext2D | null {
    return this.ctx;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }
}

/**
 * React Rendering Strategy
 *
 * Used for games like Tetris that use React components for rendering
 */
export class ReactRenderingStrategy extends RenderingStrategy {
  private renderCallback: ((gameState: any) => React.ReactNode) | null = null;

  constructor() {
    super();
  }

  initialize(container: HTMLElement): void {
    this.container = container;
  }

  /**
   * Set the React render function
   * This should be called by the React component that wraps the game
   */
  setRenderCallback(callback: (gameState: any) => React.ReactNode): void {
    this.renderCallback = callback;
  }

  render(context: RenderContext, gameState: any): void {
    // React rendering is handled by the React component itself
    // This method is called to trigger React re-renders via state updates
    context.renderReact = this.renderCallback ?? undefined;
  }

  destroy(): void {
    this.renderCallback = null;
    this.container = null;
  }

  resize(width: number, height: number): void {
    // React components handle their own sizing via CSS
  }
}

/**
 * WebGL Rendering Strategy (placeholder for future use)
 */
export class WebGLRenderingStrategy extends RenderingStrategy {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;

  initialize(container: HTMLElement): void {
    this.container = container;

    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;

    // Get WebGL context
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl') as WebGLRenderingContext;

    if (!this.gl) {
      throw new Error('WebGL not supported');
    }

    container.appendChild(this.canvas);
  }

  render(context: RenderContext, gameState: any): void {
    if (!this.gl || !this.canvas) {
      return;
    }

    // Clear WebGL viewport
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    context.gl = this.gl;
    context.canvas = this.canvas;
  }

  destroy(): void {
    if (this.canvas && this.container) {
      this.container.removeChild(this.canvas);
    }
    this.canvas = null;
    this.gl = null;
    this.container = null;
  }

  resize(width: number, height: number): void {
    if (!this.canvas || !this.gl) return;

    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }
}
