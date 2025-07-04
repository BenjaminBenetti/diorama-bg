import { assertEquals, assertInstanceOf } from "@std/assert";
import { ImageLayer } from "./imageLayer.ts";
import { LayerBase } from "./layerBase.ts";

// Mock HTMLCanvasElement for testing
class MockCanvas {
  width = 800;
  height = 600;
  
  getContext(type: string) {
    if (type === '2d') {
      return {
        clearRect: () => {},
        drawImage: () => {},
      };
    }
    return null;
  }
}

// Mock Image for testing
class MockImage {
  width = 400;
  height = 300;
  src = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private timerId: number | null = null;

  constructor() {
    // Simulate successful image load after a short delay
    this.timerId = setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
      this.timerId = null;
    }, 10);
  }

  // Method to clean up timer for testing
  cleanup() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

// Mock global Image constructor
(globalThis as unknown as { Image: typeof MockImage }).Image = MockImage;

Deno.test("ImageLayer - should extend LayerBase", () => {
  const imageLayer = new ImageLayer("https://example.com/image.jpg", 1);

  assertInstanceOf(imageLayer, LayerBase);
  assertEquals(imageLayer.zIndex, 1);
  assertEquals(imageLayer.canvas, undefined); // Canvas not assigned yet
});

Deno.test("ImageLayer - should store image URL", () => {
  const imageUrl = "https://example.com/image.jpg";
  const imageLayer = new ImageLayer(imageUrl, 1);

  assertEquals(imageLayer.getImageUrl(), imageUrl);
});

Deno.test("ImageLayer - should initially not be loaded", () => {
  const imageLayer = new ImageLayer("https://example.com/image.jpg", 1);

  assertEquals(imageLayer.isImageLoaded(), false);
});

Deno.test("ImageLayer - should preload image", async () => {
  const imageLayer = new ImageLayer("https://example.com/image.jpg", 1);

  assertEquals(imageLayer.isImageLoaded(), false);

  await imageLayer.preloadImage();

  assertEquals(imageLayer.isImageLoaded(), true);
});

Deno.test("ImageLayer - should implement load method from LayerBase", async () => {
  const imageLayer = new ImageLayer("https://example.com/image.jpg", 1);

  assertEquals(imageLayer.isImageLoaded(), false);

  // Test the load method from LayerBase
  await imageLayer.load();

  assertEquals(imageLayer.isImageLoaded(), true);
});

Deno.test("ImageLayer - should render without errors when image is loaded", async () => {
  const canvas = new MockCanvas() as unknown as HTMLCanvasElement;
  const imageLayer = new ImageLayer("https://example.com/image.jpg", 1);

  // Assign canvas and preload the image
  imageLayer.assignCanvas(canvas);
  await imageLayer.preloadImage();

  // Render should not throw
  imageLayer.render([]);
});

Deno.test("ImageLayer - should handle render when image is not loaded", async () => {
  const canvas = new MockCanvas() as unknown as HTMLCanvasElement;
  const imageLayer = new ImageLayer("https://example.com/image.jpg", 1);

  // Assign canvas
  imageLayer.assignCanvas(canvas);

  // Render should not throw even when image is not loaded
  imageLayer.render([]);

  // Wait a bit to let any timers complete
  await new Promise(resolve => setTimeout(resolve, 20));
});

Deno.test("ImageLayer - should update image URL", async () => {
  const imageLayer = new ImageLayer("https://example.com/image1.jpg", 1);

  assertEquals(imageLayer.getImageUrl(), "https://example.com/image1.jpg");

  await imageLayer.updateImage("https://example.com/image2.jpg");

  assertEquals(imageLayer.getImageUrl(), "https://example.com/image2.jpg");
  assertEquals(imageLayer.isImageLoaded(), true);
});
