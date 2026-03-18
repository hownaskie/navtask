# NavTask Frontend

Frontend application for NavTask, built with React, TypeScript, Vite, and MUI.

NavTask lets users authenticate, create/update tasks, manage subtasks and attachments, and track task progress through dashboard and detail views.

## Tech Stack

- React 19
- TypeScript
- Vite
- Material UI (`@mui/material`, `@mui/icons-material`)
- React Router
- Axios
- ESLint (flat config)

## Features

- Authentication flow
  - Login, signup
  - OAuth callback support
  - Protected routes + guest-only routes

- Task management
  - List tasks in dashboard table
  - Add task
  - Edit task
  - View task details
  - Delete selected tasks (UI-triggered)

- Subtasks and progress
  - Add/remove/edit subtasks
  - Subtask status handling
  - Status-based progress display:
    - `In Progress` => quarter progress
    - `Completed` => full progress
    - `Cancelled` => cancelled icon treatment

- Attachments
  - Drag/drop or browse in task forms
  - Existing attachments displayed in edit/view flows

- Filtering and sorting
  - Dashboard filtering by priority/status
  - Route-aware + status-aware sorting utilities

## Project Structure

```text
src/
  components/      Reusable UI building blocks
  constants/       Shared constants (colors, labels, rank maps)
  context/         Auth context/provider
  hooks/           Reusable hooks (task/auth state + API)
  interfaces/      API request/response contracts
  pages/           Route-level pages
  routes/          Route registry + route groups
  services/        Axios API clients
  types/           Shared frontend union/value types
  utils/           Formatting, filtering, sorting, progress helpers
```

## Prerequisites

- Node.js 18+
- npm 9+
- Backend service running at `http://localhost:8080`

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Open app

```text
http://localhost:5173
```

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check and build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Backend Integration

- Frontend API base URL: `/api/v1` (configured in `src/services/api.ts`)
- Vite dev proxy forwards `/api/*` to:
  - `http://localhost:8080`

This means you can run frontend on `:5173` and backend on `:8080` without CORS setup in local dev.

## Authentication and Routing

- Route configuration is centralized under `src/routes`
- `ProtectedRoute` guards authenticated pages
- `GuestRoute` prevents authenticated users from accessing login/signup pages

Default route behavior:

- `/` redirects to `/login`
- `*` routes render Not Found page

## Notes for Local Full-Stack Run

If you are running the backend from the sibling project (`navtask-microservice`), start it first (for example with Docker Compose), then run this frontend.

Backend docs (from microservice project):

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- API base: `http://localhost:8080/api/v1`

## Build Output

Production assets are generated in `dist/` after:

```bash
npm run build
```
