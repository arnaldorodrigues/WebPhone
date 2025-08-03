import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach  } from 'vitest';

// Mock the global fetch
global.fetch = vi.fn();

// Mock HTMLMediaElement methods which are not implemented in JSDOM
Object.defineProperty(window, 'HTMLMediaElement', {
  writable: true,
  value: class MockHTMLMediaElement {
    constructor() {}
    play = vi.fn().mockResolvedValue(undefined);
    pause = vi.fn();
    load = vi.fn();
  }
});

// Reset mocks before each test
beforeEach(() => {
  vi.resetAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});