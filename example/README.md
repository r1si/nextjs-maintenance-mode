# Next.js Maintenance Mode - Example App

This is a minimal example demonstrating how to use **nextjs-maintenance-mode** in a Next.js 16+ application with the App Router.

## Features Demonstrated

- ✅ Runtime configuration with `maintenance.json`
- ✅ Proxy-based redirect to maintenance page
- ✅ Live countdown display
- ✅ Auto-redirect when maintenance ends
- ✅ API route for status polling

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Test Maintenance Mode

Edit `public/maintenance.json` to enable maintenance:

```json
{
  "enabled": true,
  "message": "We are performing scheduled maintenance.",
  "endTime": "2025-01-15T12:00:00Z"
}
```

Refresh the page - you'll be redirected to `/maintenance` with a countdown timer.

### 4. Test Auto-Redirect

Set `enabled: false` in `maintenance.json`:

```json
{
  "enabled": false
}
```

The maintenance page will automatically redirect you back to the homepage within 30 seconds (or refresh manually to see the change immediately).

## Project Structure

```
example/
├── app/
│   ├── page.tsx                          # Homepage
│   ├── maintenance/
│   │   └── page.tsx                      # Maintenance page with countdown
│   └── api/
│       └── maintenance-status/
│           └── route.ts                  # API endpoint
├── proxy.ts                              # Next.js 16 proxy (formerly middleware)
├── public/
│   └── maintenance.json                  # Configuration file
├── package.json
└── next.config.ts
```

## How It Works

1. **Proxy** (`proxy.ts`): Intercepts every request and checks `maintenance.json`
2. **Redirect**: If maintenance is active, redirects to `/maintenance`
3. **Maintenance Page**: Shows countdown and polls API every 30 seconds
4. **Auto-Redirect**: When maintenance ends, redirects back to homepage

## Configuration Examples

### Emergency Maintenance (Immediate, Indefinite)

```json
{
  "enabled": true,
  "message": "Emergency maintenance in progress."
}
```

### Scheduled Maintenance (Auto Start/Stop)

```json
{
  "enabled": true,
  "startTime": "2025-01-20T02:00:00Z",
  "endTime": "2025-01-20T04:00:00Z",
  "message": "Scheduled maintenance: Database upgrade"
}
```

### Disabled (Normal Operation)

```json
{
  "enabled": false
}
```

## Learn More

See the [main README](../README.md) for complete documentation, including:

- Decision logic and priority rules
- All configuration scenarios
- API reference
- Migration guides

## License

MIT
