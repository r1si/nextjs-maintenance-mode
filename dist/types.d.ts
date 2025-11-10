/**
 * Maintenance system types
 * Designed to be a reusable library for Next.js maintenance mode
 */
/**
 * Main configuration structure for maintenance mode
 */
export type MaintenanceConfig = {
    /**
     * Whether maintenance mode is enabled
     */
    enabled: boolean;
    /**
     * ISO 8601 date string for when maintenance starts
     * If not provided, maintenance is considered active immediately when enabled=true
     * @example "2025-01-15T10:00:00Z"
     */
    startTime?: string;
    /**
     * ISO 8601 date string for when maintenance ends
     * If not provided, maintenance has no automatic end time
     * @example "2025-01-15T12:00:00Z"
     */
    endTime?: string;
    /**
     * Custom message to display on the maintenance page
     * Falls back to default i18n translations if not provided
     */
    message?: string;
};
/**
 * Result type for maintenance status checks
 * Used by API routes and components
 */
export type MaintenanceStatus = {
    /**
     * Whether the system is currently in maintenance mode
     */
    active: boolean;
    /**
     * The full configuration object
     */
    config: MaintenanceConfig | null;
    /**
     * Human-readable reason why maintenance is active/inactive
     * Useful for debugging
     */
    reason?: string;
};
/**
 * Options for reading maintenance configuration
 */
export type MaintenanceOptions = {
    /**
     * Path to the maintenance.json file relative to project root
     * @default "public/maintenance.json"
     */
    configPath?: string;
    /**
     * Whether to log errors to console
     * @default false
     */
    silent?: boolean;
};
//# sourceMappingURL=types.d.ts.map