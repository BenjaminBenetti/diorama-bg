import { mat4, vec3, quat } from "gl-matrix";

/**
 * Core 3D transformation class using gl-matrix for mathematical operations.
 * Handles rotation, translation, scale, and matrix calculations for 3D transformations.
 */
export class Transform3D {
  public rotation: vec3;
  public translation: vec3;
  public scale: vec3;

  private _modelMatrix: mat4;
  private _viewMatrix: mat4;
  private _projectionMatrix: mat4;
  private _isDirty: boolean = true;

  constructor(
    rotation: vec3 = vec3.create(),
    translation: vec3 = vec3.create(),
    scale: vec3 = vec3.fromValues(1, 1, 1)
  ) {
    this.rotation = vec3.clone(rotation);
    this.translation = vec3.clone(translation);
    this.scale = vec3.clone(scale);
    
    this._modelMatrix = mat4.create();
    this._viewMatrix = mat4.create();
    this._projectionMatrix = mat4.create();
    
    this.updateMatrices();
  }

  /**
   * Set rotation using Euler angles in radians.
   * @param x - Rotation around X-axis (pitch)
   * @param y - Rotation around Y-axis (yaw)
   * @param z - Rotation around Z-axis (roll)
   */
  public setRotation(x: number, y: number, z: number): void {
    vec3.set(this.rotation, x, y, z);
    this.markDirty();
  }

  /**
   * Set rotation using a vec3.
   * @param rotation - Rotation vector in radians
   */
  public setRotationVec3(rotation: vec3): void {
    vec3.copy(this.rotation, rotation);
    this.markDirty();
  }

  /**
   * Set translation position.
   * @param x - X position
   * @param y - Y position
   * @param z - Z position
   */
  public setTranslation(x: number, y: number, z: number): void {
    vec3.set(this.translation, x, y, z);
    this.markDirty();
  }

  /**
   * Set translation using a vec3.
   * @param translation - Translation vector
   */
  public setTranslationVec3(translation: vec3): void {
    vec3.copy(this.translation, translation);
    this.markDirty();
  }

  /**
   * Set scale factors.
   * @param x - X scale
   * @param y - Y scale
   * @param z - Z scale
   */
  public setScale(x: number, y: number, z: number): void {
    vec3.set(this.scale, x, y, z);
    this.markDirty();
  }

  /**
   * Set scale using a vec3.
   * @param scale - Scale vector
   */
  public setScaleVec3(scale: vec3): void {
    vec3.copy(this.scale, scale);
    this.markDirty();
  }

  /**
   * Get the model matrix (local to world transformation).
   * @returns The model matrix
   */
  public getModelMatrix(): mat4 {
    if (this._isDirty) {
      this.updateMatrices();
    }
    return this._modelMatrix;
  }

  /**
   * Get the view matrix (world to camera transformation).
   * @param cameraPosition - Camera position in world space
   * @param cameraTarget - Camera target (look-at point)
   * @param up - Up vector (typically [0, 1, 0])
   * @returns The view matrix
   */
  public getViewMatrix(
    cameraPosition: vec3 = vec3.fromValues(0, 0, 5),
    cameraTarget: vec3 = vec3.fromValues(0, 0, 0),
    up: vec3 = vec3.fromValues(0, 1, 0)
  ): mat4 {
    mat4.lookAt(this._viewMatrix, cameraPosition, cameraTarget, up);
    return this._viewMatrix;
  }

  /**
   * Get the projection matrix (camera to screen transformation).
   * @param fov - Field of view in radians
   * @param aspect - Aspect ratio (width/height)
   * @param near - Near clipping plane
   * @param far - Far clipping plane
   * @returns The projection matrix
   */
  public getProjectionMatrix(
    fov: number = Math.PI / 4,
    aspect: number = 1,
    near: number = 0.1,
    far: number = 100
  ): mat4 {
    mat4.perspective(this._projectionMatrix, fov, aspect, near, far);
    return this._projectionMatrix;
  }

  /**
   * Get the combined Model-View-Projection matrix.
   * @param cameraPosition - Camera position
   * @param cameraTarget - Camera target
   * @param up - Up vector
   * @param fov - Field of view
   * @param aspect - Aspect ratio
   * @param near - Near plane
   * @param far - Far plane
   * @returns The MVP matrix
   */
  public getMVPMatrix(
    cameraPosition?: vec3,
    cameraTarget?: vec3,
    up?: vec3,
    fov?: number,
    aspect?: number,
    near?: number,
    far?: number
  ): mat4 {
    const modelMatrix = this.getModelMatrix();
    const viewMatrix = this.getViewMatrix(cameraPosition, cameraTarget, up);
    const projectionMatrix = this.getProjectionMatrix(fov, aspect, near, far);

    const mvpMatrix = mat4.create();
    mat4.multiply(mvpMatrix, viewMatrix, modelMatrix);
    mat4.multiply(mvpMatrix, projectionMatrix, mvpMatrix);

    return mvpMatrix;
  }

  /**
   * Mark the transformation as dirty, requiring matrix recalculation.
   */
  private markDirty(): void {
    this._isDirty = true;
  }

  /**
   * Update the internal matrices based on current transformation values.
   */
  private updateMatrices(): void {
    // Reset model matrix to identity
    mat4.identity(this._modelMatrix);

    // Apply transformations in the order: Scale -> Rotate -> Translate
    mat4.scale(this._modelMatrix, this._modelMatrix, this.scale);

    // Create rotation quaternion from Euler angles (convert radians to degrees for quat.fromEuler)
    const rotationQuat = quat.create();
    quat.fromEuler(rotationQuat, this.rotation[0] * (180 / Math.PI), this.rotation[1] * (180 / Math.PI), this.rotation[2] * (180 / Math.PI));
    
    // Apply rotation
    const rotationMatrix = mat4.create();
    mat4.fromQuat(rotationMatrix, rotationQuat);
    mat4.multiply(this._modelMatrix, this._modelMatrix, rotationMatrix);

    // Apply translation
    mat4.translate(this._modelMatrix, this._modelMatrix, this.translation);

    this._isDirty = false;
  }

  /**
   * Clone this transformation.
   * @returns A new Transform3D instance with the same values
   */
  public clone(): Transform3D {
    return new Transform3D(
      vec3.clone(this.rotation),
      vec3.clone(this.translation),
      vec3.clone(this.scale)
    );
  }
}

/**
 * Convert degrees to radians.
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees.
 * @param radians - Angle in radians
 * @returns Angle in degrees
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Create a rotation vector from Euler angles in degrees.
 * @param x - X rotation in degrees
 * @param y - Y rotation in degrees
 * @param z - Z rotation in degrees
 * @returns Rotation vector in radians
 */
export function createRotationFromDegrees(x: number, y: number, z: number): vec3 {
  return vec3.fromValues(
    degreesToRadians(x),
    degreesToRadians(y),
    degreesToRadians(z)
  );
}