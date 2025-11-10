import type { MaintenanceConfig } from "./types";
/**
 * Response type from /api/maintenance-status endpoint
 */
export type MaintenanceApiResponse = {
    active: boolean;
    config: MaintenanceConfig | null;
    reason?: string;
};
/**
 * Hook to fetch and monitor maintenance status from API
 * Automatically polls every 30 seconds
 *
 * @param options - Configuration options
 * @returns Maintenance status and loading state
 */
export declare function useMaintenanceStatus(options?: {
    /**
     * Polling interval in milliseconds
     * @default 30000 (30 seconds)
     */
    pollInterval?: number;
    /**
     * Whether to automatically poll
     * @default true
     */
    autoPoll?: boolean;
}): {
    status: MaintenanceApiResponse | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
};
/**
 * Calculates time remaining until a target date
 * Returns null if endTime is not provided or invalid
 *
 * @param endTime - ISO 8601 date string
 * @returns Object with days, hours, minutes, seconds, or null
 */
export declare function calculateTimeRemaining(endTime?: string): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
} | null;
/**
 * Hook for live countdown to endTime
 * Updates every second
 *
 * @param endTime - ISO 8601 date string
 * @returns Time remaining object or null
 */
export declare function useCountdown(endTime?: string): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
} | null;
/**
 * Formats countdown time as a human-readable string
 *
 * @param timeRemaining - Time remaining object from calculateTimeRemaining
 * @returns Formatted string like "2h 30m" or "45m 30s"
 */
export declare function formatCountdown(timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
} | null): string;
//# sourceMappingURL=client.d.ts.map