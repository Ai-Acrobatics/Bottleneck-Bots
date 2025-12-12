/**
 * Cron Scheduler Service
 * Handles cron expression parsing, validation, and next run time calculation
 */

import cronParser from "cron-parser";
import cronstrue from "cronstrue";
import { serviceLoggers } from "../lib/logger";

const logger = serviceLoggers.cron;

// ========================================
// TYPES
// ========================================

export interface CronValidationResult {
  valid: boolean;
  error?: string;
}

export interface ParsedCronExpression {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  expression: string;
}

export interface ScheduleConfig {
  hour?: number;
  minute?: number;
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31
}

export type ScheduleType = "daily" | "weekly" | "monthly" | "custom";

// ========================================
// CRON SCHEDULER SERVICE
// ========================================

class CronSchedulerService {
  /**
   * Validate a cron expression
   */
  validateCronExpression(cronExpression: string): CronValidationResult {
    try {
      // Try to parse the expression
      cronParser.parseExpression(cronExpression, {
        currentDate: new Date(),
        utc: false,
      });

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Invalid cron expression",
      };
    }
  }

  /**
   * Parse a cron expression into its component parts
   */
  parseCronExpression(cronExpression: string): ParsedCronExpression | null {
    try {
      const interval = cronParser.parseExpression(cronExpression, {
        currentDate: new Date(),
        utc: false,
      });

      // Get the fields from the parsed expression
      const fields = interval.fields;

      return {
        minute: this.formatCronField(fields.minute),
        hour: this.formatCronField(fields.hour),
        dayOfMonth: this.formatCronField(fields.dayOfMonth),
        month: this.formatCronField(fields.month),
        dayOfWeek: this.formatCronField(fields.dayOfWeek),
        expression: cronExpression,
      };
    } catch (error) {
      logger.error({ error, cronExpression }, "Failed to parse cron expression");
      return null;
    }
  }

  /**
   * Format a cron field array into a string
   */
  private formatCronField(field: number[]): string {
    if (!field || field.length === 0) return "*";

    // If all values are sequential, use range notation
    const sorted = [...field].sort((a, b) => a - b);
    if (sorted.length > 2) {
      const isSequential = sorted.every((val, idx) =>
        idx === 0 || val === sorted[idx - 1] + 1
      );
      if (isSequential) {
        return `${sorted[0]}-${sorted[sorted.length - 1]}`;
      }
    }

    return field.join(",");
  }

  /**
   * Get human-readable description of cron expression
   */
  describeCronExpression(cronExpression: string): string {
    try {
      return cronstrue.toString(cronExpression, {
        use24HourTimeFormat: true,
        verbose: false,
      });
    } catch (error) {
      logger.error({ error, cronExpression }, "Failed to describe cron expression");
      return cronExpression; // Fallback to raw expression
    }
  }

  /**
   * Get the next run time for a cron expression
   */
  getNextRunTime(cronExpression: string, timezone: string = "UTC"): Date | null {
    try {
      const interval = cronParser.parseExpression(cronExpression, {
        currentDate: new Date(),
        tz: timezone,
      });

      const next = interval.next();
      return next.toDate();
    } catch (error) {
      logger.error({ error, cronExpression, timezone }, "Failed to calculate next run time");
      return null;
    }
  }

  /**
   * Get next N run times for a cron expression
   */
  getNextNRunTimes(
    cronExpression: string,
    count: number,
    timezone: string = "UTC"
  ): Date[] {
    try {
      const interval = cronParser.parseExpression(cronExpression, {
        currentDate: new Date(),
        tz: timezone,
      });

      const runTimes: Date[] = [];
      for (let i = 0; i < count; i++) {
        const next = interval.next();
        runTimes.push(next.toDate());
      }

      return runTimes;
    } catch (error) {
      logger.error({ error, cronExpression, count, timezone }, "Failed to calculate next run times");
      return [];
    }
  }

  /**
   * Convert simple schedule type to cron expression
   */
  scheduleTypeToCron(
    scheduleType: ScheduleType,
    config?: ScheduleConfig
  ): string {
    const hour = config?.hour ?? 0;
    const minute = config?.minute ?? 0;

    switch (scheduleType) {
      case "daily":
        // Run at specific time every day
        return `${minute} ${hour} * * *`;

      case "weekly":
        // Run at specific time on specific day of week
        const dayOfWeek = config?.dayOfWeek ?? 0;
        return `${minute} ${hour} * * ${dayOfWeek}`;

      case "monthly":
        // Run at specific time on specific day of month
        const dayOfMonth = config?.dayOfMonth ?? 1;
        return `${minute} ${hour} ${dayOfMonth} * *`;

      case "custom":
        // For custom, config should include a custom expression
        // This is a fallback
        return `${minute} ${hour} * * *`;

      default:
        // Default to midnight daily
        return "0 0 * * *";
    }
  }

  /**
   * Check if a task should run now based on cron expression and last run time
   */
  isTimeToRun(
    cronExpression: string,
    lastRun: Date | null,
    timezone: string = "UTC"
  ): boolean {
    try {
      const now = new Date();

      // If never run before, check if there's a valid next run time
      if (!lastRun) {
        const nextRun = this.getNextRunTime(cronExpression, timezone);
        return nextRun !== null && nextRun <= now;
      }

      // Get the next scheduled run after the last run
      const interval = cronParser.parseExpression(cronExpression, {
        currentDate: lastRun,
        tz: timezone,
      });

      const nextRun = interval.next().toDate();

      // Task should run if next scheduled time has passed
      return nextRun <= now;
    } catch (error) {
      logger.error({ error, cronExpression, timezone }, "Failed to check if time to run");
      return false;
    }
  }

  /**
   * Get human-readable schedule description from schedule type and config
   */
  getScheduleDescription(
    scheduleType: ScheduleType,
    config?: ScheduleConfig
  ): string {
    const hour = config?.hour ?? 0;
    const minute = config?.minute ?? 0;
    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

    switch (scheduleType) {
      case "daily":
        return `Daily at ${timeStr}`;

      case "weekly":
        const dayOfWeek = config?.dayOfWeek ?? 0;
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return `Every ${days[dayOfWeek]} at ${timeStr}`;

      case "monthly":
        const dayOfMonth = config?.dayOfMonth ?? 1;
        const suffix = this.getOrdinalSuffix(dayOfMonth);
        return `Monthly on the ${dayOfMonth}${suffix} at ${timeStr}`;

      case "custom":
        return "Custom schedule";

      default:
        return "Unknown schedule";
    }
  }

  /**
   * Get ordinal suffix for day of month (1st, 2nd, 3rd, etc.)
   */
  private getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  }

  /**
   * Check if a cron expression would ever trigger
   * (e.g., Feb 31st would never occur)
   */
  willEverRun(cronExpression: string, timezone: string = "UTC"): boolean {
    try {
      const interval = cronParser.parseExpression(cronExpression, {
        currentDate: new Date(),
        tz: timezone,
      });

      // Try to get next run - if this throws, expression will never run
      interval.next();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get time until next run in milliseconds
   */
  getTimeUntilNextRun(
    cronExpression: string,
    timezone: string = "UTC"
  ): number | null {
    const nextRun = this.getNextRunTime(cronExpression, timezone);
    if (!nextRun) return null;

    const now = new Date();
    return nextRun.getTime() - now.getTime();
  }

  /**
   * Convert timezone-aware date to another timezone
   */
  convertTimezone(date: Date, fromTz: string, toTz: string): Date {
    // Create formatter for source timezone
    const sourceFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: fromTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Parse the date in source timezone
    const parts = sourceFormatter.formatToParts(date);
    const values: Record<string, string> = {};
    parts.forEach((part) => {
      if (part.type !== "literal") {
        values[part.type] = part.value;
      }
    });

    // Create new date string
    const dateStr = `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`;

    // Create formatter for target timezone
    const targetFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: toTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return new Date(dateStr);
  }
}

// Export singleton instance
export const cronSchedulerService = new CronSchedulerService();
