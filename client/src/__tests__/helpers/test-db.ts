/**
 * Test Database Helper
 *
 * Provides a mock database with chainable query builder for testing
 */

import { vi } from "vitest";

interface TestDbConfig {
  selectResponse?: any[];
  insertResponse?: any[];
  updateResponse?: any[];
  deleteResponse?: any[];
  countResponse?: number;
}

/**
 * Create a test database with configurable responses
 *
 * This creates a mock database that mimics the Drizzle ORM API
 * with chainable methods for select, insert, update, and delete operations.
 */
export function createTestDb(config: TestDbConfig = {}) {
  const {
    selectResponse = [],
    insertResponse = [],
    updateResponse = [],
    deleteResponse = [],
    countResponse = 0,
  } = config;

  // Create chainable query builder
  const createChainableQuery = (response: any) => {
    const chain: any = {
      from: vi.fn(() => chain),
      where: vi.fn(() => chain),
      orderBy: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      offset: vi.fn(() => chain),
      innerJoin: vi.fn(() => chain),
      leftJoin: vi.fn(() => chain),
      rightJoin: vi.fn(() => chain),
      groupBy: vi.fn(() => chain),
      having: vi.fn(() => chain),
      then: (resolve: (value: any) => void) => {
        resolve(response);
        return Promise.resolve(response);
      },
    };

    // Make it thenable so it can be awaited directly
    return Object.assign(Promise.resolve(response), chain);
  };

  const createInsertChain = (response: any) => {
    const chain: any = {
      values: vi.fn(() => chain),
      returning: vi.fn(() => Promise.resolve(response)),
      onConflictDoUpdate: vi.fn(() => chain),
      onConflictDoNothing: vi.fn(() => chain),
      then: (resolve: (value: any) => void) => {
        resolve(response);
        return Promise.resolve(response);
      },
    };

    return Object.assign(Promise.resolve(response), chain);
  };

  const createUpdateChain = (response: any) => {
    const chain: any = {
      set: vi.fn(() => chain),
      where: vi.fn(() => chain),
      returning: vi.fn(() => Promise.resolve(response)),
      then: (resolve: (value: any) => void) => {
        resolve(response);
        return Promise.resolve(response);
      },
    };

    return Object.assign(Promise.resolve(response), chain);
  };

  const createDeleteChain = (response: any) => {
    const chain: any = {
      where: vi.fn(() => chain),
      returning: vi.fn(() => Promise.resolve(response)),
      then: (resolve: (value: any) => void) => {
        resolve(response);
        return Promise.resolve(response);
      },
    };

    return Object.assign(Promise.resolve(response), chain);
  };

  const db = {
    select: vi.fn(() => createChainableQuery(selectResponse)),
    insert: vi.fn(() => createInsertChain(insertResponse)),
    update: vi.fn(() => createUpdateChain(updateResponse)),
    delete: vi.fn(() => createDeleteChain(deleteResponse)),
    query: vi.fn(),
    transaction: vi.fn(),
    $with: vi.fn(),
    with: vi.fn(),
  };

  return db;
}

/**
 * Create a mock count query result
 */
export function createCountResult(count: number) {
  return [{ count }];
}

/**
 * Create a mock paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 20,
  totalCount: number = items.length
) {
  return {
    items,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      hasNextPage: page * pageSize < totalCount,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Create a mock database transaction
 */
export function createMockTransaction(config: TestDbConfig = {}) {
  const db = createTestDb(config);

  return {
    ...db,
    rollback: vi.fn(),
    commit: vi.fn(),
  };
}

/**
 * Mock successful database operation
 */
export function mockDbSuccess<T>(result: T): Promise<T> {
  return Promise.resolve(result);
}

/**
 * Mock failed database operation
 */
export function mockDbError(message: string = "Database error"): Promise<never> {
  return Promise.reject(new Error(message));
}

/**
 * Create a query builder mock that allows custom responses per chain
 */
export function createAdvancedTestDb() {
  const queryHistory: any[] = [];

  const createAdvancedChain = (initialResponse: any) => {
    let currentResponse = initialResponse;

    const chain: any = {
      from: vi.fn((table) => {
        queryHistory.push({ method: "from", table });
        return chain;
      }),
      where: vi.fn((condition) => {
        queryHistory.push({ method: "where", condition });
        return chain;
      }),
      orderBy: vi.fn((column) => {
        queryHistory.push({ method: "orderBy", column });
        return chain;
      }),
      limit: vi.fn((n) => {
        queryHistory.push({ method: "limit", n });
        if (Array.isArray(currentResponse)) {
          currentResponse = currentResponse.slice(0, n);
        }
        return chain;
      }),
      offset: vi.fn((n) => {
        queryHistory.push({ method: "offset", n });
        if (Array.isArray(currentResponse)) {
          currentResponse = currentResponse.slice(n);
        }
        return chain;
      }),
      returning: vi.fn(() => {
        queryHistory.push({ method: "returning" });
        return Promise.resolve(currentResponse);
      }),
      then: (resolve: (value: any) => void) => {
        resolve(currentResponse);
        return Promise.resolve(currentResponse);
      },
    };

    return Object.assign(Promise.resolve(currentResponse), chain);
  };

  return {
    db: {
      select: vi.fn((columns) => {
        queryHistory.push({ method: "select", columns });
        return createAdvancedChain([]);
      }),
      insert: vi.fn((table) => {
        queryHistory.push({ method: "insert", table });
        return {
          values: vi.fn((values) => {
            queryHistory.push({ method: "values", values });
            return createAdvancedChain([values]);
          }),
        };
      }),
      update: vi.fn((table) => {
        queryHistory.push({ method: "update", table });
        return {
          set: vi.fn((values) => {
            queryHistory.push({ method: "set", values });
            return createAdvancedChain([values]);
          }),
        };
      }),
      delete: vi.fn((table) => {
        queryHistory.push({ method: "delete", table });
        return createAdvancedChain([]);
      }),
    },
    queryHistory,
    clearHistory: () => {
      queryHistory.length = 0;
    },
  };
}
