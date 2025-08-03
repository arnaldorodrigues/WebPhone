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

// Mock Element.prototype.getAnimations which is used by React's act() function
if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = vi.fn().mockReturnValue([]);
}

// Mock additional browser APIs needed for React testing
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  
  // Mock requestAnimationFrame and cancelAnimationFrame
  window.requestAnimationFrame = vi.fn().mockImplementation(callback => {
    return setTimeout(() => callback(Date.now()), 0);
  });
  
  window.cancelAnimationFrame = vi.fn().mockImplementation(id => {
    clearTimeout(id);
  });
  
  // Mock the Web Animations API used by @headlessui/react
  if (!Element.prototype.animate) {
    Element.prototype.animate = vi.fn().mockReturnValue({
      cancel: vi.fn(),
      finished: Promise.resolve(),
      onfinish: null,
      oncancel: null,
      pause: vi.fn(),
      play: vi.fn(),
      reverse: vi.fn(),
    });
  }
}

// Reset mocks before each test
beforeEach(() => {
  vi.resetAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
  
  // Clean up any pending animation frames
  const pendingAnimationFrames: any[] = [];
  while (pendingAnimationFrames.length) {
    const id = pendingAnimationFrames.pop();
    if (id) window.cancelAnimationFrame(id);
  }
});