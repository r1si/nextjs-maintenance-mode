# Context7 Documentation - nextjs-maintenance-mode

Complete integration guide for `nextjs-maintenance-mode` in Next.js 16+ applications.

## Installation

```bash
npm install nextjs-maintenance-mode
```

**Requirements:**
- Next.js 16.0.0+
- React 18.0.0+
- Node.js 18.0.0+

---

## Complete Integration

### 1. Configuration File

Create `public/maintenance.json`:

```json
{
  "enabled": false,
  "message": "We are performing scheduled maintenance. We'll be back soon!",
  "startTime": "",
  "endTime": ""
}
```

### 2. Proxy Setup (Next.js 16)

**File:** `proxy.ts` (project root)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { readMaintenanceConfig, isMaintenanceActive } from 'nextjs-maintenance-mode/config'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip maintenance check for:
  // - Maintenance page itself
  // - API routes
  // - Static files and Next.js internals
  if (
    pathname.startsWith('/maintenance') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Read maintenance configuration from filesystem
  const config = readMaintenanceConfig('public/maintenance.json', { silent: true })

  // Check if maintenance is active based on time window
  if (isMaintenanceActive(config)) {
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  return NextResponse.next()
}

// Optional: Configure matcher for better performance
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

**Important Notes:**
- ✅ Use `nextjs-maintenance-mode/config` for server-side code
- ✅ In Next.js 16, the file is named `proxy.ts` (not `middleware.ts`)
- ✅ The function is named `proxy()` (not `middleware()`)
- ⚠️ The config is read on **every request** for real-time updates

### 3. API Route

**File:** `app/api/maintenance-status/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getMaintenanceStatus } from 'nextjs-maintenance-mode/config'

export async function GET() {
  try {
    // Get complete status with reason
    const status = getMaintenanceStatus('public/maintenance.json')

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error fetching maintenance status:', error)

    // Return safe default on error
    return NextResponse.json(
      {
        active: false,
        config: null,
        reason: 'Error reading maintenance configuration',
      },
      { status: 500 }
    )
  }
}
```

**Response Format:**

```typescript
{
  active: boolean
  config: {
    enabled: boolean
    message?: string
    startTime?: string
    endTime?: string
  } | null
  reason: string
}
```

### 4. Maintenance Page

**File:** `app/maintenance/page.tsx`

```typescript
'use client'

import { useMaintenanceStatus, useCountdown, formatCountdown } from 'nextjs-maintenance-mode/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MaintenancePage() {
  const router = useRouter()

  // Fetch status and auto-poll every 30 seconds
  const { status, isLoading, error, refetch } = useMaintenanceStatus({
    pollInterval: 30000,
    autoPoll: true,
  })

  // Live countdown to endTime (updates every second)
  const countdown = useCountdown(status?.config?.endTime)

  // Format countdown as human-readable string
  const timeRemaining = formatCountdown(countdown)

  // Auto-redirect when maintenance is no longer active
  useEffect(() => {
    if (status && !status.active) {
      console.log('Maintenance ended, redirecting to homepage...')
      router.push('/')
    }
  }, [status, router])

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Error</h1>
        <p>Unable to fetch maintenance status</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🛠️ Under Maintenance</h1>

      <p style={{ fontSize: '1.2rem', margin: '2rem 0' }}>
        {status?.config?.message || 'We are performing scheduled maintenance. We\'ll be back soon!'}
      </p>

      {timeRemaining && (
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '1.5rem',
          borderRadius: '8px',
          margin: '2rem auto',
          maxWidth: '400px'
        }}>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>Estimated completion in:</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0070f3', margin: 0 }}>
            {timeRemaining}
          </p>
        </div>
      )}

      <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#999' }}>
        This page will automatically refresh when maintenance is complete.
      </p>
    </div>
  )
}
```

**Important Notes:**
- ✅ Use `'use client'` directive (client component)
- ✅ Use `nextjs-maintenance-mode/client` for client-side code
- ✅ Auto-polling happens every 30 seconds by default
- ✅ Countdown updates every second
- ⚠️ Do NOT import from `/config` in client components

---

## Common Patterns

### Pattern 1: Emergency Maintenance (Immediate, Indefinite)

**Use case:** Something broke, need to take site down NOW

```json
{
  "enabled": true,
  "message": "Emergency maintenance in progress. We'll be back as soon as possible."
}
```

**Behavior:**
- ✅ Activates **immediately** upon saving
- ✅ Stays active **indefinitely** until you set `enabled: false`
- ✅ No countdown shown (no endTime)

### Pattern 2: Scheduled Maintenance (Auto Start/Stop)

**Use case:** Database upgrade scheduled for 2 AM - 4 AM

```json
{
  "enabled": true,
  "startTime": "2025-01-20T02:00:00Z",
  "endTime": "2025-01-20T04:00:00Z",
  "message": "Scheduled maintenance: Database upgrade in progress"
}
```

**Behavior:**
- ❌ Before 2:00 AM → Site is **active**
- ✅ Between 2:00-4:00 AM → Site is **in maintenance**
- ❌ After 4:00 AM → Site is **active** again
- 🤖 Fully automatic, no manual intervention needed

### Pattern 3: Early Cancellation

**Use case:** Finished maintenance at 3 AM but scheduled until 4 AM

```json
{
  "enabled": false,
  "startTime": "2025-01-20T02:00:00Z",
  "endTime": "2025-01-20T04:00:00Z"
}
```

**Behavior:**
- ✅ Even though we're inside the time window, `enabled=false` has priority
- ✅ Site becomes **immediately accessible**
- 💡 This overrides the scheduled endTime

### Pattern 4: Extended Maintenance

**Use case:** Need more time than planned

```json
{
  "enabled": true,
  "startTime": "2025-01-20T02:00:00Z",
  "endTime": "2025-01-20T06:00:00Z",
  "message": "Maintenance extended until 6 AM due to complications"
}
```

Or remove `endTime` entirely for indefinite:

```json
{
  "enabled": true,
  "startTime": "2025-01-20T02:00:00Z",
  "message": "Maintenance extended - no estimated end time"
}
```

---

## Troubleshooting

### Issue 1: "Cannot find module 'fs'" in Browser

**Symptom:** Error when importing maintenance functions in client components

**Cause:** Importing from `/config` in client component (includes Node.js `fs` module)

**Solution:**

```typescript
// ❌ WRONG - Don't do this in client components
import { readMaintenanceConfig } from 'nextjs-maintenance-mode/config'

// ✅ CORRECT - Use client-only functions
import { useMaintenanceStatus } from 'nextjs-maintenance-mode/client'
```

**Rule of thumb:**
- `proxy.ts` and API routes → use `/config`
- React components with `'use client'` → use `/client`

---

### Issue 2: Changes to maintenance.json Not Taking Effect

**Symptom:** Updated `enabled: true` but site still accessible

**Possible causes:**

1. **Browser cache:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **File not saved:** Check file is actually saved to disk
3. **Wrong path:** Verify `public/maintenance.json` exists (not `maintenance.json` in root)
4. **Syntax error:** JSON must be valid (use a JSON validator)

**Debug steps:**

```typescript
// Add logging to proxy.ts
const config = readMaintenanceConfig('public/maintenance.json', { silent: false })
console.log('Maintenance config:', config)
console.log('Is active:', isMaintenanceActive(config))
```

---

### Issue 3: Time Zone Confusion

**Symptom:** Maintenance activates at wrong time

**Cause:** Time zone mismatch

**Solution:** Always use **UTC timestamps** in ISO 8601 format:

```json
{
  "enabled": true,
  "startTime": "2025-01-20T02:00:00Z",  // ← The "Z" means UTC
  "endTime": "2025-01-20T04:00:00Z"
}
```

To convert local time to UTC:

```javascript
const localDate = new Date('2025-01-20 02:00:00')
const utcString = localDate.toISOString()
console.log(utcString) // "2025-01-20T02:00:00.000Z"
```

---

### Issue 4: Maintenance Page Keeps Redirecting

**Symptom:** Cannot access `/maintenance` page, infinite redirect loop

**Cause:** Proxy is redirecting maintenance page itself

**Solution:** Ensure proxy skips `/maintenance`:

```typescript
if (pathname.startsWith('/maintenance')) {
  return NextResponse.next()  // ← Don't redirect maintenance page
}
```

---

### Issue 5: TypeScript Type Errors

**Symptom:** TypeScript complains about missing types

**Solution:** Ensure types are properly exported in package:

```typescript
import type { MaintenanceConfig, MaintenanceStatus } from 'nextjs-maintenance-mode/types'

const config: MaintenanceConfig = {
  enabled: true,
  message: 'Test'
}
```

---

## Advanced Usage

### Custom Polling Interval

```typescript
const { status } = useMaintenanceStatus({
  pollInterval: 10000,  // Poll every 10 seconds instead of 30
  autoPoll: true,
})
```

### Manual Refetch

```typescript
const { status, refetch } = useMaintenanceStatus({
  autoPoll: false,  // Disable auto-polling
})

// Manually trigger refresh
<button onClick={() => refetch()}>Check Status</button>
```

### Custom Countdown Display

```typescript
const countdown = useCountdown(endTime)

if (countdown) {
  return (
    <div>
      {countdown.days > 0 && <span>{countdown.days}d </span>}
      {countdown.hours > 0 && <span>{countdown.hours}h </span>}
      {countdown.minutes}m {countdown.seconds}s
    </div>
  )
}
```

---

## Migration from Environment Variables

**Old approach (environment-based):**

```bash
# .env
MAINTENANCE_MODE=true
```

```typescript
const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'
```

**New approach (file-based):**

```json
{
  "enabled": true
}
```

```typescript
const config = readMaintenanceConfig('public/maintenance.json')
const isActive = isMaintenanceActive(config)
```

**Benefits:**
- ✅ No deployment needed to change status
- ✅ Scheduled time windows
- ✅ Live countdown
- ✅ Automatic end of maintenance

---

## Production Checklist

Before deploying to production:

- [ ] `public/maintenance.json` has `enabled: false`
- [ ] `proxy.ts` is in project root and exports `proxy()` function
- [ ] API route `/api/maintenance-status` returns proper JSON
- [ ] Maintenance page redirects to homepage when maintenance ends
- [ ] Test emergency activation (set `enabled: true`, verify redirect)
- [ ] Test scheduled window (set future startTime/endTime, verify auto-start/stop)
- [ ] Test countdown display (set endTime, verify live countdown)
- [ ] Test early cancellation (disable during active window)
