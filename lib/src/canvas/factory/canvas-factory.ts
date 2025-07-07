/**
 * Factory for creating and configuring HTML5 Canvas elements for diorama.
 * Handles all canvas creation, sizing, and styling logic.
 */
export class CanvasFactory {

  // ==================================
  // Public Methods
  // ==================================

  /**
   * Create the main canvas element for the diorama.
   * @param container - The container element to size the canvas against
   * @returns A fully configured main canvas element
   */
  public static createMainCanvas(container: HTMLElement): HTMLCanvasElement {
    this.validateContainer(container);
    
    const canvas = document.createElement('canvas');
    
    // Set canvas dimensions
    this.setCanvasDimensions(canvas, container);
    
    // Apply main canvas styling (no z-index needed for single canvas)
    this.applyMainCanvasStyling(canvas);
    
    return canvas;
  }

  /**
   * Create an offscreen canvas for complex layer rendering.
   * @param width - The width of the offscreen canvas
   * @param height - The height of the offscreen canvas
   * @returns An offscreen canvas element
   */
  public static createOffscreenCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
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
   * Apply styling to the main canvas for proper positioning.
   * @param canvas - The canvas to style
   */
  private static applyMainCanvasStyling(canvas: HTMLCanvasElement): void {
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
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
   * @param customStyles - Additional CSS styles to apply
   * @returns Configured canvas element
   */
  public static createCustomCanvas(
    container: HTMLElement, 
    customStyles: Partial<CSSStyleDeclaration> = {}
  ): HTMLCanvasElement {
    this.validateContainer(container);
    
    const canvas = this.createMainCanvas(container);
    
    // Apply custom styles
    Object.assign(canvas.style, customStyles);
    
    return canvas;
  }
}
