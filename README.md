# Parallax Background Redux

A workspace-based Deno project for creating parallax background effects with Redux-style state management.

## Project Structure

This project uses Deno workspaces to organize code into multiple modules:

```
parallax-bg/
├── deno.json                 # Root workspace configuration
├── lib/                      # Main library workspace
│   ├── deno.json            # Library configuration
│   ├── mod.ts               # Main library module
│   └── mod_test.ts          # Library tests
├── sample/
│   └── basic/               # Basic sample application
│       ├── deno.json        # Sample app configuration
│       └── main.ts          # Sample app server
└── README.md
```

## Workspaces

### Library (`lib/`)

The main `parallax-bg-redux` library provides:

- **ParallaxStore**: Redux-style store for managing parallax state
- **ParallaxState**: Type definitions for state management
- **ParallaxLayer**: Interface for parallax layers
- **Reducer functions**: Pure functions for state updates

### Sample Application (`sample/basic/`)

A basic demo application that showcases the library features:

- HTTP server serving a parallax demo page
- Interactive controls for toggling effects
- Dynamic layer addition
- Real-time state display

## Getting Started

### Prerequisites

- [Deno](https://deno.land/) v1.40 or later

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd parallax-bg
```

### Building

Build all workspaces:

```bash
deno task build
```

This will:
1. Build the library (`deno task build:lib`)
2. Build the sample application (`deno task build:sample`)

### Running the Demo

Start the sample application:

```bash
deno task dev:sample
```

Then open your browser to `http://localhost:8000` to see the parallax demo.

### Testing

Run tests for the library:

```bash
cd lib
deno test
```

### Development

For library development:

```bash
cd lib
deno task dev
```

For sample app development:

```bash
cd sample/basic
deno task dev
```

### Docker Development

The project includes Docker Compose configuration with profiles for different samples:

**Run the basic sample:**
```bash
deno task docker:basic
```

**Development with watch mode (rebuilds on file changes):**
```bash
deno task docker:basic:watch
```

**Stop all containers:**
```bash
deno task docker:down
```

The basic sample will be available at http://localhost:8080

## Library Usage

```typescript
import { createParallaxStore } from "@parallax-bg/redux";

// Create a store
const store = createParallaxStore();

// Add a parallax layer
const layerId = store.addLayer({
  element: document.getElementById('my-layer'),
  speed: 0.5,
  offset: 0
});

// Update scroll position
store.updateScroll(window.scrollY);

// Subscribe to state changes
const unsubscribe = store.subscribe((state) => {
  console.log('Scroll position:', state.scrollY);
  console.log('Active layers:', state.layers.length);
});

// Toggle parallax effect
store.toggle();
```

## Available Tasks

From the root directory:

- `deno task build` - Build all workspaces
- `deno task build:lib` - Build library only
- `deno task build:sample` - Build sample app only
- `deno task dev:sample` - Run sample app in development mode

## License

MIT License
