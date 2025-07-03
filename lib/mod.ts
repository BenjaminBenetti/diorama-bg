/**
 * Parallax Background Redux Library
 * 
 * A lightweight library for creating parallax background effects
 */

export interface ParallaxState {
  scrollY: number;
  layers: ParallaxLayer[];
  isActive: boolean;
}

export interface ParallaxLayer {
  id: string;
  element: HTMLElement | null;
  speed: number;
  offset: number;
}

export interface ParallaxAction {
  type: 'UPDATE_SCROLL' | 'ADD_LAYER' | 'REMOVE_LAYER' | 'TOGGLE_ACTIVE';
  payload?: any;
}

/**
 * Creates the initial parallax state
 */
export function createInitialState(): ParallaxState {
  return {
    scrollY: 0,
    layers: [],
    isActive: true,
  };
}

/**
 * Parallax reducer function
 */
export function parallaxReducer(
  state: ParallaxState,
  action: ParallaxAction,
): ParallaxState {
  switch (action.type) {
    case 'UPDATE_SCROLL':
      return {
        ...state,
        scrollY: action.payload.scrollY,
      };
    
    case 'ADD_LAYER':
      return {
        ...state,
        layers: [...state.layers, action.payload.layer],
      };
    
    case 'REMOVE_LAYER':
      return {
        ...state,
        layers: state.layers.filter(layer => layer.id !== action.payload.layerId),
      };
    
    case 'TOGGLE_ACTIVE':
      return {
        ...state,
        isActive: !state.isActive,
      };
    
    default:
      return state;
  }
}

/**
 * Creates a parallax store with basic Redux-like functionality
 */
export class ParallaxStore {
  private state: ParallaxState;
  private listeners: Array<(state: ParallaxState) => void> = [];

  constructor(initialState?: ParallaxState) {
    this.state = initialState || createInitialState();
  }

  getState(): ParallaxState {
    return this.state;
  }

  dispatch(action: ParallaxAction): void {
    this.state = parallaxReducer(this.state, action);
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: ParallaxState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Updates the scroll position and applies parallax effects
   */
  updateScroll(scrollY: number): void {
    this.dispatch({
      type: 'UPDATE_SCROLL',
      payload: { scrollY },
    });

    if (this.state.isActive) {
      this.applyParallaxEffects();
    }
  }

  /**
   * Adds a new parallax layer
   */
  addLayer(layer: Omit<ParallaxLayer, 'id'>): string {
    const id = `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newLayer: ParallaxLayer = { ...layer, id };
    
    this.dispatch({
      type: 'ADD_LAYER',
      payload: { layer: newLayer },
    });

    return id;
  }

  /**
   * Removes a parallax layer
   */
  removeLayer(layerId: string): void {
    this.dispatch({
      type: 'REMOVE_LAYER',
      payload: { layerId },
    });
  }

  /**
   * Toggles the parallax effect on/off
   */
  toggle(): void {
    this.dispatch({ type: 'TOGGLE_ACTIVE' });
  }

  private applyParallaxEffects(): void {
    this.state.layers.forEach(layer => {
      if (layer.element) {
        const translateY = (this.state.scrollY * layer.speed) + layer.offset;
        layer.element.style.transform = `translateY(${translateY}px)`;
      }
    });
  }
}

/**
 * Creates a new parallax store instance
 */
export function createParallaxStore(initialState?: ParallaxState): ParallaxStore {
  return new ParallaxStore(initialState);
}
