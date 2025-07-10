
import { mat4, vec3 } from "gl-matrix";
import { Transform3D } from "../../transforms/transform-3d.ts";

export abstract class  LayerBase {

  // the position in the layer stack. 0 is the top layer.
  public zIndex: number;
  // position in 3D space (depth for perspective effects)
  public zPosition: number;
  // 3D transformation properties
  public transform3D: Transform3D;
  // optional offscreen canvas for complex rendering
  public offscreenCanvas?: HTMLCanvasElement;
  // flag to indicate if this layer needs offscreen canvas support
  public needsOffscreenCanvas: boolean = false;

  // ==================================
  // Public Methods
  // ==================================

  constructor( zIndex: number, zPosition: number = 0) {
    this.zIndex = zIndex;
    this.zPosition = zPosition;
    this.transform3D = new Transform3D();
  }

  public abstract load(): Promise<void>;

  /**
   * Render the layer to the provided canvas context.
   * Layers are rendered back to front (lowest z-index first).
   * This means canvas pixel data will be available from layers with a lower zIndex.
   * @param ctx - The main canvas context to render to
   * @param layerStack - The stack of all layers. This is provided to allow layers to interact with each other.
   * @param mvpMatrix - Optional Model-View-Projection matrix for 3D transformations
   */
  public abstract render(ctx: CanvasRenderingContext2D, layerStack: LayerBase[], mvpMatrix?: mat4): void;

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

  /**
   * Get the 3D vertices that define this layer's corners in 3D space.
   * These vertices are used for 3D transformations and perspective projection.
   * @returns Array of 3D vertices representing layer corners
   */
  public abstract get3DVertices(): vec3[];

  /**
   * Get the 3D bounding box of this layer.
   * @returns Object with min and max 3D coordinates
   */
  public getBounds3D(): { min: vec3; max: vec3 } {
    const vertices = this.get3DVertices();
    
    if (vertices.length === 0) {
      return {
        min: vec3.fromValues(0, 0, this.zPosition),
        max: vec3.fromValues(0, 0, this.zPosition)
      };
    }

    const min = vec3.clone(vertices[0]);
    const max = vec3.clone(vertices[0]);

    for (const vertex of vertices) {
      vec3.min(min, min, vertex);
      vec3.max(max, max, vertex);
    }

    return { min, max };
  }

  /**
   * Set the 3D position (depth) of this layer.
   * @param zPosition - Z position in 3D space
   */
  public setZPosition(zPosition: number): void {
    this.zPosition = zPosition;
  }

  /**
   * Get the 3D position (depth) of this layer.
   * @returns Z position in 3D space
   */
  public getZPosition(): number {
    return this.zPosition;
  }

  /**
   * Apply layer-specific 3D transformation based on zPosition.
   * This method updates the transform3D properties based on the layer's depth.
   */
  public updateTransform3D(): void {
    // Set the translation Z to match the layer's z position
    this.transform3D.setTranslation(0, 0, this.zPosition);
  }
}