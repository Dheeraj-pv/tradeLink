// tests/utils/test-helpers.ts
import { vi } from 'vitest';

/**
 * Create a mock NextRequest with JSON body
 */
export function createMockRequest(body: any) {
  return {
    json: vi.fn().mockResolvedValue(body),
    formData: vi.fn(),
    nextUrl: {
      searchParams: new URLSearchParams(),
    },
    cookies: {
      get: vi.fn(),
      set: vi.fn(),
    },
  } as any;
}

/**
 * Create a mock NextResponse
 */
export function createMockResponse() {
  return {
    status: 200,
    json: vi.fn(),
    cookies: {
      delete: vi.fn(),
      set: vi.fn(),
    },
  } as any;
}

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    userRole: 'CUSTOMER',
    twoFactorEnabled: false,
    passwordVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock job for testing
 */
export function createMockJob(overrides = {}) {
  return {
    id: 'job-123',
    title: 'Test Job',
    description: 'Test Description',
    address: '123 Test St',
    status: 'OPEN',
    customerId: 'user-123',
    categoryId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Wait for async operations to complete
 */
export function waitFor(ms: number = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}