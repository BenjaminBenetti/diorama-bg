import { vec3, mat4 } from "gl-matrix";
import { LayerBase } from "./model/layer-base.ts";

/**
 * Information about a layer's depth in 3D space.
 * This interface is re-exported from layer-3d-utils.ts for convenience.
 */
export interface LayerDepthInfo {
  /** The layer being analyzed */
  layer: LayerBase;
  /** The layer's z-position in 3D space */
  depth: number;
  /** Distance from the camera to this layer */
  distanceFromCamera: number;
}

/**
 * 3D bounding box for layers using vec3 pairs.
 */
export interface LayerBounds3D {
  /** Minimum coordinates (bottom-left-back corner) */
  min: vec3;
  /** Maximum coordinates (top-right-front corner) */
  max: vec3;
}

/**
 * Extended layer bounds with additional metadata.
 */
export interface LayerBoundsExtended {
  /** Basic min/max bounds */
  bounds: LayerBounds3D;
  /** Center point of the bounding box */
  center: vec3;
  /** Size (max - min) */
  size: vec3;
  /** Whether the bounds are valid */
  isValid: boolean;
}

/**
 * Layer rendering context for 3D operations.
 */
export interface Layer3DRenderContext {
  /** The layer being rendered */
  layer: LayerBase;
  /** Model-View-Projection matrix for this layer */
  mvpMatrix: mat4;
  /** Layer-specific model matrix */
  modelMatrix: mat4;
  /** Perspective scale factor */
  perspectiveScale: number;
  /** Whether the layer is visible (not culled) */
  isVisible: boolean;
}

/**
 * Layer transformation state for 3D rendering.
 */
export interface LayerTransformState {
  /** Layer's position in 3D space */
  position: vec3;
  /** Layer's rotation in 3D space */
  rotation: vec3;
  /** Layer's scale factors */
  scale: vec3;
  /** z-index for layer ordering */
  zIndex: number;
  /** z-position for 3D depth */
  zPosition: number;
  /** Whether transformations have changed */
  isDirty: boolean;
}

/**
 * Layer vertex information for 3D rendering.
 */
export interface LayerVertexInfo {
  /** The layer these vertices belong to */
  layer: LayerBase;
  /** Original 3D vertices */
  vertices3D: vec3[];
  /** Projected 2D screen coordinates */
  vertices2D: { x: number; y: number }[];
  /** Whether all vertices are visible */
  allVisible: boolean;
  /** Number of vertices within screen bounds */
  visibleCount: number;
}

/**
 * Layer depth sorting information.
 */
export interface LayerDepthSorting {
  /** Array of layers sorted by depth */
  sortedLayers: LayerBase[];
  /** Depth information for each layer */
  depthInfo: LayerDepthInfo[];
  /** Camera position used for sorting */
  cameraPosition: vec3;
  /** Whether sorting order changed from previous frame */
  orderChanged: boolean;
}

/**
 * Layer culling information for performance optimization.
 */
export interface LayerCullingInfo {
  /** The layer being evaluated */
  layer: LayerBase;
  /** Whether the layer is completely outside view */
  isOutsideView: boolean;
  /** Whether the layer is behind the camera */
  isBehindCamera: boolean;
  /** Whether the layer is too small to be visible */
  isTooSmall: boolean;
  /** Reason for culling (if culled) */
  cullingReason?: string;
}

/**
 * Layer animation state for 3D effects.
 */
export interface LayerAnimation3D {
  /** Target z-position */
  targetZPosition: number;
  /** Current animation progress (0-1) */
  progress: number;
  /** Animation duration in milliseconds */
  duration: number;
  /** Animation start time */
  startTime: number;
  /** Whether animation is active */
  isActive: boolean;
  /** Easing function type */
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Layer interaction data for 3D picking/selection.
 */
export interface LayerInteraction3D {
  /** The layer that was interacted with */
  layer: LayerBase;
  /** 3D world position of interaction */
  worldPosition: vec3;
  /** 2D screen position of interaction */
  screenPosition: { x: number; y: number };
  /** Distance from camera to interaction point */
  distance: number;
  /** Whether this layer was the closest to the interaction point */
  isClosest: boolean;
}

/**
 * Configuration for layer 3D effects.
 */
export interface Layer3DConfig {
  /** Whether 3D effects are enabled for this layer */
  enabled: boolean;
  /** Custom z-position override */
  customZPosition?: number;
  /** Perspective scaling factor (0 = no scaling, 1 = full scaling) */
  perspectiveStrength: number;
  /** Whether this layer should cast shadows */
  castsShadows: boolean;
  /** Whether this layer should receive shadows */
  receivesShadows: boolean;
  /** Custom transformation matrix override */
  customTransform?: mat4;
}

/**
 * Performance metrics for layer 3D rendering.
 */
export interface Layer3DPerformance {
  /** Number of layers rendered */
  layersRendered: number;
  /** Number of layers culled */
  layersCulled: number;
  /** Time spent on 3D calculations (ms) */
  transformTime: number;
  /** Time spent on projection (ms) */
  projectionTime: number;
  /** Time spent on actual rendering (ms) */
  renderTime: number;
  /** Total frame time (ms) */
  totalTime: number;
  /** Frames per second */
  fps: number;
}