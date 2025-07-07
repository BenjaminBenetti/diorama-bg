import { DioramaController, ImageLayer } from "@bbenetti/diorama-bg";

// ==================================
// Main Application
// ==================================

/**
 * Initialize the diorama background demo
 */
async function initializeDiorama(): Promise<void> {
  // Get the container element
  const container = document.getElementById('diorama-container');
  if (!container) {
    console.error('Diorama container not found');
    return;
  }

  // Create the diorama controller
  const dioramaController = new DioramaController(container);

  try {
    // Add background layers (higher z-index = further back)
    // Layer 3: Far background (mountains/sky)
    await dioramaController.addLayer(new ImageLayer(
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
      3
    ));

    // Layer 2: Middle ground (trees/hills)
    await dioramaController.addLayer(new ImageLayer(
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop",
      2
    ));

    // Layer 1: Foreground (closer elements)
    await dioramaController.addLayer(new ImageLayer(
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop",
      1
    ));

    // Initial render
    dioramaController.render();

    // Handle window resize
    globalThis.addEventListener('resize', () => {
      dioramaController.resize();
    });

    console.log('Diorama initialized successfully with', dioramaController.getLayers().length, 'layers');

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