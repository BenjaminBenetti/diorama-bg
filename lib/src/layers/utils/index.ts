// Layer utilities exports

// 3D layer utility functions
export {
  calculateLayerDepth,
  sortLayersByDepth,
  getLayerDepthInfo,
  calculateDistanceFromCamera,
  calculatePerspectiveScale,
  clipLayerToBounds,
  isLayerOutsideBounds,
  autoSetLayerDepths,
  createStagingEffect,
  calculateOptimalPerspective
} from "./layer-3d-utils.ts";

// Type definitions for layer utilities
export type {
  LayerDepthInfo
} from "./layer-3d-utils.ts";