# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Deno-based TypeScript project called "diorama-bg" that creates parallax/diorama background effects using HTML5 Canvas. The project is currently undergoing a major refactoring from using multiple canvases (one per layer) to a single canvas approach for better performance.

## Key Commands

### Development
```bash
# Run the sample application in development mode
deno task dev:sample

# Type check the library
cd lib && deno task build

# Run tests
cd lib && deno task test

# Format code
deno fmt

# Lint code
deno lint
```

### Building
```bash
# Build everything (library + sample)
deno task build

# Build and bundle the sample application
cd sample/basic && deno task build
```

### Docker
```bash
# Run the basic sample with Docker
deno task docker:basic

# Development with watch mode
deno task docker:basic:watch

# Stop all containers
deno task docker:down
```

## Architecture

### Core Components

1. **Canvas Factory** (`lib/src/canvas/`)
   - Creates and manages canvas elements
   - Handles canvas sizing and positioning

2. **Diorama Controller** (`lib/src/diorama/`)
   - Main orchestrator for the parallax effect
   - Manages layers and rendering

3. **Layer System** (`lib/src/layers/`)
   - `BaseLayer` - Abstract base class for all layers
   - `ImageLayer` - Concrete implementation for image-based layers
   - Handles individual layer rendering and transformations

### Current Refactoring Task

The codebase is being refactored from multiple canvases to a single canvas approach. See `/plan/single-canvas-plan.md` for the detailed implementation plan. Key changes include:
- Single shared canvas for all layers
- Centralized render loop in Diorama class
- Layers draw to a shared context instead of managing their own canvases
- Better performance through reduced DOM manipulation

## AI Assistant Procedures

This project includes specific procedure rules for different types of tasks:

### Research Procedure
When analyzing or understanding code without modifications, read `./.claude/rules/research-procedure.md`

### Coding Procedure
When modifying code, read `./.claude/rules/coding-procedure.md`. Key steps:
1. Review existing code patterns
2. Create task list with implementation plan
3. Execute the task list
4. Review work for cleanliness and correctness
5. Test the result
6. Clean up temporary files

### Debug Procedure
When debugging issues, read `./.claude/rules/debug-procedure.md`

## Important Guidelines

- **Always use TodoWrite tool** to plan and track tasks when working on features
- **Check existing patterns** before implementing new code
- **Run type checking** after code changes: `cd lib && deno task build`
- **Test your changes** with the sample application: `deno task dev:sample`
- **Follow existing code style** - the project uses strict TypeScript with comprehensive compiler options
- **No external npm dependencies** - this is a pure Deno project using only Deno standard library

## Testing Approach

- Unit tests use Deno's built-in test runner with `@std/assert`
- Run tests with: `cd lib && deno test`
- Tests are located alongside source files with `_test.ts` suffix
- Always verify changes don't break existing tests

## Browser Compatibility

The project targets modern browsers with:
- ES2022 features
- DOM and DOM Iterable APIs
- Canvas 2D rendering context