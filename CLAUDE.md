# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **React 19** with TypeScript
- **Vite** - Build tool and dev server
- **shadcn/ui** - UI component library built on Radix UI primitives
- **Tailwind CSS v4** - Styling with `@tailwindcss/vite` plugin
- **React Router v7** - Client-side routing
- **MSW (Mock Service Worker)** - API mocking for development

## MCP Servers

This project is configured with the shadcn/ui MCP server for adding components:
- Configuration: `.mcp.json` in project root
- After restarting Claude Code, use `/mcp` to verify the shadcn server is connected
- Use natural language to browse, search, and install shadcn/ui components

## Common Commands

### Development
- `npm install` - Install dependencies
- `npm run dev` - Start development server with Vite
- `npm run build` - TypeScript compilation + production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### GitHub Pages Deployment
- `npm run build:gh` - Build for GitHub Pages (sets base URL and enables hash routing)

## Architecture

### Router Configuration
- App supports two routing modes via `VITE_USE_HASH_ROUTE` env var:
  - `false` (default): BrowserRouter for standard SPA routing
  - `true`: HashRouter for GitHub Pages deployment
- Router selection happens in `src/App.tsx:5`
- All routes defined in `src/Router.tsx` under `<AppLayout />` wrapper

### Layout Structure
- `src/components/app-layout.tsx` - Root layout with header, content area, and footer
- Uses Outlet from react-router for nested route rendering
- Responsive layout with max-width container (max-w-7xl)

### Configuration System
- `src/config/app.ts` - App metadata and GitHub info, reads `VITE_APP_NAME` and `VITE_BASE_URL` from env
- `src/config/menu.ts` - Navigation menu structure with icons from lucide-react
- Menu items support nested routes via `items` array

### Theme System
- `src/contexts/ThemeContext.tsx` - Global theme management
- Supports "light", "dark", and "system" modes
- Persists theme preference to localStorage with key "shadcn-ui-theme"
- System theme auto-detects via `prefers-color-scheme` media query

### Component Organization
- `src/components/ui/` - shadcn/ui primitives (button, card, etc.)
- `src/components/` - App-specific components (header, sidebar, etc.)
- `src/pages/` - Route components
- `src/types/` - TypeScript type definitions
- `src/services/api/` - API service layer for data fetching
- `src/mocks/` - MSW mock API setup and mock data
- Path alias `@/*` maps to `src/*` (configured in vite.config.ts and tsconfig.json)

### Mock API System
- **MSW (Mock Service Worker)** provides centralized API mocking
- All mock data centralized in `src/mocks/data/`
- API handlers defined in `src/mocks/handlers.ts`
- Service layer in `src/services/api/` provides typed API client functions
- Toggle mocking via `VITE_USE_MOCK_API` environment variable
- See `docs/QUICK_START.md` to get started or `docs/MOCK_API_SETUP.md` for detailed documentation

### Environment Variables
- `VITE_BASE_URL` - Base URL for deployment (default: "/")
- `VITE_USE_HASH_ROUTE` - Enable hash routing (default: false)
- `VITE_APP_NAME` - Application name (default: "UI Builder")
- `VITE_USE_MOCK_API` - Enable MSW mock API (default: true for development)

## GitHub Pages Setup
The repository includes a GitHub Actions workflow (`.github/workflows/build-and-deploy.yml`) for deploying to gh-pages branch. Currently set to manual trigger (`workflow_dispatch`). To enable auto-deploy on push to main, uncomment the push trigger in the workflow file.

## Git Commit Guidelines
- Commit messages should NOT mention Claude or AI assistance !IMPORTANT
- Focus commit messages on what was changed and why, not how it was created
