import { LayerBase } from "./layer-base.ts";

/**
 * A simple image layer that renders a static image to its canvas.
 * This is the most basic layer type for displaying background images in a diorama.
 */
export class ImageLayer extends LayerBase {
  private imageUrl: string;
  private image: HTMLImageElement | null = null;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;

  constructor(imageUrl: string, zIndex: number) {
    super(zIndex);
    this.imageUrl = imageUrl;
  }

  // ==================================
  // Private Methods
  // ==================================

  /**
   * Load the image asynchronously if not already loaded or loading.
   * @returns Promise that resolves when the image is loaded
   */
  private loadImage(): Promise<void> {
    if (this.isLoaded || this.isLoading) {
      return Promise.resolve();
    }

    this.isLoading = true;

    return new Promise((resolve, reject) => {
      this.image = new Image();

      this.image.onload = () => {
        this.isLoaded = true;
        this.isLoading = false;
        resolve();
      };

      this.image.onerror = () => {
        this.isLoading = false;
        reject(new Error(`Failed to load image: ${this.imageUrl}`));
      };

      this.image.src = this.imageUrl;
    });
  }

  // ==================================
  // Public Methods
  // ==================================

  /**
   * Load the image for this layer. This implements the abstract load method from LayerBase.
   * @returns Promise that resolves when the image is loaded
   */
  public async load(): Promise<void> {
    await this.loadImage();
  }

  /**
   * Render the image layer to the provided canvas context.
   * The image will be scaled to fit the canvas while maintaining aspect ratio.
   * @param ctx - The main canvas context to render to
   * @param _layerStack - The stack of all layers (not used for simple image rendering)
   */
  public render(ctx: CanvasRenderingContext2D, _layerStack: LayerBase[]): void {
    // Ensure the image is loaded before rendering
    if (!this.isLoaded) {
      // If image is not loaded, start loading it and skip this render cycle
      if (!this.isLoading) {
        this.loadImage().catch(error => {
          console.error(`ImageLayer: Failed to load image for layer ${this.zIndex}:`, error);
        });
      }
      return;
    }

    if (!this.image) {
      console.error(`ImageLayer: No image available for layer ${this.zIndex}`);
      return;
    }

    // Get canvas dimensions from the context
    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate scaling to fit the image while maintaining aspect ratio
    const canvasAspect = canvasWidth / canvasHeight;
    const imageAspect = this.image.width / this.image.height;

    let drawWidth: number;
    let drawHeight: number;
    let drawX: number;
    let drawY: number;

    if (imageAspect > canvasAspect) {
      // Image is wider than canvas - fit to width
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imageAspect;
      drawX = 0;
      drawY = (canvasHeight - drawHeight) / 2;
    } else {
      // Image is taller than canvas - fit to height
      drawWidth = canvasHeight * imageAspect;
      drawHeight = canvasHeight;
      drawX = (canvasWidth - drawWidth) / 2;
      drawY = 0;
    }

    // Draw the image to the provided context
    ctx.drawImage(this.image, drawX, drawY, drawWidth, drawHeight);
  }

  /**
   * Get the URL of the image being rendered by this layer.
   * @returns The image URL
   */
  public getImageUrl(): string {
    return this.imageUrl;
  }

  /**
   * Check if the image has been loaded.
   * @returns True if the image is loaded and ready to render
   */
  public isImageLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Preload the image. This can be called to start loading the image
   * before the first render call.
   * @returns Promise that resolves when the image is loaded
   */
  public async preloadImage(): Promise<void> {
    await this.loadImage();
  }

  /**
   * Update the image URL and reload the image.
   * @param newImageUrl - The new image URL to load
   */
  public async updateImage(newImageUrl: string): Promise<void> {
    this.imageUrl = newImageUrl;
    this.image = null;
    this.isLoaded = false;
    this.isLoading = false;

    await this.loadImage();
  }
}
