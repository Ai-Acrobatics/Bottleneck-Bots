/**
 * Type definitions for cron scheduler dependencies
 */

declare module 'cron-parser' {
  interface Options {
    currentDate?: Date | string | number;
    startDate?: Date | string | number;
    endDate?: Date | string | number;
    iterator?: boolean;
    utc?: boolean;
    tz?: string;
  }

  interface CronExpression {
    fields: {
      second: number[];
      minute: number[];
      hour: number[];
      dayOfMonth: number[];
      month: number[];
      dayOfWeek: number[];
    };
    next(): CronDate;
    prev(): CronDate;
    hasNext(): boolean;
    hasPrev(): boolean;
    reset(date?: Date): void;
  }

  interface CronDate {
    toDate(): Date;
    toISOString(): string;
    toString(): string;
  }

  function parseExpression(expression: string, options?: Options): CronExpression;

  export = {
    parseExpression,
  };
}

declare module 'cronstrue' {
  interface Options {
    throwExceptionOnParseError?: boolean;
    verbose?: boolean;
    dayOfWeekStartIndexZero?: boolean;
    use24HourTimeFormat?: boolean;
    locale?: string;
  }

  function toString(expression: string, options?: Options): string;

  export = {
    toString,
  };
}
