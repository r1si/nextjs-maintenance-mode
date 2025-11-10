/**
 * Maintenance Mode Library
 * A reusable system for managing maintenance mode in Next.js applications
 *
 * Server-side: Import from config.ts (use in proxy.ts, API routes)
 * Client-side: Import from client.ts (use in React components)
 */
// Server-side utilities (for proxy.ts and API routes)
export { validateMaintenanceConfig, isInMaintenanceWindow, isMaintenanceActive, readMaintenanceConfig, getMaintenanceStatus, } from "./config";
export { useMaintenanceStatus, useCountdown, calculateTimeRemaining, formatCountdown, } from "./client";
//# sourceMappingURL=index.js.map