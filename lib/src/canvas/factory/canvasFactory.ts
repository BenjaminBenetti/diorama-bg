/**
 * Factory for creating and configuring HTML5 Canvas elements for diorama layers.
 * Handles all canvas creation, sizing, and styling logic.
 */
export class CanvasFactory {

  // ==================================
  // Public Methods
  // ==================================

  /**
   * Create a canvas element configured for use in a diorama layer.
   * @param container - The container element to size the canvas against
   * @param zIndex - The z-index for proper layer stacking
   * @returns A fully configured canvas element
   */
  public static createLayerCanvas(container: HTMLElement, zIndex: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    
    // Set canvas dimensions
    this.setCanvasDimensions(canvas, container);
    
    // Apply layer styling
    this.applyLayerStyling(canvas, zIndex);
    
    return canvas;
  }

  /**
   * Resize a canvas to match its container dimensions.
   * @param canvas - The canvas to resize
   * @param container - The container to match dimensions against
   */
  public static resizeCanvas(canvas: HTMLCanvasElement, container: HTMLElement): void {
    this.setCanvasDimensions(canvas, container);
  }

  /**
   * Create multiple canvases for a set of z-indices.
   * @param container - The container element to size canvases against
   * @param zIndices - Array of z-index values
   * @returns Array of configured canvas elements
   */
  public static createMultipleCanvases(container: HTMLElement, zIndices: number[]): HTMLCanvasElement[] {
    return zIndices.map(zIndex => this.createLayerCanvas(container, zIndex));
  }

  // ==================================
  // Private Methods
  // ==================================

  /**
   * Set the dimensions of a canvas based on its container.
   * @param canvas - The canvas to size
   * @param container - The container to match dimensions against
   */
  private static setCanvasDimensions(canvas: HTMLCanvasElement, container: HTMLElement): void {
    const containerRect = container.getBoundingClientRect();
    canvas.width = containerRect.width || 800;
    canvas.height = containerRect.height || 600;
  }

  /**
   * Apply styling to a canvas for proper layer positioning and stacking.
   * @param canvas - The canvas to style
   * @param zIndex - The z-index for layer stacking
   */
  private static applyLayerStyling(canvas: HTMLCanvasElement, zIndex: number): void {
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = zIndex.toString();
    canvas.style.pointerEvents = 'none'; // Allow interaction with elements behind
  }



  /**
   * Validate that a container element is suitable for canvas creation.
   * @param container - The container to validate
   * @throws Error if container is invalid
   */
  public static validateContainer(container: HTMLElement): void {
    if (!container) {
      throw new Error('Container element is required for canvas creation');
    }

    // Check if HTMLElement is available (not in test environment)
    if (typeof HTMLElement !== 'undefined' && !(container instanceof HTMLElement)) {
      throw new Error('Container must be a valid HTMLElement');
    }
  }

  /**
   * Create a canvas with custom styling options.
   * @param container - The container element
   * @param zIndex - The z-index for stacking
   * @param customStyles - Additional CSS styles to apply
   * @returns Configured canvas element
   */
  public static createCustomCanvas(
    container: HTMLElement, 
    zIndex: number, 
    customStyles: Partial<CSSStyleDeclaration> = {}
  ): HTMLCanvasElement {
    this.validateContainer(container);
    
    const canvas = this.createLayerCanvas(container, zIndex);
    
    // Apply custom styles
    Object.assign(canvas.style, customStyles);
    
    return canvas;
  }
}
