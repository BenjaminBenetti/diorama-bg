
export abstract class  LayerBase {

  // the position in the layer stack. 0 is the top layer.
  public zIndex: number;
  // optional offscreen canvas for complex rendering
  public offscreenCanvas?: HTMLCanvasElement;
  // flag to indicate if this layer needs offscreen canvas support
  public needsOffscreenCanvas: boolean = false;

  // ==================================
  // Public Methods
  // ==================================

  constructor( zIndex: number) {
    this.zIndex = zIndex;
  }

  public abstract load(): Promise<void>;

  /**
   * Render the layer to the provided canvas context.
   * Layers are rendered back to front (lowest z-index first).
   * This means canvas pixel data will be available from layers with a lower zIndex.
   * @param ctx - The main canvas context to render to
   * @param layerStack - The stack of all layers. This is provided to allow layers to interact with each other.
   */
  public abstract render(ctx: CanvasRenderingContext2D, layerStack: LayerBase[]): void;

  /**
   * Create an offscreen canvas for this layer if needed.
   * @param width - The width of the offscreen canvas
   * @param height - The height of the offscreen canvas
   */
  public createOffscreenCanvas(width: number, height: number): void {
    if (this.needsOffscreenCanvas) {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }
  }

  /**
   * Get the offscreen canvas context if available.
   * @returns The offscreen canvas context, or null if not available
   */
  public getOffscreenContext(): CanvasRenderingContext2D | null {
    return this.offscreenCanvas ? this.offscreenCanvas.getContext('2d') : null;
  }
}