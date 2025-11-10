/**
 * Maintenance Mode Library
 * A reusable system for managing maintenance mode in Next.js applications
 *
 * Server-side: Import from config.ts (use in proxy.ts, API routes)
 * Client-side: Import from client.ts (use in React components)
 */

// Types
export type { MaintenanceConfig, MaintenanceStatus, MaintenanceOptions } from "./types";

// Server-side utilities (for proxy.ts and API routes)
export {
    validateMaintenanceConfig,
    isInMaintenanceWindow,
    isMaintenanceActive,
    readMaintenanceConfig,
    getMaintenanceStatus,
} from "./config";

// Client-side utilities (for React components)
export type { MaintenanceApiResponse } from "./client";
export {
    useMaintenanceStatus,
    useCountdown,
    calculateTimeRemaining,
    formatCountdown,
} from "./client";
