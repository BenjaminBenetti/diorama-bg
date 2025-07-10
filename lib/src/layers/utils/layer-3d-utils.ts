import { vec3 } from "gl-matrix";
import { LayerBase } from "../model/layer-base.ts";

/**
 * Information about a layer's depth in 3D space.
 */
export interface LayerDepthInfo {
  layer: LayerBase;
  depth: number;
  distanceFromCamera: number;
}

/**
 * Convert a layer's z-index to 3D depth position.
 * Lower z-index values (rendered first) are placed further from the camera.
 * @param layer - The layer to calculate depth for
 * @param zIndexRange - The range of z-index values to map to depth
 * @param depthRange - The depth range to map to (default: 10 units)
 * @returns The calculated 3D depth position
 */
export function calculateLayerDepth(
  layer: LayerBase, 
  zIndexRange: number, 
  depthRange: number = 10
): number {
  if (zIndexRange <= 0) {
    return layer.zPosition; // Use existing zPosition if no range provided
  }

  // Map z-index to depth: lower z-index = further from camera (higher depth)
  // z-index 0 (front layer) maps to depth 0 (closest to camera)
  // Higher z-index maps to greater depth (further from camera)
  const normalizedZIndex = layer.zIndex / zIndexRange;
  const calculatedDepth = normalizedZIndex * depthRange;
  
  return calculatedDepth;
}

/**
 * Sort layers by their distance from the camera.
 * Layers further from camera are rendered first (back-to-front).
 * @param layers - Array of layers to sort
 * @param cameraPosition - Camera position in 3D space
 * @returns Sorted array of layers (furthest to closest)
 */
export function sortLayersByDepth(layers: LayerBase[], cameraPosition: vec3 = vec3.fromValues(0, 0, 5)): LayerBase[] {
  return [...layers].sort((a, b) => {
    const aDistance = calculateDistanceFromCamera(a, cameraPosition);
    const bDistance = calculateDistanceFromCamera(b, cameraPosition);
    
    // Sort by distance (furthest first for back-to-front rendering)
    return bDistance - aDistance;
  });
}

/**
 * Get detailed depth information for all layers.
 * @param layers - Array of layers to analyze
 * @param cameraPosition - Camera position in 3D space
 * @returns Array of layer depth information
 */
export function getLayerDepthInfo(layers: LayerBase[], cameraPosition: vec3 = vec3.fromValues(0, 0, 5)): LayerDepthInfo[] {
  return layers.map(layer => ({
    layer,
    depth: layer.zPosition,
    distanceFromCamera: calculateDistanceFromCamera(layer, cameraPosition)
  }));
}

/**
 * Calculate the distance from a layer to the camera.
 * @param layer - The layer to calculate distance for
 * @param cameraPosition - Camera position in 3D space
 * @returns Distance from camera to layer
 */
export function calculateDistanceFromCamera(layer: LayerBase, cameraPosition: vec3): number {
  // For now, we'll use a simple distance calculation based on z-position
  // This can be enhanced to use the actual 3D vertices in the future
  const layerPosition = vec3.fromValues(0, 0, layer.zPosition);
  return vec3.distance(cameraPosition, layerPosition);
}

/**
 * Calculate perspective scale factor based on distance from camera.
 * Objects closer to camera appear larger, distant objects appear smaller.
 * @param z - Z coordinate in world space (distance from camera)
 * @param perspectiveStrength - Strength of perspective effect (0 = no perspective, 1 = strong perspective)
 * @param referenceDistance - Reference distance for scale calculation (default: 5)
 * @returns Scale factor (1 = normal size, <1 = smaller, >1 = larger)
 */
export function calculatePerspectiveScale(
  z: number, 
  perspectiveStrength: number = 1.0, 
  referenceDistance: number = 5.0
): number {
  if (perspectiveStrength === 0) {
    return 1.0; // No perspective scaling
  }

  // Prevent division by zero or negative values
  const effectiveZ = Math.max(Math.abs(z), 0.1);
  
  // Calculate scale based on distance (inverse relationship)
  // Objects closer to camera (smaller z) get larger scale
  const scale = referenceDistance / effectiveZ;
  
  // Blend between no perspective (scale = 1) and full perspective based on strength
  return 1.0 + (scale - 1.0) * perspectiveStrength;
}

/**
 * Clip layer vertices to canvas bounds.
 * This is useful for culling layers that are completely outside the viewport.
 * @param vertices - Array of 3D vertices to clip
 * @param canvasBounds - Canvas bounds in screen coordinates
 * @param margin - Additional margin around bounds (optional)
 * @returns Filtered array of vertices within bounds
 */
export function clipLayerToBounds(
  vertices: vec3[], 
  canvasBounds: DOMRect, 
  margin: number = 0
): vec3[] {
  return vertices.filter(vertex => {
    // For now, we'll do a simple check on X and Y coordinates
    // This assumes the vertices are already projected to screen space
    const x = vertex[0];
    const y = vertex[1];
    
    return x >= canvasBounds.left - margin &&
           x <= canvasBounds.right + margin &&
           y >= canvasBounds.top - margin &&
           y <= canvasBounds.bottom + margin;
  });
}

/**
 * Check if a layer is completely outside the canvas bounds.
 * This can be used for layer culling to improve performance.
 * @param layer - The layer to check
 * @param canvasBounds - Canvas bounds in screen coordinates
 * @param margin - Additional margin around bounds (optional)
 * @returns True if layer is completely outside bounds
 */
export function isLayerOutsideBounds(
  layer: LayerBase, 
  canvasBounds: DOMRect, 
  margin: number = 50
): boolean {
  const vertices = layer.get3DVertices();
  const clippedVertices = clipLayerToBounds(vertices, canvasBounds, margin);
  
  // If no vertices remain after clipping, the layer is outside bounds
  return clippedVertices.length === 0;
}

/**
 * Automatically set layer z-positions based on their z-index.
 * This provides a default 3D staging based on layer ordering.
 * @param layers - Array of layers to update
 * @param depthSpacing - Space between layers in 3D (default: 1 unit)
 * @param startDepth - Starting depth for the front layer (default: 0)
 */
export function autoSetLayerDepths(
  layers: LayerBase[], 
  depthSpacing: number = 1.0, 
  startDepth: number = 0
): void {
  // Sort layers by z-index first
  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
  
  // Set z-positions with even spacing
  sortedLayers.forEach((layer, index) => {
    layer.setZPosition(startDepth + (index * depthSpacing));
  });
}

/**
 * Create a staging effect by distributing layers across depth.
 * This creates a more dramatic 3D effect with exponential depth distribution.
 * @param layers - Array of layers to stage
 * @param maxDepth - Maximum depth for the back layer (default: 20)
 * @param curve - Curve factor for depth distribution (1 = linear, >1 = exponential)
 */
export function createStagingEffect(
  layers: LayerBase[], 
  maxDepth: number = 20, 
  curve: number = 1.5
): void {
  // Sort layers by z-index
  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
  
  if (sortedLayers.length <= 1) {
    return; // Nothing to stage
  }
  
  // Apply exponential depth distribution
  sortedLayers.forEach((layer, index) => {
    const normalizedIndex = index / (sortedLayers.length - 1);
    const depth = Math.pow(normalizedIndex, curve) * maxDepth;
    layer.setZPosition(depth);
  });
}

/**
 * Calculate the optimal perspective settings for the given layers.
 * This analyzes layer distribution and suggests appropriate perspective configuration.
 * @param layers - Array of layers to analyze
 * @returns Suggested perspective settings
 */
export function calculateOptimalPerspective(layers: LayerBase[]): {
  suggestedFOV: number;
  suggestedCameraDistance: number;
  layerSpread: number;
} {
  if (layers.length === 0) {
    return {
      suggestedFOV: 45, // Default 45 degrees
      suggestedCameraDistance: 5,
      layerSpread: 0
    };
  }

  // Calculate layer depth range
  const depths = layers.map(layer => layer.zPosition);
  const minDepth = Math.min(...depths);
  const maxDepth = Math.max(...depths);
  const layerSpread = maxDepth - minDepth;

  // Suggest FOV based on layer spread
  let suggestedFOV = 45; // Default
  if (layerSpread > 15) {
    suggestedFOV = 60; // Wider FOV for large spreads
  } else if (layerSpread < 5) {
    suggestedFOV = 30; // Narrower FOV for tight spreads
  }

  // Suggest camera distance based on layer distribution
  const avgDepth = (minDepth + maxDepth) / 2;
  const suggestedCameraDistance = Math.max(avgDepth + 5, 5); // Stay in front of layers

  return {
    suggestedFOV,
    suggestedCameraDistance,
    layerSpread
  };
}