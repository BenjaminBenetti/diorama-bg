import { LayerBase } from "../../layers/model/layer-base.ts";
import { CanvasFactory } from "../../canvas/factory/canvas-factory.ts";

/**
 * Main controller class for managing diorama backgrounds.
 * Handles layer creation, management, and rendering coordination.
 * Uses a single canvas approach for optimal performance.
 */
export class DioramaController {
  private container: HTMLElement;
  private layers: LayerBase[] = [];
  private isInitialized: boolean = false;
  private mainCanvas: HTMLCanvasElement | null = null;
  private mainContext: CanvasRenderingContext2D | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.initialize();
  }

  // ==================================
  // Private Methods
  // ==================================

  /**
   * Initialize the diorama controller and set up the container.
   */
  private initialize(): void {
    // Ensure the container has relative positioning for proper layer stacking
    if (getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative';
    }

    // Set up container for canvas layering
    this.container.style.overflow = 'hidden';
    
    // Create the main canvas for all layers
    this.createMainCanvas();
    
    this.isInitialized = true;
  }


  /**
   * Create the main canvas for all layers.
   */
  private createMainCanvas(): void {
    this.mainCanvas = CanvasFactory.createMainCanvas(this.container);
    this.mainContext = this.mainCanvas.getContext('2d');
    
    if (!this.mainContext) {
      throw new Error('Failed to get 2D context from main canvas');
    }
    
    // Add the main canvas to the container
    this.container.appendChild(this.mainCanvas);
  }

  /**
   * Sort layers by z-index for proper rendering order (lowest z-index first).
   * For single canvas rendering, layers are rendered back to front.
   * @returns Sorted array of layers
   */
  private getSortedLayers(): LayerBase[] {
    return [...this.layers].sort((a, b) => a.zIndex - b.zIndex);
  }

  /**
   * Clear the main canvas.
   */
  private clearCanvas(): void {
    if (this.mainCanvas && this.mainContext) {
      this.mainContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    }
  }

  /**
   * Render all layers to the main canvas in z-index order.
   */
  private renderAllLayers(): void {
    if (!this.mainContext) {
      console.error('DioramaController: No main canvas context available');
      return;
    }

    // Clear the canvas before rendering
    this.clearCanvas();

    // Render all layers in z-index order (back to front)
    const sortedLayers = this.getSortedLayers();
    
    for (const layer of sortedLayers) {
      layer.render(this.mainContext, sortedLayers);
    }
  }

  // ==================================
  // Public Methods
  // ==================================

  /**
   * Add a layer to the diorama.
   * @param layer - The layer to add
   * @returns Promise that resolves when the layer is added and loaded
   */
  public async addLayer(layer: LayerBase): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('DioramaController is not initialized');
    }

    // Add to layers array
    this.layers.push(layer);

    // Load the layer
    try {
      await layer.load();
    } catch (error) {
      console.error(`Failed to load layer at z-index ${layer.zIndex}:`, error);
      // Remove the layer if loading failed
      this.removeLayer(layer);
      throw error;
    }
  }

  /**
   * Remove a layer from the diorama.
   * @param layer - The layer to remove
   */
  public removeLayer(layer: LayerBase): void {
    const index = this.layers.indexOf(layer);
    if (index > -1) {
      this.layers.splice(index, 1);
    }
  }

  /**
   * Get all layers in the diorama.
   * @returns Array of all layers
   */
  public getLayers(): LayerBase[] {
    return [...this.layers];
  }

  /**
   * Get a layer by its z-index.
   * @param zIndex - The z-index to search for
   * @returns The layer with the specified z-index, or undefined if not found
   */
  public getLayerByZIndex(zIndex: number): LayerBase | undefined {
    return this.layers.find(layer => layer.zIndex === zIndex);
  }

  /**
   * Render all layers to the main canvas in z-index order.
   * Layers are rendered back to front (lowest z-index first).
   */
  public render(): void {
    this.renderAllLayers();
  }

  /**
   * Resize the main canvas to match the container size.
   * Call this when the container size changes.
   */
  public resize(): void {
    if (this.mainCanvas) {
      CanvasFactory.resizeCanvas(this.mainCanvas, this.container);
    }

    // Re-render after resize
    this.render();
  }

  /**
   * Clear all layers from the diorama.
   */
  public clear(): void {
    // Clear layers array
    this.layers = [];
    
    // Clear the main canvas
    this.clearCanvas();
  }

  /**
   * Get the container element.
   * @returns The container element
   */
  public getContainer(): HTMLElement {
    return this.container;
  }

  /**
   * Check if the diorama controller is initialized.
   * @returns True if initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get the main canvas element.
   * @returns The main canvas element, or null if not initialized
   */
  public getMainCanvas(): HTMLCanvasElement | null {
    return this.mainCanvas;
  }

}
