import { vec2, vec3, mat4 } from "gl-matrix";

/**
 * Re-export commonly used gl-matrix types for convenience.
 */
export { vec2, vec3, mat4 };

/**
 * Settings for perspective projection configuration.
 * This interface is re-exported from perspective-projection.ts for convenience.
 */
export interface PerspectiveSettings {
  /** Field of view in radians */
  fov: number;
  /** Aspect ratio (width/height) */
  aspect: number;
  /** Near clipping plane distance */
  near: number;
  /** Far clipping plane distance */
  far: number;
}

/**
 * Represents a 2D point in screen space.
 * This interface is re-exported from perspective-projection.ts for convenience.
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * 3D transformation parameters for objects in space.
 */
export interface Transform3DParams {
  /** Position in 3D space */
  position: vec3;
  /** Rotation in radians (Euler angles) */
  rotation: vec3;
  /** Scale factors for each axis */
  scale: vec3;
}

/**
 * Camera configuration for 3D rendering.
 */
export interface CameraConfig {
  /** Camera position in world space */
  position: vec3;
  /** Point the camera is looking at */
  target: vec3;
  /** Up vector (typically [0, 1, 0]) */
  up: vec3;
}

/**
 * Complete 3D rendering configuration.
 */
export interface Render3DConfig {
  /** Global transformation for all layers */
  globalTransform: Transform3DParams;
  /** Camera configuration */
  camera: CameraConfig;
  /** Perspective projection settings */
  perspective: PerspectiveSettings;
  /** Whether 3D effects are enabled */
  enabled: boolean;
}

/**
 * Result of a 3D to 2D projection operation.
 */
export interface ProjectionResult {
  /** Projected 2D point, null if behind camera */
  point: Point2D | null;
  /** Distance from camera (for depth sorting) */
  depth: number;
  /** Whether the point is within the view frustum */
  inBounds: boolean;
}

/**
 * Bounding box in 3D space.
 */
export interface Bounds3D {
  /** Minimum coordinates */
  min: vec3;
  /** Maximum coordinates */
  max: vec3;
  /** Center point */
  center: vec3;
  /** Size (max - min) */
  size: vec3;
}

/**
 * 3D transformation matrix components.
 */
export interface MatrixComponents {
  /** Model matrix (local to world) */
  model: mat4;
  /** View matrix (world to camera) */
  view: mat4;
  /** Projection matrix (camera to screen) */
  projection: mat4;
  /** Combined Model-View-Projection matrix */
  mvp: mat4;
}

/**
 * Animation state for 3D transformations.
 */
export interface Animation3DState {
  /** Current rotation values */
  rotation: vec3;
  /** Target rotation values */
  targetRotation: vec3;
  /** Animation speed (radians per second) */
  speed: number;
  /** Whether animation is active */
  active: boolean;
  /** Animation start time */
  startTime: number;
  /** Animation duration in milliseconds */
  duration: number;
}