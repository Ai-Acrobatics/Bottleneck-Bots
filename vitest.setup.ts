import { expect, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend vitest expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test (only in browser environment)
if (typeof window !== 'undefined') {
  const { cleanup } = await import('@testing-library/react');
  afterEach(() => {
    cleanup();
  });

  // Mock window.matchMedia for components that use it
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // Mock ResizeObserver
  if (typeof ResizeObserver === 'undefined') {
    (global as any).ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
}
