import { DioramaController, ImageLayer, degreesToRadians, autoSetLayerDepths } from "@bbenetti/diorama-bg";

// ==================================
// Global Variables
// ==================================

let dioramaController: DioramaController;
let isAnimating = false;
let animationId: number | null = null;

// ==================================
// 3D Controls Setup
// ==================================

/**
 * Set up all the 3D control event listeners
 */
function setup3DControls(): void {
  // Rotation controls
  const rotationX = document.getElementById('rotation-x') as HTMLInputElement;
  const rotationY = document.getElementById('rotation-y') as HTMLInputElement;
  const rotationZ = document.getElementById('rotation-z') as HTMLInputElement;
  
  const rotationXValue = document.getElementById('rotation-x-value') as HTMLSpanElement;
  const rotationYValue = document.getElementById('rotation-y-value') as HTMLSpanElement;
  const rotationZValue = document.getElementById('rotation-z-value') as HTMLSpanElement;

  // Perspective controls
  const fieldOfView = document.getElementById('field-of-view') as HTMLInputElement;
  const cameraDistance = document.getElementById('camera-distance') as HTMLInputElement;
  
  const fovValue = document.getElementById('field-of-view-value') as HTMLSpanElement;
  const cameraDistanceValue = document.getElementById('camera-distance-value') as HTMLSpanElement;

  // Animation and preset buttons
  const animateToggle = document.getElementById('animate-toggle') as HTMLButtonElement;
  const resetRotation = document.getElementById('reset-rotation') as HTMLButtonElement;
  const presetTilt = document.getElementById('preset-tilt') as HTMLButtonElement;
  const presetPerspective = document.getElementById('preset-perspective') as HTMLButtonElement;
  const presetSubtle = document.getElementById('preset-subtle') as HTMLButtonElement;

  // Rotation event listeners
  rotationX.addEventListener('input', () => {
    const value = parseInt(rotationX.value);
    rotationXValue.textContent = `${value}°`;
    updateRotation();
  });

  rotationY.addEventListener('input', () => {
    const value = parseInt(rotationY.value);
    rotationYValue.textContent = `${value}°`;
    updateRotation();
  });

  rotationZ.addEventListener('input', () => {
    const value = parseInt(rotationZ.value);
    rotationZValue.textContent = `${value}°`;
    updateRotation();
  });

  // Perspective event listeners
  fieldOfView.addEventListener('input', () => {
    const value = parseInt(fieldOfView.value);
    fovValue.textContent = `${value}°`;
    updatePerspective();
  });

  cameraDistance.addEventListener('input', () => {
    const value = parseFloat(cameraDistance.value);
    cameraDistanceValue.textContent = value.toString();
    updateCameraPosition();
  });

  // Animation controls
  animateToggle.addEventListener('click', () => {
    if (isAnimating) {
      stopAnimation();
      animateToggle.textContent = 'Start Animation';
      animateToggle.classList.remove('active');
    } else {
      startAnimation();
      animateToggle.textContent = 'Stop Animation';
      animateToggle.classList.add('active');
    }
  });

  resetRotation.addEventListener('click', () => {
    stopAnimation();
    setRotationValues(0, 0, 0);
    updateRotation();
    animateToggle.textContent = 'Start Animation';
    animateToggle.classList.remove('active');
  });

  // Preset controls
  presetTilt.addEventListener('click', () => {
    stopAnimation();
    setRotationValues(15, 5, 0);
    updateRotation();
    animateToggle.textContent = 'Start Animation';
    animateToggle.classList.remove('active');
  });

  presetPerspective.addEventListener('click', () => {
    stopAnimation();
    setRotationValues(25, 15, 5);
    fieldOfView.value = '75';
    fovValue.textContent = '75°';
    updatePerspective();
    updateRotation();
    animateToggle.textContent = 'Start Animation';
    animateToggle.classList.remove('active');
  });

  presetSubtle.addEventListener('click', () => {
    stopAnimation();
    setRotationValues(5, 3, 0);
    fieldOfView.value = '35';
    fovValue.textContent = '35°';
    updatePerspective();
    updateRotation();
    animateToggle.textContent = 'Start Animation';
    animateToggle.classList.remove('active');
  });
}

/**
 * Update the rotation sliders and display values
 */
function setRotationValues(x: number, y: number, z: number): void {
  const rotationX = document.getElementById('rotation-x') as HTMLInputElement;
  const rotationY = document.getElementById('rotation-y') as HTMLInputElement;
  const rotationZ = document.getElementById('rotation-z') as HTMLInputElement;
  
  const rotationXValue = document.getElementById('rotation-x-value') as HTMLSpanElement;
  const rotationYValue = document.getElementById('rotation-y-value') as HTMLSpanElement;
  const rotationZValue = document.getElementById('rotation-z-value') as HTMLSpanElement;

  rotationX.value = x.toString();
  rotationY.value = y.toString();
  rotationZ.value = z.toString();
  
  rotationXValue.textContent = `${x}°`;
  rotationYValue.textContent = `${y}°`;
  rotationZValue.textContent = `${z}°`;
}

/**
 * Update the slider UI during animation without triggering events
 */
function updateSliderUI(x: number, y: number, z: number): void {
  const rotationXValue = document.getElementById('rotation-x-value') as HTMLSpanElement;
  const rotationYValue = document.getElementById('rotation-y-value') as HTMLSpanElement;
  const rotationZValue = document.getElementById('rotation-z-value') as HTMLSpanElement;

  // Update display values only (don't update slider positions during animation)
  rotationXValue.textContent = `${x}°`;
  rotationYValue.textContent = `${y}°`;
  rotationZValue.textContent = `${z}°`;
}

/**
 * Update the 3D rotation based on current slider values
 */
function updateRotation(): void {
  const rotationX = document.getElementById('rotation-x') as HTMLInputElement;
  const rotationY = document.getElementById('rotation-y') as HTMLInputElement;
  const rotationZ = document.getElementById('rotation-z') as HTMLInputElement;

  const xRad = degreesToRadians(parseInt(rotationX.value));
  const yRad = degreesToRadians(parseInt(rotationY.value));
  const zRad = degreesToRadians(parseInt(rotationZ.value));

  dioramaController.setRotation(xRad, yRad, zRad);
  dioramaController.render();
}

/**
 * Update the perspective settings
 */
function updatePerspective(): void {
  const fieldOfView = document.getElementById('field-of-view') as HTMLInputElement;
  const fov = parseInt(fieldOfView.value);
  
  dioramaController.setFieldOfView(fov);
  dioramaController.render();
}

/**
 * Update the camera position based on distance slider
 */
function updateCameraPosition(): void {
  const cameraDistance = document.getElementById('camera-distance') as HTMLInputElement;
  const distance = parseFloat(cameraDistance.value);
  
  dioramaController.setCameraPositionXYZ(0, 0, distance);
  dioramaController.render();
}

/**
 * Start the rotation animation
 */
function startAnimation(): void {
  isAnimating = true;
  let startTime = performance.now();
  
  function animate(currentTime: number): void {
    if (!isAnimating) return;
    
    const elapsed = (currentTime - startTime) / 1000; // Convert to seconds
    
    // Animated rotation speeds (in degrees per second) - adjusted for smoother motion
    const xSpeed = 8;  // X-axis rotation speed (slightly slower for better visual)
    const ySpeed = 12; // Y-axis rotation speed
    const zSpeed = 6;  // Z-axis rotation speed
    
    // Calculate current rotation values with smooth sine waves
    const xRotation = Math.sin(elapsed * degreesToRadians(xSpeed)) * 18;
    const yRotation = Math.sin(elapsed * degreesToRadians(ySpeed)) * 22;
    const zRotation = Math.sin(elapsed * degreesToRadians(zSpeed)) * 12;
    
    // Apply rotations directly without rounding for smooth fractional angles
    const xRad = degreesToRadians(xRotation);
    const yRad = degreesToRadians(yRotation);
    const zRad = degreesToRadians(zRotation);
    
    // Update diorama rotation directly for maximum smoothness
    dioramaController.setRotation(xRad, yRad, zRad);
    dioramaController.render();
    
    // Update slider UI to reflect current values (rounded for display)
    updateSliderUI(
      Math.round(xRotation * 10) / 10, // Round to 1 decimal place for smoother display
      Math.round(yRotation * 10) / 10,
      Math.round(zRotation * 10) / 10
    );
    
    animationId = requestAnimationFrame(animate);
  }
  
  animationId = requestAnimationFrame(animate);
}

/**
 * Stop the rotation animation
 */
function stopAnimation(): void {
  isAnimating = false;
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

// ==================================
// Main Application
// ==================================

/**
 * Initialize the diorama background demo with 3D capabilities
 */
async function initializeDiorama(): Promise<void> {
  // Get the container element
  const container = document.getElementById('diorama-container');
  if (!container) {
    console.error('Diorama container not found');
    return;
  }

  // Create the diorama controller
  dioramaController = new DioramaController(container);

  try {
    // Add background layers with 3D depth positioning
    // Layer 3: Far background (mountains/sky) - furthest back
    await dioramaController.addLayer(new ImageLayer(
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
      3,
      10 // z-position: far from camera
    ));

    // Layer 2: Middle ground (trees/hills) - middle depth
    await dioramaController.addLayer(new ImageLayer(
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop",
      2,
      5 // z-position: medium distance from camera
    ));

    // Layer 1: Foreground (closer elements) - closest to camera
    await dioramaController.addLayer(new ImageLayer(
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop",
      1,
      0 // z-position: close to camera
    ));

    // Set up automated layer depth staging for better 3D effect
    autoSetLayerDepths(dioramaController.getLayers(), 3, 0);

    // Initial render
    dioramaController.render();

    // Set up 3D controls
    setup3DControls();

    // Handle window resize
    globalThis.addEventListener('resize', () => {
      dioramaController.resize();
    });

    console.log('3D Diorama initialized successfully with', dioramaController.getLayers().length, 'layers');
    console.log('Use the controls panel to experiment with 3D transformations!');

  } catch (error) {
    console.error('Failed to initialize diorama:', error);
  }
}

// ==================================
// Application Entry Point
// ==================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDiorama);
} else {
  initializeDiorama();
}