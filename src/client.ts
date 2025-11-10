"use client";

/**
 * Client-side utilities for maintenance mode
 * React hooks and helpers for components
 */

import { useEffect, useState } from "react";
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
export function useMaintenanceStatus(
    options: {
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
    } = {}
) {
    const { pollInterval = 30000, autoPoll = true } = options;

    const [status, setStatus] = useState<MaintenanceApiResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchStatus = async () => {
        try {
            const response = await fetch("/api/maintenance-status");

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setStatus(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Unknown error"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchStatus();

        // Set up polling if enabled
        if (autoPoll) {
            const interval = setInterval(fetchStatus, pollInterval);
            return () => clearInterval(interval);
        }
    }, [pollInterval, autoPoll]);

    return {
        status,
        isLoading,
        error,
        refetch: fetchStatus,
    };
}

/**
 * Calculates time remaining until a target date
 * Returns null if endTime is not provided or invalid
 *
 * @param endTime - ISO 8601 date string
 * @returns Object with days, hours, minutes, seconds, or null
 */
export function calculateTimeRemaining(endTime?: string): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
} | null {
    if (!endTime) {
        return null;
    }

    const end = new Date(endTime);

    if (isNaN(end.getTime())) {
        console.warn(`Invalid endTime format: ${endTime}`);
        return null;
    }

    const now = new Date();
    const totalSeconds = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));

    if (totalSeconds === 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
        };
    }

    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    return {
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
    };
}

/**
 * Hook for live countdown to endTime
 * Updates every second
 *
 * @param endTime - ISO 8601 date string
 * @returns Time remaining object or null
 */
export function useCountdown(endTime?: string) {
    const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining(endTime));

    useEffect(() => {
        if (!endTime) {
            setTimeRemaining(null);
            return;
        }

        // Update immediately
        setTimeRemaining(calculateTimeRemaining(endTime));

        // Update every second
        const interval = setInterval(() => {
            const remaining = calculateTimeRemaining(endTime);
            setTimeRemaining(remaining);

            // Stop countdown when it reaches zero
            if (remaining?.totalSeconds === 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return timeRemaining;
}

/**
 * Formats countdown time as a human-readable string
 *
 * @param timeRemaining - Time remaining object from calculateTimeRemaining
 * @returns Formatted string like "2h 30m" or "45m 30s"
 */
export function formatCountdown(
    timeRemaining: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null
): string {
    if (!timeRemaining) {
        return "";
    }

    const { days, hours, minutes, seconds } = timeRemaining;

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
}
