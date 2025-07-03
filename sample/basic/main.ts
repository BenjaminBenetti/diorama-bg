import { serveDir } from "@std/http";
import { createParallaxStore } from "@bbenetti/parallax-bg";

const PORT = 8000;

// Create a simple HTTP server to serve our demo
Deno.serve({ port: PORT }, async (req) => {
  const url = new URL(req.url);
  
  if (url.pathname === "/") {
    return new Response(await getIndexHTML(), {
      headers: { "content-type": "text/html" },
    });
  }
  
  if (url.pathname === "/app.js") {
    return new Response(await getAppJS(), {
      headers: { "content-type": "application/javascript" },
    });
  }
  
  if (url.pathname === "/style.css") {
    return new Response(await getStyleCSS(), {
      headers: { "content-type": "text/css" },
    });
  }
  
  return new Response("Not Found", { status: 404 });
});

console.log(`🚀 Parallax Background Demo running at http://localhost:${PORT}`);

async function getIndexHTML(): Promise<string> {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parallax Background Redux Demo</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <div class="parallax-container">
        <div class="parallax-layer" id="layer1" data-speed="0.2">
            <div class="content">Background Layer 1</div>
        </div>
        <div class="parallax-layer" id="layer2" data-speed="0.5">
            <div class="content">Background Layer 2</div>
        </div>
        <div class="parallax-layer" id="layer3" data-speed="0.8">
            <div class="content">Background Layer 3</div>
        </div>
    </div>
    
    <div class="main-content">
        <header>
            <h1>Parallax Background Redux Demo</h1>
            <p>Scroll down to see the parallax effect in action!</p>
            <div class="controls">
                <button id="toggleBtn">Toggle Parallax</button>
                <button id="addLayerBtn">Add Layer</button>
                <div class="status">
                    Status: <span id="status">Active</span> | 
                    Scroll: <span id="scrollY">0</span>px | 
                    Layers: <span id="layerCount">0</span>
                </div>
            </div>
        </header>
        
        <main>
            <section class="content-section">
                <h2>About This Demo</h2>
                <p>This demo showcases the Parallax Background Redux library, which provides a Redux-style state management approach to creating parallax scrolling effects.</p>
                <p>The library features:</p>
                <ul>
                    <li>Redux-style state management</li>
                    <li>Multiple parallax layers with different speeds</li>
                    <li>Dynamic layer addition and removal</li>
                    <li>Toggle parallax effects on/off</li>
                    <li>TypeScript support</li>
                </ul>
            </section>
            
            <section class="content-section">
                <h2>How It Works</h2>
                <p>The parallax effect is achieved by moving background layers at different speeds relative to the scroll position. Layers with lower speed values move slower, creating the illusion of depth.</p>
                <p>The Redux-style store manages the state of all layers and scroll position, making it easy to add, remove, or modify layers dynamically.</p>
            </section>
            
            <section class="content-section">
                <h2>Try the Controls</h2>
                <p>Use the buttons above to:</p>
                <ul>
                    <li><strong>Toggle Parallax:</strong> Turn the parallax effect on or off</li>
                    <li><strong>Add Layer:</strong> Dynamically add a new parallax layer</li>
                </ul>
                <p>Watch the status indicators to see how the state changes as you interact with the demo.</p>
            </section>
            
            <section class="content-section">
                <h2>Keep Scrolling</h2>
                <p>Continue scrolling to see more of the parallax effect. Notice how the background layers move at different speeds, creating a sense of depth and movement.</p>
            </section>
            
            <section class="content-section">
                <h2>Implementation</h2>
                <p>This demo is built using the Parallax Background Redux library, which provides a clean, predictable way to manage parallax effects using Redux patterns.</p>
                <p>The library is written in TypeScript and designed to work seamlessly with modern web applications.</p>
            </section>
        </main>
        
        <footer>
            <p>&copy; 2024 Parallax Background Redux Demo</p>
        </footer>
    </div>
    
    <script type="module" src="/app.js"></script>
</body>
</html>`;
}

async function getStyleCSS(): Promise<string> {
  return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    overflow-x: hidden;
}

.parallax-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: -1;
    overflow: hidden;
}

.parallax-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 120vh;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
}

.parallax-layer:nth-child(1) {
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
}

.parallax-layer:nth-child(2) {
    background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
}

.parallax-layer:nth-child(3) {
    background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
}

.parallax-layer .content {
    font-size: 3rem;
    font-weight: bold;
    color: white;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    text-align: center;
}

.main-content {
    position: relative;
    z-index: 1;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    min-height: 200vh;
}

header {
    padding: 2rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0,0,0,0.1);
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #333;
}

header p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 1rem;
}

.controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
}

.controls button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    background: #667eea;
    color: white;
    cursor: pointer;
    transition: background 0.3s ease;
}

.controls button:hover {
    background: #5a6fd8;
}

.status {
    font-family: monospace;
    background: #f5f5f5;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    border: 1px solid #ddd;
}

main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.content-section {
    margin-bottom: 3rem;
    padding: 2rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.content-section h2 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.8rem;
}

.content-section p {
    margin-bottom: 1rem;
    color: #666;
}

.content-section ul {
    margin-left: 2rem;
    margin-bottom: 1rem;
}

.content-section li {
    margin-bottom: 0.5rem;
    color: #666;
}

footer {
    text-align: center;
    padding: 2rem;
    background: #333;
    color: white;
}

@media (max-width: 768px) {
    .parallax-layer .content {
        font-size: 2rem;
    }
    
    header h1 {
        font-size: 2rem;
    }
    
    main {
        padding: 1rem;
    }
    
    .content-section {
        padding: 1rem;
    }
}`;
}

async function getAppJS(): Promise<string> {
  return `// This would normally import from the built library
// For demo purposes, we'll include a simplified version inline

class ParallaxStore {
    constructor(initialState) {
        this.state = initialState || {
            scrollY: 0,
            layers: [],
            isActive: true
        };
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    dispatch(action) {
        this.state = this.reduce(this.state, action);
        this.listeners.forEach(listener => listener(this.state));
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    reduce(state, action) {
        switch (action.type) {
            case 'UPDATE_SCROLL':
                return { ...state, scrollY: action.payload.scrollY };
            case 'ADD_LAYER':
                return { ...state, layers: [...state.layers, action.payload.layer] };
            case 'REMOVE_LAYER':
                return { ...state, layers: state.layers.filter(l => l.id !== action.payload.layerId) };
            case 'TOGGLE_ACTIVE':
                return { ...state, isActive: !state.isActive };
            default:
                return state;
        }
    }

    updateScroll(scrollY) {
        this.dispatch({ type: 'UPDATE_SCROLL', payload: { scrollY } });
        if (this.state.isActive) {
            this.applyParallaxEffects();
        }
    }

    addLayer(layer) {
        const id = \`layer-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
        const newLayer = { ...layer, id };
        this.dispatch({ type: 'ADD_LAYER', payload: { layer: newLayer } });
        return id;
    }

    removeLayer(layerId) {
        this.dispatch({ type: 'REMOVE_LAYER', payload: { layerId } });
    }

    toggle() {
        this.dispatch({ type: 'TOGGLE_ACTIVE' });
    }

    applyParallaxEffects() {
        this.state.layers.forEach(layer => {
            if (layer.element) {
                const translateY = (this.state.scrollY * layer.speed) + layer.offset;
                layer.element.style.transform = \`translateY(\${translateY}px)\`;
            }
        });
    }
}

// Initialize the parallax store
const store = new ParallaxStore();

// Initialize layers from existing DOM elements
document.addEventListener('DOMContentLoaded', () => {
    const layerElements = document.querySelectorAll('.parallax-layer');
    
    layerElements.forEach(element => {
        const speed = parseFloat(element.dataset.speed) || 0.5;
        store.addLayer({
            element: element,
            speed: speed,
            offset: 0
        });
    });

    // Subscribe to state changes for UI updates
    store.subscribe(state => {
        document.getElementById('status').textContent = state.isActive ? 'Active' : 'Inactive';
        document.getElementById('scrollY').textContent = Math.round(state.scrollY);
        document.getElementById('layerCount').textContent = state.layers.length;
    });

    // Handle scroll events
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                store.updateScroll(window.scrollY);
                ticking = false;
            });
            ticking = true;
        }
    });

    // Handle toggle button
    document.getElementById('toggleBtn').addEventListener('click', () => {
        store.toggle();
    });

    // Handle add layer button
    document.getElementById('addLayerBtn').addEventListener('click', () => {
        const container = document.querySelector('.parallax-container');
        const newLayer = document.createElement('div');
        newLayer.className = 'parallax-layer';
        newLayer.style.background = \`linear-gradient(45deg, 
            hsl(\${Math.random() * 360}, 70%, 60%) 0%, 
            hsl(\${Math.random() * 360}, 70%, 60%) 100%)\`;
        newLayer.innerHTML = \`<div class="content">Dynamic Layer \${store.getState().layers.length + 1}</div>\`;
        
        container.appendChild(newLayer);
        
        store.addLayer({
            element: newLayer,
            speed: Math.random() * 0.8 + 0.1, // Random speed between 0.1 and 0.9
            offset: 0
        });
    });

    // Initial state update
    store.updateScroll(window.scrollY);
});`;
}
