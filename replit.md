# Workspace

## Overview

APKMONZA — a curated catalog website for modified apps and games. Full-stack application with a public catalog, app detail pages, and an admin panel for managing mods.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Design System

- **Style**: Neo brutalism
- **Visual language**: off-white dotted background, white panels, thick black borders, hard offset shadows, blocky typography, sharp square corners
- **Accent colors**: yellow primary, purple brand/status, teal highlights, red destructive actions

## Features

- **Public Catalog** (`/`): Browse modified apps/games with search and type filtering
- **App Detail** (`/app/:id`): Full details with mod features, description, tech specs
- **Admin Panel** (`/admin`): Dashboard stats, manage mods (create, edit, delete)

## Data Model

- **apps** table: id (uuid), name, packageName, version, size, type (GAME/APP), category, status (ONLINE/OFFLINE), description, modFeatures, iconInitials, iconColor, createdAt, updatedAt

## API Endpoints

- `GET /api/apps` — list apps with optional filters (search, type, category, status)
- `POST /api/apps` — create a new app
- `GET /api/apps/stats` — get dashboard statistics
- `GET /api/apps/:id` — get app by ID
- `PUT /api/apps/:id` — update an app
- `DELETE /api/apps/:id` — delete an app

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
