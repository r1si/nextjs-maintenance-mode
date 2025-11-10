# Maintenance Mode Library

A reusable, file-based maintenance mode system 🏗️ for Next.js applications with support for scheduled time windows and live countdown ⏱️

## Features

- ✅ **Runtime Configuration**: No deployment needed - edit `maintenance.json` and changes take effect immediately
- ⏰ **Time-based Scheduling**: Define maintenance windows with `startTime` and `endTime`
- ⏱️ **Live Countdown**: Automatic countdown display until maintenance ends
- 🔄 **Auto-redirect**: Automatically redirects users back when maintenance ends
- 🛡️ **Type-safe**: Full TypeScript support with strict types
- 🚀 **Zero Dependencies**: Uses only Node.js built-ins and React

## Installation

```bash
npm install nextjs-maintenance-mode
```

**Requirements:**
- Next.js 16.0.0 or higher
- React 18.0.0 or higher
- Node.js 18.0.0 or higher

## Quick Start

### 1. Create Configuration File

Create `public/maintenance.json` in your project root:

```json
{
  "enabled": false,
  "message": "We are performing scheduled maintenance. We'll be back soon!"
}
```

### 2. Set Up Proxy

Create or update `proxy.ts` in your project root:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { readMaintenanceConfig, isMaintenanceActive } from 'nextjs-maintenance-mode/config'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip maintenance check for maintenance page, API routes, and static files
  if (
    pathname.startsWith('/maintenance') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/')
  ) {
    return NextResponse.next()
  }

  // Check if maintenance is active
  const config = readMaintenanceConfig('public/maintenance.json', { silent: true })

  if (isMaintenanceActive(config)) {
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  return NextResponse.next()
}
```

### 3. Create API Route

Create `app/api/maintenance-status/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getMaintenanceStatus } from 'nextjs-maintenance-mode/config'

export async function GET() {
  const status = getMaintenanceStatus('public/maintenance.json')
  return NextResponse.json(status)
}
```

### 4. Create Maintenance Page

Create `app/maintenance/page.tsx`:

```typescript
'use client'

import { useMaintenanceStatus, useCountdown, formatCountdown } from 'nextjs-maintenance-mode/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MaintenancePage() {
  const router = useRouter()
  const { status, isLoading } = useMaintenanceStatus()
  const countdown = useCountdown(status?.config?.endTime)
  const timeRemaining = formatCountdown(countdown)

  // Auto-redirect when maintenance ends
  useEffect(() => {
    if (status && !status.active) {
      router.push('/')
    }
  }, [status, router])

  return (
    <div>
      <h1>Under Maintenance</h1>
      <p>{status?.config?.message}</p>
      {timeRemaining && <p>Back in: {timeRemaining}</p>}
    </div>
  )
}
```

### 5. Test It!

Set `"enabled": true` in `public/maintenance.json` and refresh your app - you'll be redirected to the maintenance page!

**See the [example folder](./example) for a complete working implementation.**

---

## Usage

### 1. Configuration File

Create or edit `public/maintenance.json`:

```json
{
    "enabled": true,
    "startTime": "2025-01-15T10:00:00Z",
    "endTime": "2025-01-15T12:00:00Z",
    "message": "We are performing scheduled maintenance. We'll be back soon!"
}
```

**Fields:**

- `enabled` (required): Master switch for maintenance mode
- `startTime` (optional): ISO 8601 date when maintenance starts
- `endTime` (optional): ISO 8601 date when maintenance ends
- `message` (optional): Custom message to display

---

## Decision Logic

The system uses a **priority-based decision logic** to determine if maintenance is active:

### Priority Rules

1. **`enabled=false` has ABSOLUTE PRIORITY** → Maintenance is OFF, regardless of time window
2. **Time window is checked ONLY if `enabled=true`**
3. **If no `startTime`** → Maintenance starts immediately (when enabled)
4. **If no `endTime`** → Maintenance continues indefinitely (when enabled)
5. **If file is missing or invalid** → Safe default: maintenance is disabled

### Decision Matrix

| enabled | startTime | endTime | Current Time | Status | Notes                     |
| ------- | --------- | ------- | ------------ | ------ | ------------------------- |
| `false` | -         | -       | -            | ❌ OFF | Disabled manually         |
| `false` | set       | set     | inside range | ❌ OFF | Disabled even if in range |
| `true`  | -         | -       | -            | ✅ ON  | Indefinite maintenance    |
| `true`  | future    | future  | now          | ❌ OFF | Not started yet           |
| `true`  | past      | future  | now          | ✅ ON  | Active in time window     |
| `true`  | past      | past    | now          | ❌ OFF | Already ended             |

### Behavior Flow

```
Request arrives
    ↓
Read maintenance.json
    ↓
enabled = false? → YES → Maintenance OFF (allow access)
    ↓ NO
startTime exists? → YES → now < startTime? → YES → Maintenance OFF
    ↓ NO                     ↓ NO
endTime exists? → YES → now > endTime? → YES → Maintenance OFF
    ↓ NO                   ↓ NO
Maintenance ON (redirect to /maintenance)
```

---

## Common Scenarios

### Scenario 1: Immediate Indefinite Maintenance

**Use case:** Emergency maintenance, no planned end time

```json
{
    "enabled": true,
    "message": "Emergency maintenance in progress. We'll be back as soon as possible."
}
```

**Behavior:**

- ✅ Activates **immediately** upon saving the file
- ✅ Stays active **indefinitely** until you set `enabled: false`
- ✅ No automatic end time

---

### Scenario 2: Scheduled Maintenance with Auto-Start/Stop

**Use case:** Planned maintenance window (e.g., database upgrade at 2 AM)

```json
{
    "enabled": true,
    "startTime": "2025-01-20T02:00:00Z",
    "endTime": "2025-01-20T04:00:00Z",
    "message": "Scheduled maintenance: Database upgrade in progress"
}
```

**Behavior:**

- ❌ Before 2:00 AM → Site is **active** (maintenance not started yet)
- ✅ Between 2:00-4:00 AM → Site is **in maintenance** (auto-activated)
- ❌ After 4:00 AM → Site is **active** (auto-deactivated)
- 🤖 **Fully automatic** - no manual intervention needed!

---

### Scenario 3: Prepare Future Maintenance (Without Activating)

**Use case:** Schedule maintenance for tomorrow but keep site active now

```json
{
    "enabled": false,
    "startTime": "2025-01-20T02:00:00Z",
    "endTime": "2025-01-20T04:00:00Z",
    "message": "Scheduled maintenance"
}
```

**Behavior:**

- ❌ Site remains **active** (enabled=false has priority)
- ⚠️ Maintenance will **NOT auto-start** even when reaching startTime
- 💡 To activate: change `enabled` to `true` before startTime

---

### Scenario 4: Cancel Scheduled Maintenance Early

**Use case:** Maintenance window was 2-4 AM, but you finish at 3 AM

```json
{
    "enabled": false,
    "startTime": "2025-01-20T02:00:00Z",
    "endTime": "2025-01-20T04:00:00Z"
}
```

**Behavior:**

- ❌ Even though we're **inside the time window**, `enabled=false` stops maintenance
- ✅ Site becomes **immediately accessible** again
- 💡 This overrides the scheduled endTime

---

### Scenario 5: Disable Maintenance

**Use case:** Normal operation, no maintenance

```json
{
    "enabled": false
}
```

**Behavior:**

- ❌ Maintenance is **OFF**
- ✅ Site is **fully accessible**
- 💡 This is the default/normal state

---

### Scenario 6: Extend Maintenance Beyond Scheduled Time

**Use case:** Maintenance was planned until 4 AM, but you need more time

**Option A - Remove endTime:**

```json
{
    "enabled": true,
    "startTime": "2025-01-20T02:00:00Z",
    "message": "Maintenance extended - no estimated end time"
}
```

**Option B - Update endTime:**

```json
{
    "enabled": true,
    "startTime": "2025-01-20T02:00:00Z",
    "endTime": "2025-01-20T06:00:00Z",
    "message": "Maintenance extended until 6 AM"
}
```

---

## Key Takeaways

✅ **`enabled=false` is your emergency OFF switch** - works instantly regardless of schedule

✅ **Time windows are automatic** - set startTime/endTime and forget it

✅ **No restart needed** - all changes to JSON take effect immediately

✅ **Safe by default** - missing or invalid file = no maintenance

❌ **Don't use time windows with `enabled=false`** - they won't activate automatically

### 2. Server-side (proxy.ts, API routes)

**⚠️ IMPORTANT:** Server-side code must import from `/config` to avoid bundling Node.js modules in client bundles.

```typescript
// ✅ CORRECT - Import from /config for server-side
import { readMaintenanceConfig, isMaintenanceActive } from "@/lib/maintenance/config";

// In proxy.ts
export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Skip maintenance check for maintenance page and APIs
    if (!pathname.startsWith("/maintenance") && !pathname.startsWith("/api/")) {
        const config = readMaintenanceConfig("public/maintenance.json", { silent: true });

        if (isMaintenanceActive(config)) {
            return NextResponse.redirect(new URL("/maintenance", request.url));
        }
    }

    return NextResponse.next();
}

// In API routes
import { getMaintenanceStatus } from "@/lib/maintenance/config";
import type { MaintenanceStatus } from "@/lib/maintenance/types";

export async function GET() {
    const status = getMaintenanceStatus();
    return NextResponse.json(status);
}
```

### 3. Client-side (React components)

**⚠️ IMPORTANT:** Client components must import from `/client` to avoid including Node.js dependencies.

```typescript
"use client"

// ✅ CORRECT - Import from /client for client components
import { useMaintenanceStatus, useCountdown, formatCountdown } from "@/lib/maintenance/client";

export default function MaintenancePage() {
  // Auto-polls API every 30 seconds
  const { status, isLoading } = useMaintenanceStatus()

  // Live countdown to endTime
  const countdown = useCountdown(status?.config?.endTime)

  // Format for display: "2h 30m" or "45m 30s"
  const timeRemaining = formatCountdown(countdown)

  return (
    <div>
      <h1>Under Maintenance</h1>
      {timeRemaining && <p>Estimated completion: {timeRemaining}</p>}
    </div>
  )
}
```

## API Reference

### Server Functions

#### `readMaintenanceConfig(filePath?, options?)`

Reads and validates maintenance config from filesystem.

```typescript
const config = readMaintenanceConfig("public/maintenance.json", {
    silent: true, // Don't log errors
});
```

---

#### `isMaintenanceActive(config)`

Checks if maintenance is currently active based on time window.

```typescript
if (isMaintenanceActive(config)) {
    // Maintenance is active
}
```

---

#### `getMaintenanceStatus(filePath?)`

Gets complete status with reason (useful for debugging).

```typescript
const status = getMaintenanceStatus();
// { active: true, config: {...}, reason: "Maintenance active until..." }
```

### Client Hooks

#### `useMaintenanceStatus(options?)`

Fetches status from API with auto-polling.

```typescript
const { status, isLoading, error, refetch } = useMaintenanceStatus({
    pollInterval: 30000, // ms
    autoPoll: true,
});
```

#### `useCountdown(endTime?)`

Live countdown hook that updates every second.

```typescript
const countdown = useCountdown("2025-01-15T12:00:00Z");
// { days, hours, minutes, seconds, totalSeconds }
```

#### `formatCountdown(countdown)`

Formats countdown object as human-readable string.

```typescript
formatCountdown({ days: 0, hours: 2, minutes: 30, seconds: 45 });
// "2h 30m"
```

## How It Works

### Proxy Flow (Every Request)

**Important:** The proxy reads `maintenance.json` on **every single request**, which enables:

- ✅ **Instant activation** when you edit the file
- ✅ **Auto-start** when reaching `startTime`
- ✅ **Auto-stop** when reaching `endTime`
- ✅ **No caching issues** or stale state

**Flow:**

1. User requests any page (e.g., `/dashboard`)
2. `proxy.ts` reads `maintenance.json` from filesystem
3. Validates config structure (returns safe default if invalid)
4. Checks if `enabled=false` → **allow access**
5. Checks if outside time window → **allow access**
6. Otherwise → **redirect to `/maintenance`**

### Maintenance Page Flow

1. Page loads and calls `/api/maintenance-status`
2. Displays custom message (or fallback to i18n translations)
3. Shows live countdown if `endTime` is set (updates every second)
4. **Auto-polls API every 30 seconds** to check if maintenance ended
5. When status becomes `active: false` → **auto-redirects to home**

**Result:** Users are automatically sent back to the site when:

- Maintenance `endTime` is reached
- You manually set `enabled: false`

### Loop Prevention

The proxy explicitly excludes:

- `/maintenance` (the page itself)
- `/api/*` (all API routes)
- Static assets (`_next/static`, `_next/image`, etc.)

## Migrating from MAINTENANCE_MODE

**Before** (env-based):

```bash
# .env
MAINTENANCE_MODE=true
```

**After** (JSON-based):

```json
{
    "enabled": true,
    "endTime": "2025-01-15T12:00:00Z"
}
```

**Benefits:**

- ✅ No deployment needed to change status
- ✅ Scheduled maintenance windows
- ✅ Live countdown display
- ✅ Automatic end of maintenance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
