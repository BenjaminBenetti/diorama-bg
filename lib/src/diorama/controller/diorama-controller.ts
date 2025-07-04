import { LayerBase } from "../../layers/model/layer-base.ts";
import { CanvasFactory } from "../../canvas/factory/canvas-factory.ts";

/**
 * Main controller class for managing diorama backgrounds.
 * Handles layer creation, management, and rendering coordination.
 */
export class DioramaController {
  private container: HTMLElement;
  private layers: LayerBase[] = [];
  private isInitialized: boolean = false;

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
    
    this.isInitialized = true;
  }


  /**
   * Add a canvas to the container in the correct z-order.
   * @param canvas - The canvas to add
   */
  private addCanvasToContainer(canvas: HTMLCanvasElement): void {
    // Find the correct position to insert the canvas based on z-index
    const existingCanvases = Array.from(this.container.querySelectorAll('canvas'));
    const canvasZIndex = parseInt(canvas.style.zIndex);
    
    let insertBefore: HTMLCanvasElement | null = null;
    for (const existingCanvas of existingCanvases) {
      const existingZIndex = parseInt(existingCanvas.style.zIndex);
      if (existingZIndex > canvasZIndex) {
        insertBefore = existingCanvas;
        break;
      }
    }
    
    if (insertBefore) {
      this.container.insertBefore(canvas, insertBefore);
    } else {
      this.container.appendChild(canvas);
    }
  }

  /**
   * Sort layers by z-index for proper rendering order (highest z-index first).
   * @returns Sorted array of layers
   */
  private getSortedLayers(): LayerBase[] {
    return [...this.layers].sort((a, b) => b.zIndex - a.zIndex);
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

    // Create canvas for the layer
    const canvas = CanvasFactory.createLayerCanvas(this.container, layer.zIndex);

    // Assign canvas to the layer
    layer.assignCanvas(canvas);

    // Add to layers array
    this.layers.push(layer);

    // Add canvas to container
    this.addCanvasToContainer(canvas);

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

      // Remove canvas from container
      if (layer.canvas && layer.canvas.parentNode === this.container) {
        this.container.removeChild(layer.canvas);
      }
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
   * Render all layers in the correct order.
   * Layers are rendered back to front (highest z-index first).
   */
  public render(): void {
    const sortedLayers = this.getSortedLayers();
    
    for (const layer of sortedLayers) {
      layer.render(sortedLayers);
    }
  }

  /**
   * Resize all canvases to match the container size.
   * Call this when the container size changes.
   */
  public resize(): void {
    for (const layer of this.layers) {
      if (layer.canvas) {
        CanvasFactory.resizeCanvas(layer.canvas, this.container);
      }
    }

    // Re-render after resize
    this.render();
  }

  /**
   * Clear all layers from the diorama.
   */
  public clear(): void {
    // Remove all canvases from container
    for (const layer of this.layers) {
      if (layer.canvas && layer.canvas.parentNode === this.container) {
        this.container.removeChild(layer.canvas);
      }
    }

    // Clear layers array
    this.layers = [];
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
}
