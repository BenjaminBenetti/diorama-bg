import { LayerBase } from "../../layers/model/layer-base.ts";
import { CanvasFactory } from "../../canvas/factory/canvas-factory.ts";
import { vec3, mat4 } from "gl-matrix";
import { Transform3D } from "../../transforms/transform-3d.ts";
import { PerspectiveProjection, PerspectiveSettings } from "../../transforms/perspective-projection.ts";

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
  
  // 3D transformation properties
  private globalRotation: vec3;
  private perspectiveSettings: PerspectiveSettings;
  private cameraPosition: vec3;
  private transform3D: Transform3D;
  private perspectiveProjection: PerspectiveProjection;

  constructor(container: HTMLElement) {
    this.container = container;
    
    // Initialize 3D properties with defaults
    this.globalRotation = vec3.create();
    this.cameraPosition = vec3.fromValues(0, 0, 5);
    this.perspectiveSettings = PerspectiveProjection.createDefaultSettings();
    this.transform3D = new Transform3D();
    this.perspectiveProjection = new PerspectiveProjection(
      this.perspectiveSettings,
      container.clientWidth || 800,
      container.clientHeight || 600
    );
    
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
   * Sort layers by z-index for proper rendering order (highest z-index first).
   * For diorama effect, higher z-index = background layers (render first, appear behind).
   * Lower z-index = foreground layers (render last, appear in front).
   * @returns Sorted array of layers
   */
  private getSortedLayers(): LayerBase[] {
    return [...this.layers].sort((a, b) => b.zIndex - a.zIndex);
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

    // Calculate global MVP matrix if 3D is active
    let globalMVP: mat4 | undefined;
    if (this.is3DActive()) {
      globalMVP = this.calculateGlobalMVP();
    }

    // Render all layers in z-index order (back to front)
    const sortedLayers = this.getSortedLayers();
    
    for (const layer of sortedLayers) {
      this.renderLayerWith3D(layer, sortedLayers, globalMVP);
    }
  }

  /**
   * Calculate the global Model-View-Projection matrix.
   * @returns The global MVP matrix
   */
  private calculateGlobalMVP(): mat4 {
    if (!this.mainCanvas) {
      throw new Error('Main canvas not available for MVP calculation');
    }

    // Update perspective projection aspect ratio
    this.perspectiveSettings.aspect = this.mainCanvas.width / this.mainCanvas.height;
    this.perspectiveProjection.updateSettings(this.perspectiveSettings);

    // Get the global transformation MVP matrix
    return this.transform3D.getMVPMatrix(
      this.cameraPosition,
      vec3.fromValues(0, 0, 0), // Look at origin
      vec3.fromValues(0, 1, 0), // Up vector
      this.perspectiveSettings.fov,
      this.perspectiveSettings.aspect,
      this.perspectiveSettings.near,
      this.perspectiveSettings.far
    );
  }

  /**
   * Render a single layer with optional 3D transformations.
   * @param layer - The layer to render
   * @param layerStack - All layers for context
   * @param globalMVP - Optional global MVP matrix for 3D rendering
   */
  private renderLayerWith3D(layer: LayerBase, layerStack: LayerBase[], globalMVP?: mat4): void {
    if (!this.mainContext) {
      return;
    }

    // Save the current canvas state
    this.mainContext.save();

    try {
      if (globalMVP) {
        // 3D rendering path
        this.apply3DTransformToLayer(layer, globalMVP);
      }

      // Render the layer (layer will handle its own transformations if needed)
      layer.render(this.mainContext, layerStack, globalMVP);
    } catch (error) {
      console.error(`Error rendering layer at z-index ${layer.zIndex}:`, error);
    } finally {
      // Restore the canvas state
      this.mainContext.restore();
    }
  }

  /**
   * Apply 3D transformations to a layer for Canvas 2D rendering.
   * This simulates 3D rotation effects using 2D canvas transformations.
   * @param layer - The layer to transform
   * @param _globalMVP - The global MVP matrix (unused in this approach)
   */
  private apply3DTransformToLayer(layer: LayerBase, _globalMVP?: mat4): void {
    if (!this.mainContext || !this.mainCanvas) {
      return;
    }

    // Get canvas dimensions
    const canvasWidth = this.mainCanvas.width;
    const canvasHeight = this.mainCanvas.height;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Get rotation values
    const rotationX = this.globalRotation[0]; // X-axis rotation (pitch)
    const rotationY = this.globalRotation[1]; // Y-axis rotation (yaw)
    const rotationZ = this.globalRotation[2]; // Z-axis rotation (roll)

    // Calculate depth factor for perspective effects
    const depthFactor = layer.zPosition / 5.0; // Normalize depth

    // Move to center for rotation
    this.mainContext.translate(centerX, centerY);

    // Apply Z-axis rotation (this is straightforward 2D rotation)
    this.mainContext.rotate(rotationZ);

    // Apply Y-axis rotation (yaw) using horizontal scaling and skewing
    if (Math.abs(rotationY) > 0.001) {
      const yawCos = Math.cos(rotationY);
      const yawSin = Math.sin(rotationY);
      
      // Apply perspective transformation for Y-axis rotation
      // This creates the illusion of rotating around the Y axis
      const scaleX = Math.abs(yawCos); // Horizontal compression
      const skewY = yawSin * 0.3; // Vertical skew for perspective
      
      this.mainContext.scale(scaleX, 1);
      this.mainContext.transform(1, skewY, 0, 1, 0, 0); // Apply skew
      
      // Depth-based translation offset for parallax
      const parallaxY = yawSin * depthFactor * 30;
      this.mainContext.translate(parallaxY, 0);
    }

    // Apply X-axis rotation (pitch) using vertical scaling and skewing
    if (Math.abs(rotationX) > 0.001) {
      const pitchCos = Math.cos(rotationX);
      const pitchSin = Math.sin(rotationX);
      
      // Apply perspective transformation for X-axis rotation
      // This creates the illusion of rotating around the X axis
      const scaleY = Math.abs(pitchCos); // Vertical compression
      const skewX = pitchSin * 0.3; // Horizontal skew for perspective
      
      this.mainContext.scale(1, scaleY);
      this.mainContext.transform(1, 0, skewX, 1, 0, 0); // Apply skew
      
      // Depth-based translation offset for parallax
      const parallaxX = pitchSin * depthFactor * 30;
      this.mainContext.translate(0, parallaxX);
    }

    // Apply overall perspective scaling based on depth
    const perspectiveScale = 1.0 - (depthFactor * 0.1);
    const finalScale = Math.max(0.5, Math.min(1.2, perspectiveScale));
    this.mainContext.scale(finalScale, finalScale);

    // Move back from center
    this.mainContext.translate(-centerX, -centerY);
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
      
      // Update perspective projection screen size
      this.perspectiveProjection.setScreenSize(
        this.mainCanvas.width,
        this.mainCanvas.height
      );
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

  // ==================================
  // 3D Control Methods
  // ==================================

  /**
   * Set the global 3D rotation for all layers.
   * @param x - Rotation around X-axis in radians
   * @param y - Rotation around Y-axis in radians
   * @param z - Rotation around Z-axis in radians
   */
  public setRotation(x: number, y: number, z: number): void {
    vec3.set(this.globalRotation, x, y, z);
    this.transform3D.setRotation(x, y, z);
  }

  /**
   * Set the global 3D rotation using a vec3.
   * @param rotation - Rotation vector in radians
   */
  public setRotationVec3(rotation: vec3): void {
    vec3.copy(this.globalRotation, rotation);
    this.transform3D.setRotationVec3(rotation);
  }

  /**
   * Get the current global rotation.
   * @returns Current rotation as vec3 in radians
   */
  public getRotation(): vec3 {
    return vec3.clone(this.globalRotation);
  }

  /**
   * Set the perspective configuration.
   * @param settings - Perspective settings
   */
  public setPerspective(settings: PerspectiveSettings): void {
    this.perspectiveSettings = { ...settings };
    this.perspectiveProjection.updateSettings(settings);
  }

  /**
   * Get the current perspective settings.
   * @returns Current perspective settings
   */
  public getPerspectiveSettings(): PerspectiveSettings {
    return { ...this.perspectiveSettings };
  }

  /**
   * Set the virtual camera position.
   * @param position - Camera position in 3D space
   */
  public setCameraPosition(position: vec3): void {
    vec3.copy(this.cameraPosition, position);
  }

  /**
   * Set the virtual camera position using individual coordinates.
   * @param x - X position
   * @param y - Y position
   * @param z - Z position
   */
  public setCameraPositionXYZ(x: number, y: number, z: number): void {
    vec3.set(this.cameraPosition, x, y, z);
  }

  /**
   * Get the current camera position.
   * @returns Current camera position as vec3
   */
  public getCameraPosition(): vec3 {
    return vec3.clone(this.cameraPosition);
  }

  /**
   * Set perspective field of view in degrees.
   * @param fovDegrees - Field of view in degrees
   */
  public setFieldOfView(fovDegrees: number): void {
    this.perspectiveSettings.fov = fovDegrees * (Math.PI / 180);
    this.perspectiveProjection.updateSettings(this.perspectiveSettings);
  }

  /**
   * Get the current field of view in degrees.
   * @returns Field of view in degrees
   */
  public getFieldOfView(): number {
    return this.perspectiveSettings.fov * (180 / Math.PI);
  }

  /**
   * Enable or disable 3D perspective effects.
   * When disabled, layers render without perspective transformation.
   * @param enabled - Whether to enable 3D perspective
   */
  public set3DEnabled(enabled: boolean): void {
    if (!enabled) {
      // Reset rotations to zero for 2D mode
      vec3.set(this.globalRotation, 0, 0, 0);
      this.transform3D.setRotation(0, 0, 0);
    }
  }

  /**
   * Check if 3D effects are currently active.
   * @returns True if any rotation is applied
   */
  public is3DActive(): boolean {
    return vec3.length(this.globalRotation) > 0.001; // Small threshold for floating point comparison
  }

}
