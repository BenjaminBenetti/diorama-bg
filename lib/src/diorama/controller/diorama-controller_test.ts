import { assertEquals, assertInstanceOf } from "@std/assert";
import { DioramaController } from "./diorama-controller.ts";
import { ImageLayer } from "../../layers/model/image-layer.ts";

// Mock DOM elements for testing
class MockHTMLElement {
  style: Record<string, string> = {};
  children: MockHTMLElement[] = [];
  parentNode: MockHTMLElement | null = null;

  appendChild(child: MockHTMLElement): void {
    child.parentNode = this;
    this.children.push(child);
  }

  removeChild(child: MockHTMLElement): void {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parentNode = null;
    }
  }

  insertBefore(newChild: MockHTMLElement, referenceChild: MockHTMLElement): void {
    const index = this.children.indexOf(referenceChild);
    if (index > -1) {
      newChild.parentNode = this;
      this.children.splice(index, 0, newChild);
    } else {
      this.appendChild(newChild);
    }
  }

  querySelectorAll(selector: string): MockHTMLElement[] {
    if (selector === 'canvas') {
      return this.children.filter(child => child instanceof MockCanvas);
    }
    return [];
  }

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

  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 10);
  }
}

// Mock global functions
(globalThis as unknown as { 
  document: { createElement: (tag: string) => MockHTMLElement };
  getComputedStyle: (element: MockHTMLElement) => { position: string };
  Image: typeof MockImage;
}).document = {
  createElement: (tag: string) => {
    if (tag === 'canvas') {
      return new MockCanvas();
    }
    return new MockHTMLElement();
  }
};

(globalThis as unknown as { getComputedStyle: (element: MockHTMLElement) => { position: string } }).getComputedStyle = () => ({
  position: 'static'
});

(globalThis as unknown as { Image: typeof MockImage }).Image = MockImage;

Deno.test("DioramaController - should initialize with container", () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  const controller = new DioramaController(container);
  
  assertEquals(controller.getContainer(), container);
  assertEquals(controller.isReady(), true);
  assertEquals(controller.getLayers().length, 0);
});

Deno.test("DioramaController - should set container position to relative", () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  new DioramaController(container);

  assertEquals(container.style.position, 'relative');
  assertEquals(container.style.overflow, 'hidden');
});

Deno.test("DioramaController - should add image layer", async () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  const controller = new DioramaController(container);

  const imageLayer = new ImageLayer("https://example.com/image.jpg", 1);
  await controller.addLayer(imageLayer);

  assertInstanceOf(imageLayer, ImageLayer);
  assertEquals(imageLayer.zIndex, 1);
  assertEquals(controller.getLayers().length, 1);
  assertEquals(controller.getLayers()[0], imageLayer);
});

Deno.test("DioramaController - should add canvas to container when adding layer", async () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  const controller = new DioramaController(container);

  const imageLayer = new ImageLayer("https://example.com/image.jpg", 1);
  await controller.addLayer(imageLayer);

  assertEquals(container.children.length, 1);
  assertInstanceOf(container.children[0], MockCanvas);
});

Deno.test("DioramaController - should get layer by z-index", async () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  const controller = new DioramaController(container);

  const layer1 = new ImageLayer("https://example.com/image1.jpg", 1);
  const layer2 = new ImageLayer("https://example.com/image2.jpg", 2);
  await controller.addLayer(layer1);
  await controller.addLayer(layer2);

  assertEquals(controller.getLayerByZIndex(1), layer1);
  assertEquals(controller.getLayerByZIndex(2), layer2);
  assertEquals(controller.getLayerByZIndex(3), undefined);
});

Deno.test("DioramaController - should remove layer", async () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  const controller = new DioramaController(container);
  
  const layer = new ImageLayer("https://example.com/image.jpg", 1);
  await controller.addLayer(layer);
  assertEquals(controller.getLayers().length, 1);
  assertEquals(container.children.length, 1);
  
  controller.removeLayer(layer);
  
  assertEquals(controller.getLayers().length, 0);
  assertEquals(container.children.length, 0);
});

Deno.test("DioramaController - should clear all layers", async () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  const controller = new DioramaController(container);
  
  const layer1 = new ImageLayer("https://example.com/image1.jpg", 1);
  const layer2 = new ImageLayer("https://example.com/image2.jpg", 2);
  await controller.addLayer(layer1);
  await controller.addLayer(layer2);
  
  assertEquals(controller.getLayers().length, 2);
  assertEquals(container.children.length, 2);
  
  controller.clear();
  
  assertEquals(controller.getLayers().length, 0);
  assertEquals(container.children.length, 0);
});

Deno.test("DioramaController - should render all layers", async () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  const controller = new DioramaController(container);

  const layer1 = new ImageLayer("https://example.com/image1.jpg", 1);
  const layer2 = new ImageLayer("https://example.com/image2.jpg", 2);
  await controller.addLayer(layer1);
  await controller.addLayer(layer2);

  // Should not throw
  controller.render();

  // Verify layers are still there after render
  assertEquals(controller.getLayers().length, 2);
});

Deno.test("DioramaController - should resize canvases", async () => {
  const container = new MockHTMLElement() as unknown as HTMLElement;
  const controller = new DioramaController(container);
  
  const layer = new ImageLayer("https://example.com/image.jpg", 1);
  await controller.addLayer(layer);
  
  // Initial size should be set
  assertEquals(layer.canvas!.width, 800);
  assertEquals(layer.canvas!.height, 600);
  
  // Should not throw
  controller.resize();
});
