// Main module exports for the Diorama Bg Library

// Layer system (includes base classes, implementations, and 3D utilities)
export * from "./src/layers/index.ts";

// 3D transformation system
export * from "./src/transforms/index.ts";

// Canvas factory
export { CanvasFactory } from "./src/canvas/factory/canvas-factory.ts";

// Main controller (includes 3D capabilities)
export { DioramaController } from "./src/diorama/controller/diorama-controller.ts";
