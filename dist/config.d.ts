/**
 * Maintenance configuration management
 * Server-side utilities for reading and validating maintenance config
 */
import type { MaintenanceConfig, MaintenanceStatus, MaintenanceOptions } from "./types";
/**
 * Validates if an object matches the MaintenanceConfig structure
 */
export declare function validateMaintenanceConfig(data: unknown): data is MaintenanceConfig;
/**
 * Checks if current time is within the maintenance window
 * @param config - The maintenance configuration
 * @returns true if we're within the maintenance time range
 */
export declare function isInMaintenanceWindow(config: MaintenanceConfig): boolean;
/**
 * Determines if maintenance mode is currently active
 * @param config - The maintenance configuration
 * @returns true if maintenance is enabled and within the time window
 */
export declare function isMaintenanceActive(config: MaintenanceConfig): boolean;
/**
 * Reads and parses the maintenance configuration from filesystem
 * Safe to use in proxy.ts and API routes
 *
 * @param filePath - Absolute or relative path to maintenance.json
 * @param options - Additional options
 * @returns Parsed configuration or default { enabled: false } if file missing/invalid
 */
export declare function readMaintenanceConfig(filePath?: string, options?: MaintenanceOptions): MaintenanceConfig;
/**
 * Gets the full maintenance status including reason
 * Useful for API routes and debugging
 *
 * @param filePath - Path to maintenance.json
 * @returns Complete maintenance status with reason
 */
export declare function getMaintenanceStatus(filePath?: string): MaintenanceStatus;
//# sourceMappingURL=config.d.ts.map