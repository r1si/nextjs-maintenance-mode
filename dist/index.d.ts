/**
 * Maintenance Mode Library
 * A reusable system for managing maintenance mode in Next.js applications
 *
 * Server-side: Import from config.ts (use in proxy.ts, API routes)
 * Client-side: Import from client.ts (use in React components)
 */
export type { MaintenanceConfig, MaintenanceStatus, MaintenanceOptions } from "./types";
export { validateMaintenanceConfig, isInMaintenanceWindow, isMaintenanceActive, readMaintenanceConfig, getMaintenanceStatus, } from "./config";
export type { MaintenanceApiResponse } from "./client";
export { useMaintenanceStatus, useCountdown, calculateTimeRemaining, formatCountdown, } from "./client";
//# sourceMappingURL=index.d.ts.map