// Test setup file. Runs before all tests.

import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock browser APIs that JSDOM doesn't provide

// localStorage (JSDOM provides this but ensure it's clean)
beforeEach(() => {
  localStorage.clear();
});

// matchMedia (used by some framer-motion code paths)
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

// IntersectionObserver (used by lazy images)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// HTMLCanvasElement.getContext (used by image compression)
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  drawImage: vi.fn(),
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawFocusIfNeeded: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
}));

HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  callback(new Blob(['fake-image-data'], { type: 'image/jpeg' }));
});

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,Zm9v');

// URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:fake-url');
global.URL.revokeObjectURL = vi.fn();

// MediaDevices (for camera capture)
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({
      getTracks: () => [{ stop: vi.fn() }],
    })),
  },
});

// HTMLMediaElement.play
window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = vi.fn();
