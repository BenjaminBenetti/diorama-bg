// Transform module exports

// Core 3D transformation classes
export { Transform3D } from "./transform-3d.ts";
export { PerspectiveProjection } from "./perspective-projection.ts";

// Type definitions
export type {
  PerspectiveSettings,
  Point2D,
  Transform3DParams,
  CameraConfig,
  Render3DConfig,
  ProjectionResult,
  Bounds3D,
  MatrixComponents,
  Animation3DState
} from "./types.ts";

// Re-export gl-matrix types for convenience
export { vec2, vec3, mat4 } from "./types.ts";

// Helper functions
export {
  degreesToRadians,
  radiansToDegrees,
  createRotationFromDegrees
} from "./transform-3d.ts";