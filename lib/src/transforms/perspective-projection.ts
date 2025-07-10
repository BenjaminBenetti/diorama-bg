import { mat4, vec3, vec4 } from "gl-matrix";
import { LayerBase } from "../layers/model/layer-base.ts";

/**
 * Settings for perspective projection configuration.
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
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Handles 3D to 2D coordinate projection using perspective transformation.
 * Converts 3D world coordinates to 2D screen coordinates for Canvas 2D rendering.
 */
export class PerspectiveProjection {
  public settings: PerspectiveSettings;
  public screenWidth: number;
  public screenHeight: number;

  constructor(
    settings: PerspectiveSettings,
    screenWidth: number = 800,
    screenHeight: number = 600
  ) {
    this.settings = { ...settings };
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  /**
   * Update the screen dimensions for projection calculations.
   * @param width - Screen width in pixels
   * @param height - Screen height in pixels
   */
  public setScreenSize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
    this.settings.aspect = width / height;
  }

  /**
   * Update perspective settings.
   * @param settings - New perspective settings
   */
  public updateSettings(settings: Partial<PerspectiveSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Project a 3D point to 2D screen coordinates using the MVP matrix.
   * @param point3D - 3D point in world space
   * @param mvpMatrix - Model-View-Projection matrix
   * @returns 2D screen coordinates, or null if point is behind camera
   */
  public project3DTo2D(point3D: vec3, mvpMatrix: mat4): Point2D | null {
    // Convert vec3 to vec4 (homogeneous coordinates)
    const point4D = vec4.fromValues(point3D[0], point3D[1], point3D[2], 1.0);
    
    // Apply MVP transformation
    const projected = vec4.create();
    vec4.transformMat4(projected, point4D, mvpMatrix);

    // Perform perspective division
    if (projected[3] === 0) {
      return null; // Point at infinity
    }

    const ndcX = projected[0] / projected[3];
    const ndcY = projected[1] / projected[3];
    const ndcZ = projected[2] / projected[3];

    // Check if point is behind camera (negative Z in NDC)
    if (ndcZ < -1 || ndcZ > 1) {
      return null;
    }

    // Convert from NDC (-1 to 1) to screen coordinates (0 to screen size)
    const screenX = (ndcX + 1) * 0.5 * this.screenWidth;
    const screenY = (1 - ndcY) * 0.5 * this.screenHeight; // Flip Y for screen coordinates

    return {
      x: screenX,
      y: screenY
    };
  }

  /**
   * Project multiple 3D points to 2D screen coordinates.
   * @param points3D - Array of 3D points
   * @param mvpMatrix - Model-View-Projection matrix
   * @returns Array of 2D points (null entries for points behind camera)
   */
  public projectPoints3DTo2D(points3D: vec3[], mvpMatrix: mat4): (Point2D | null)[] {
    return points3D.map(point => this.project3DTo2D(point, mvpMatrix));
  }

  /**
   * Project a layer's 3D vertices to 2D screen coordinates.
   * This is a placeholder method that will be implemented once LayerBase is extended.
   * @param layer - The layer to project
   * @param mvpMatrix - Model-View-Projection matrix
   * @returns Array of 2D points representing layer corners
   */
  public projectLayerPoints(_layer: LayerBase, _mvpMatrix: mat4): (Point2D | null)[] {
    // This method will be implemented after LayerBase is extended with 3D support
    // For now, return empty array
    console.warn("PerspectiveProjection.projectLayerPoints: LayerBase not yet extended with 3D support");
    return [];
  }

  /**
   * Calculate perspective scale factor based on Z distance.
   * Closer objects appear larger, distant objects appear smaller.
   * @param z - Z coordinate in world space
   * @param perspectiveStrength - Strength of perspective effect (0 = no perspective, 1 = strong perspective)
   * @returns Scale factor (1 = normal size, <1 = smaller, >1 = larger)
   */
  public calculatePerspectiveScale(z: number, perspectiveStrength: number = 1.0): number {
    if (perspectiveStrength === 0) {
      return 1.0; // No perspective scaling
    }

    // Prevent division by zero or negative values
    const effectiveZ = Math.max(z, 0.1);
    
    // Calculate scale based on distance (inverse relationship)
    // Objects closer to camera (smaller z) get larger scale
    const baseDistance = 5.0; // Reference distance
    const scale = baseDistance / effectiveZ;
    
    // Blend between no perspective (scale = 1) and full perspective based on strength
    return 1.0 + (scale - 1.0) * perspectiveStrength;
  }

  /**
   * Check if a 2D point is within screen bounds.
   * @param point - 2D point to check
   * @param margin - Margin around screen edges (optional)
   * @returns True if point is within bounds
   */
  public isPointInBounds(point: Point2D, margin: number = 0): boolean {
    return point.x >= -margin &&
           point.x <= this.screenWidth + margin &&
           point.y >= -margin &&
           point.y <= this.screenHeight + margin;
  }

  /**
   * Clip an array of points to screen bounds.
   * @param points - Array of 2D points (null entries for points behind camera)
   * @param margin - Margin around screen edges
   * @returns Filtered array containing only points within bounds
   */
  public clipPointsToBounds(points: (Point2D | null)[], margin: number = 0): Point2D[] {
    return points
      .filter((point): point is Point2D => point !== null)
      .filter(point => this.isPointInBounds(point, margin));
  }

  /**
   * Calculate the 2D bounding box of projected points.
   * @param points - Array of 2D points
   * @returns Bounding box with min/max coordinates, or null if no valid points
   */
  public calculateBounds2D(points: (Point2D | null)[]): { min: Point2D; max: Point2D } | null {
    const validPoints = points.filter((point): point is Point2D => point !== null);
    
    if (validPoints.length === 0) {
      return null;
    }

    let minX = validPoints[0].x;
    let maxX = validPoints[0].x;
    let minY = validPoints[0].y;
    let maxY = validPoints[0].y;

    for (const point of validPoints) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    return {
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY }
    };
  }

  /**
   * Create default perspective settings suitable for diorama effects.
   * @param aspect - Screen aspect ratio
   * @returns Default perspective settings
   */
  public static createDefaultSettings(aspect: number = 1.0): PerspectiveSettings {
    return {
      fov: Math.PI / 4, // 45 degrees
      aspect: aspect,
      near: 0.1,
      far: 100
    };
  }

  /**
   * Create perspective settings with custom field of view.
   * @param fovDegrees - Field of view in degrees
   * @param aspect - Screen aspect ratio
   * @returns Perspective settings
   */
  public static createSettings(fovDegrees: number, aspect: number = 1.0): PerspectiveSettings {
    return {
      fov: fovDegrees * (Math.PI / 180), // Convert to radians
      aspect: aspect,
      near: 0.1,
      far: 100
    };
  }
}