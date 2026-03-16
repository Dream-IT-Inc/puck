# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Puck

Puck is an open-source visual editor for React. Users drag-and-drop custom React components to build pages. It provides two main exports: `<Puck>` (the editor) and `<Render>` (renders saved data without the editor UI).

## Monorepo Layout

- **packages/core** — The main `@measured/puck` package (editor, renderer, store, types)
- **packages/create-puck-app** — CLI scaffolding tool
- **packages/plugin-\*** — Official plugins (emotion-cache, heading-analyzer)
- **packages/field-contentful** — Contentful CMS field integration
- **apps/demo** — Next.js 15 demo app (primary dev environment)
- **apps/docs** — Nextra-based documentation site
- **recipes/** — Framework examples (Next.js, Remix, React Router)

Package manager: **Yarn 1.x**. Build orchestration: **Turborepo**.

## Common Commands

```bash
# Development
yarn                    # Install all dependencies
yarn dev                # Start demo app (Next.js dev server)

# Build & Quality
yarn build              # Build all packages (turborepo)
yarn test               # Run Jest tests across monorepo
yarn lint               # ESLint all TypeScript files
yarn format:check       # Prettier check
yarn format             # Prettier fix

# E2E
yarn smoke              # Puppeteer smoke tests

# Single package test
cd packages/core && yarn test           # Core tests only
cd packages/core && npx jest path/to/file.test.tsx  # Single test file
```

## Core Architecture

### State Management
Zustand store (`packages/core/store/`) with slice pattern (history, fields, permissions, nodes). Accessed via `useAppStore` hook. State mutations go through a Redux-style reducer (`packages/core/reducer/`) with actions like insert, remove, move, reorder, set-data, set-ui.

### Component Config
Users define a `Config` object mapping component names to `ComponentConfig` entries. Each entry has: `render` (React component), `fields` (editable properties), `defaultProps`, `permissions`, and optional resolvers (`resolveFields`, `resolveData`, `resolvePermissions`) for dynamic behavior.

### Field Types
text, number, textarea, select, radio, array, object, external (data source), custom (render function), slot (nested drop zones for child components).

### Drag & Drop
Built on `@dnd-kit/react`. Key pieces: `DragDropContext`, `DraggableComponent`, `DropZone`, and a custom collision detector (`createDynamicCollisionDetector`).

### Rendering Isolation
The editor renders components inside an iframe via `AutoFrame`. This isolates component styles from the editor UI.

### Plugin System
Plugins can provide `overrides` (swap UI components) and `fieldTransforms` (modify field definitions).

## Code Conventions

- **TypeScript** everywhere — avoid `any`
- **CSS Modules** with SUIT CSS naming (`PuckComponentName-subElement--modifier`). No global styles to prevent conflicts in host apps.
- **Conventional commits** required: `type(scope): description` (e.g., `feat(core):`, `fix(demo):`)
- ESLint intentionally disables `react-hooks/exhaustive-deps`

## Testing

- Jest + ts-jest + jsdom + @testing-library/react
- Core Jest config: `packages/core/jest.config.ts`
- CSS modules are stubbed with identity-obj-proxy in tests

## Key Entry Points

- `packages/core/bundle/index.ts` — Main package exports
- `packages/core/components/Puck/index.tsx` — Editor component
- `packages/core/components/Render/index.tsx` — Viewer component
- `packages/core/store/index.ts` — Zustand store setup
- `packages/core/reducer/` — State reducer and actions
- `packages/core/types/` — All TypeScript type definitions
