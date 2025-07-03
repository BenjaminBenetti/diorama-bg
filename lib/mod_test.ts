import { assertEquals, assertExists } from "@std/assert";
import {
  createInitialState,
  parallaxReducer,
  ParallaxStore,
  createParallaxStore,
  type ParallaxState,
  type ParallaxAction,
} from "./mod.ts";

Deno.test("createInitialState creates correct initial state", () => {
  const state = createInitialState();
  
  assertEquals(state.scrollY, 0);
  assertEquals(state.layers, []);
  assertEquals(state.isActive, true);
});

Deno.test("parallaxReducer handles UPDATE_SCROLL action", () => {
  const initialState = createInitialState();
  const action: ParallaxAction = {
    type: 'UPDATE_SCROLL',
    payload: { scrollY: 100 },
  };
  
  const newState = parallaxReducer(initialState, action);
  
  assertEquals(newState.scrollY, 100);
  assertEquals(newState.layers, []);
  assertEquals(newState.isActive, true);
});

Deno.test("parallaxReducer handles ADD_LAYER action", () => {
  const initialState = createInitialState();
  const layer = {
    id: 'test-layer',
    element: null,
    speed: 0.5,
    offset: 0,
  };
  const action: ParallaxAction = {
    type: 'ADD_LAYER',
    payload: { layer },
  };
  
  const newState = parallaxReducer(initialState, action);
  
  assertEquals(newState.layers.length, 1);
  assertEquals(newState.layers[0], layer);
});

Deno.test("parallaxReducer handles REMOVE_LAYER action", () => {
  const initialState: ParallaxState = {
    scrollY: 0,
    layers: [
      { id: 'layer1', element: null, speed: 0.5, offset: 0 },
      { id: 'layer2', element: null, speed: 0.3, offset: 10 },
    ],
    isActive: true,
  };
  
  const action: ParallaxAction = {
    type: 'REMOVE_LAYER',
    payload: { layerId: 'layer1' },
  };
  
  const newState = parallaxReducer(initialState, action);
  
  assertEquals(newState.layers.length, 1);
  assertEquals(newState.layers[0].id, 'layer2');
});

Deno.test("parallaxReducer handles TOGGLE_ACTIVE action", () => {
  const initialState = createInitialState();
  const action: ParallaxAction = { type: 'TOGGLE_ACTIVE' };
  
  const newState = parallaxReducer(initialState, action);
  
  assertEquals(newState.isActive, false);
  
  const newState2 = parallaxReducer(newState, action);
  assertEquals(newState2.isActive, true);
});

Deno.test("ParallaxStore can be created and has initial state", () => {
  const store = new ParallaxStore();
  const state = store.getState();
  
  assertEquals(state.scrollY, 0);
  assertEquals(state.layers, []);
  assertEquals(state.isActive, true);
});

Deno.test("ParallaxStore can dispatch actions", () => {
  const store = new ParallaxStore();
  
  store.dispatch({
    type: 'UPDATE_SCROLL',
    payload: { scrollY: 50 },
  });
  
  assertEquals(store.getState().scrollY, 50);
});

Deno.test("ParallaxStore subscription works", () => {
  const store = new ParallaxStore();
  let callCount = 0;
  let lastState: ParallaxState | null = null;
  
  const unsubscribe = store.subscribe((state) => {
    callCount++;
    lastState = state;
  });
  
  store.dispatch({
    type: 'UPDATE_SCROLL',
    payload: { scrollY: 25 },
  });
  
  assertEquals(callCount, 1);
  assertExists(lastState);
  assertEquals((lastState as ParallaxState).scrollY, 25);
  
  unsubscribe();
  
  store.dispatch({
    type: 'UPDATE_SCROLL',
    payload: { scrollY: 50 },
  });
  
  assertEquals(callCount, 1); // Should not increment after unsubscribe
});

Deno.test("ParallaxStore addLayer creates unique IDs", () => {
  const store = new ParallaxStore();
  
  const id1 = store.addLayer({
    element: null,
    speed: 0.5,
    offset: 0,
  });
  
  const id2 = store.addLayer({
    element: null,
    speed: 0.3,
    offset: 10,
  });
  
  assertEquals(store.getState().layers.length, 2);
  assertEquals(store.getState().layers[0].id, id1);
  assertEquals(store.getState().layers[1].id, id2);
  assertEquals(id1 !== id2, true);
});

Deno.test("createParallaxStore factory function works", () => {
  const store = createParallaxStore();
  assertExists(store);
  assertEquals(store.getState().scrollY, 0);
});
