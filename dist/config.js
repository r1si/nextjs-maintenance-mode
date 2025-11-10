/**
 * Maintenance configuration management
 * Server-side utilities for reading and validating maintenance config
 */
import { readFileSync } from "fs";
import { join } from "path";
/**
 * Validates if an object matches the MaintenanceConfig structure
 */
export function validateMaintenanceConfig(data) {
    if (!data || typeof data !== "object") {
        return false;
    }
    const config = data;
    // enabled must be a boolean
    if (typeof config.enabled !== "boolean") {
        return false;
    }
    // Optional fields validation
    if (config.startTime !== undefined && typeof config.startTime !== "string") {
        return false;
    }
    if (config.endTime !== undefined && typeof config.endTime !== "string") {
        return false;
    }
    if (config.message !== undefined && typeof config.message !== "string") {
        return false;
    }
    return true;
}
/**
 * Checks if current time is within the maintenance window
 * @param config - The maintenance configuration
 * @returns true if we're within the maintenance time range
 */
export function isInMaintenanceWindow(config) {
    const now = new Date();
    // If startTime is defined, check if we're past it
    if (config.startTime) {
        const start = new Date(config.startTime);
        if (isNaN(start.getTime())) {
            // Invalid startTime format, ignore it
            console.warn(`Invalid startTime format: ${config.startTime}. Ignoring time check.`);
        }
        else if (now < start) {
            // Maintenance hasn't started yet
            return false;
        }
    }
    // If endTime is defined, check if we're before it
    if (config.endTime) {
        const end = new Date(config.endTime);
        if (isNaN(end.getTime())) {
            // Invalid endTime format, ignore it
            console.warn(`Invalid endTime format: ${config.endTime}. Ignoring time check.`);
        }
        else if (now > end) {
            // Maintenance has ended
            return false;
        }
    }
    // If we get here, we're within the window (or no time constraints)
    return true;
}
/**
 * Determines if maintenance mode is currently active
 * @param config - The maintenance configuration
 * @returns true if maintenance is enabled and within the time window
 */
export function isMaintenanceActive(config) {
    if (!config.enabled) {
        return false;
    }
    return isInMaintenanceWindow(config);
}
/**
 * Reads and parses the maintenance configuration from filesystem
 * Safe to use in proxy.ts and API routes
 *
 * @param filePath - Absolute or relative path to maintenance.json
 * @param options - Additional options
 * @returns Parsed configuration or default { enabled: false } if file missing/invalid
 */
export function readMaintenanceConfig(filePath = "public/maintenance.json", options = {}) {
    const { silent = false } = options;
    try {
        // Resolve path relative to project root
        const absolutePath = filePath.startsWith("/") ? filePath : join(process.cwd(), filePath);
        // Read file synchronously (safe for proxy.ts)
        const fileContent = readFileSync(absolutePath, "utf-8");
        // Parse JSON
        const data = JSON.parse(fileContent);
        // Validate structure
        if (!validateMaintenanceConfig(data)) {
            if (!silent) {
                console.warn(`Invalid maintenance config structure in ${filePath}. Using default: { enabled: false }`);
            }
            return { enabled: false };
        }
        return data;
    }
    catch (error) {
        // File doesn't exist or JSON parse error - this is expected and OK
        if (!silent && error instanceof Error) {
            // Only log if it's not a "file not found" error
            if (!("code" in error && error.code === "ENOENT")) {
                console.warn(`Error reading maintenance config: ${error.message}`);
            }
        }
        // Return safe default: maintenance disabled
        return { enabled: false };
    }
}
/**
 * Gets the full maintenance status including reason
 * Useful for API routes and debugging
 *
 * @param filePath - Path to maintenance.json
 * @returns Complete maintenance status with reason
 */
export function getMaintenanceStatus(filePath) {
    const config = readMaintenanceConfig(filePath);
    if (!config.enabled) {
        return {
            active: false,
            config,
            reason: "Maintenance is disabled (enabled: false)",
        };
    }
    const inWindow = isInMaintenanceWindow(config);
    if (!inWindow) {
        const now = new Date();
        if (config.startTime && new Date(config.startTime) > now) {
            return {
                active: false,
                config,
                reason: `Maintenance hasn't started yet (starts at ${config.startTime})`,
            };
        }
        if (config.endTime && new Date(config.endTime) < now) {
            return {
                active: false,
                config,
                reason: `Maintenance has ended (ended at ${config.endTime})`,
            };
        }
    }
    return {
        active: true,
        config,
        reason: config.endTime
            ? `Maintenance active until ${config.endTime}`
            : "Maintenance active (no end time specified)",
    };
}
//# sourceMappingURL=config.js.map