
export abstract class  LayerBase {

  // the position in the layer stack. 0 is the top layer.
  public zIndex: number;
  // the canvas element for this layer. ALL layers render on canvases, even simple images.
  public canvas?: HTMLCanvasElement;

  // ==================================
  // Public Methods
  // ==================================

  constructor( zIndex: number) {
    this.zIndex = zIndex;
  }

  public abstract load(): Promise<void>;

  /**
   * Assign a canvas to this layer. This is called by the DioramaController when the layer is added.
   * @param canvas - The canvas element to assign to this layer
   */
  public assignCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  /**
   * Render the layer to its canvas. NOTE. Layers are rendered back to front. So the layer with the highest zIndex will be rendered first.
   * This means canvas pixel data will be available from layers with a lower zIndex.
   * @param layerStack - The stack of all layers. This is provided to allow layers to interact with each other.
   */
  public abstract render(layerStack: LayerBase[]): void;
}