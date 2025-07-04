import { assertEquals, assertThrows } from "@std/assert";
import { CanvasFactory } from "./canvasFactory.ts";

// Mock DOM elements for testing
class MockHTMLElement {
  style: Record<string, string> = {};

  getBoundingClientRect() {
    return {
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
    };
  }
}

class MockCanvas extends MockHTMLElement {
  width = 0;
  height = 0;

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

// Mock global document
(globalThis as unknown as { 
  document: { createElement: (tag: string) => MockCanvas };
}).document = {
  createElement: (tag: string) => {
    if (tag === 'canvas') {
      return new MockCanvas();
    }
    return new MockHTMLElement() as unknown as MockCanvas;
  }
};

Deno.test("CanvasFactory - should create layer canvas with correct dimensions", () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  const canvas = CanvasFactory.createLayerCanvas(container, 1);
  
  assertEquals(canvas.width, 800);
  assertEquals(canvas.height, 600);
});

Deno.test("CanvasFactory - should apply correct layer styling", () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  const canvas = CanvasFactory.createLayerCanvas(container, 2);
  
  assertEquals(canvas.style.position, 'absolute');
  assertEquals(canvas.style.top, '0');
  assertEquals(canvas.style.left, '0');
  assertEquals(canvas.style.width, '100%');
  assertEquals(canvas.style.height, '100%');
  assertEquals(canvas.style.zIndex, '2');
  assertEquals(canvas.style.pointerEvents, 'none');
});

Deno.test("CanvasFactory - should resize canvas to match container", () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  const canvas = CanvasFactory.createLayerCanvas(container, 1);
  
  // Initial size
  assertEquals(canvas.width, 800);
  assertEquals(canvas.height, 600);
  
  // Mock container size change
  (container as unknown as MockHTMLElement).getBoundingClientRect = () => ({
    width: 1200,
    height: 900,
    top: 0,
    left: 0,
    right: 1200,
    bottom: 900,
  });
  
  CanvasFactory.resizeCanvas(canvas, container);
  
  assertEquals(canvas.width, 1200);
  assertEquals(canvas.height, 900);
});

Deno.test("CanvasFactory - should create multiple canvases", () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  const zIndices = [1, 2, 3];
  const canvases = CanvasFactory.createMultipleCanvases(container, zIndices);
  
  assertEquals(canvases.length, 3);
  assertEquals(canvases[0].style.zIndex, '1');
  assertEquals(canvases[1].style.zIndex, '2');
  assertEquals(canvases[2].style.zIndex, '3');
});

Deno.test("CanvasFactory - should validate container", () => {
  assertThrows(
    () => CanvasFactory.validateContainer(null as unknown as HTMLElement),
    Error,
    "Container element is required for canvas creation"
  );
});

Deno.test("CanvasFactory - should create custom canvas with additional styles", () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  const customStyles = {
    opacity: '0.5',
    borderRadius: '10px'
  };
  
  const canvas = CanvasFactory.createCustomCanvas(container, 1, customStyles);
  
  assertEquals(canvas.style.zIndex, '1');
  assertEquals(canvas.style.opacity, '0.5');
  assertEquals(canvas.style.borderRadius, '10px');
});

Deno.test("CanvasFactory - should handle container with no dimensions", () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  
  // Mock container with no dimensions
  (container as unknown as MockHTMLElement).getBoundingClientRect = () => ({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });
  
  const canvas = CanvasFactory.createLayerCanvas(container, 1);
  
  // Should fall back to default dimensions
  assertEquals(canvas.width, 800);
  assertEquals(canvas.height, 600);
});

Deno.test("CanvasFactory - should create canvas with different z-indices", () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  
  const canvas1 = CanvasFactory.createLayerCanvas(container, 0);
  const canvas2 = CanvasFactory.createLayerCanvas(container, 5);
  const canvas3 = CanvasFactory.createLayerCanvas(container, -1);
  
  assertEquals(canvas1.style.zIndex, '0');
  assertEquals(canvas2.style.zIndex, '5');
  assertEquals(canvas3.style.zIndex, '-1');
});
