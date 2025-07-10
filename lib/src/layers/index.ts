// Layer module exports

// Layer base classes and implementations
export { LayerBase } from "./model/layer-base.ts";
export { ImageLayer } from "./model/image-layer.ts";

// Layer utilities
export * from "./utils/index.ts";

// 3D layer type definitions
export type {
  LayerDepthInfo,
  LayerBounds3D,
  LayerBoundsExtended,
  Layer3DRenderContext,
  LayerTransformState,
  LayerVertexInfo,
  LayerDepthSorting,
  LayerCullingInfo,
  LayerAnimation3D,
  LayerInteraction3D,
  Layer3DConfig,
  Layer3DPerformance
} from "./types-3d.ts";