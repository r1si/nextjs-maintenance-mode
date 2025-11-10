# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**nextjs-maintenance-mode** is a reusable npm package that provides file-based maintenance mode for Next.js 16+ applications with time scheduling, live countdown, and auto-redirect capabilities.

## Build and Development Commands

```bash
# Build the library (compiles TypeScript to dist/)
npm run build

# Clean build artifacts
npm run clean

# Prepare for publishing (runs build automatically)
npm run prepublishOnly
```

## Architecture

### Module Structure and Import Boundaries

This library uses **strict separation** between server and client code to prevent Node.js modules from being bundled in client-side code:

- **`src/config.ts`**: Server-side only (uses Node.js `fs` and `path` modules). Imported via `/config` export.
- **`src/client.ts`**: Client-side only (uses React hooks). Imported via `/client` export.
- **`src/types.ts`**: Shared types. Imported via `/types` export.
- **`src/index.ts`**: Main entry point that re-exports everything.

**Critical:** Consumers must import from the correct subpath:
- Server code (proxy.ts, API routes): `import { ... } from 'nextjs-maintenance-mode/config'`
- Client code (React components): `import { ... } from 'nextjs-maintenance-mode/client'`

### Core Logic Flow

1. **Request Interception (proxy.ts)**:
   - Every request reads `public/maintenance.json` synchronously from filesystem
   - Validates config structure, returns `{ enabled: false }` if invalid/missing
   - Checks `enabled` flag first (absolute priority)
   - If enabled, validates time window (startTime/endTime)
   - Redirects to `/maintenance` if maintenance is active

2. **Decision Priority**:
   - `enabled: false` → maintenance OFF (overrides everything)
   - `enabled: true` + no times → maintenance ON indefinitely
   - `enabled: true` + times → maintenance ON only within window

3. **Client-side Behavior**:
   - Maintenance page polls `/api/maintenance-status` every 30 seconds
   - Displays countdown if `endTime` is set (updates every second)
   - Auto-redirects to home when maintenance ends

### Key Functions

**Server-side (config.ts)**:
- `readMaintenanceConfig(filePath, options)`: Reads and validates maintenance.json
- `isMaintenanceActive(config)`: Checks enabled flag + time window
- `getMaintenanceStatus(filePath)`: Returns full status with reason (for API routes)

**Client-side (client.ts)**:
- `useMaintenanceStatus(options)`: React hook that polls API for status
- `useCountdown(endTime)`: React hook for live countdown (updates every second)
- `formatCountdown(countdown)`: Formats time remaining as "2h 30m" or "45m 30s"

## Package.json Exports

The package uses conditional exports for proper module separation:

```json
{
  ".": "./dist/index.js",           // Main entry
  "./config": "./dist/config.js",   // Server-side only
  "./client": "./dist/client.js",   // Client-side only
  "./types": "./dist/types.js"      // Shared types
}
```

## Example Implementation

See the `example/` folder for a complete working Next.js app demonstrating:
- `example/proxy.ts`: Middleware implementation
- `example/app/api/maintenance-status/route.ts`: API route
- `example/app/maintenance/page.tsx`: Maintenance page with countdown
- `example/public/maintenance.json`: Configuration file

## Configuration Schema

```typescript
type MaintenanceConfig = {
  enabled: boolean              // Master switch (absolute priority)
  startTime?: string           // ISO 8601 date (optional)
  endTime?: string             // ISO 8601 date (optional)
  message?: string             // Custom message (optional)
}
```

## Common Development Patterns

### When adding new features:
- Server-side logic goes in `config.ts` (must work in Next.js middleware)
- Client-side React logic goes in `client.ts`
- Shared types go in `types.ts`
- Update `index.ts` to re-export new functionality

### When modifying validation:
- All validation logic is in `validateMaintenanceConfig()` in config.ts
- Invalid configs default to `{ enabled: false }` (safe default)

### When testing time-based logic:
- `isInMaintenanceWindow()` handles all time window checks
- Invalid ISO 8601 dates are logged but ignored (graceful degradation)
- Current time comparisons use `new Date()` directly
