// tests/setup.ts
import { vi } from 'vitest';

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock tracing - define proper function type
type SpanFn = (span: { setAttribute: (key: string, value: unknown) => void }) => Promise<unknown> | unknown;

vi.mock('@/lib/tracing', () => ({
  withSpan: vi.fn((name: string, fn: SpanFn) => fn({ setAttribute: vi.fn() })),
}));

// Mock cookies
vi.mock('@/lib/auth/cookies', () => ({
  setAuthCookie: vi.fn(),
  clearAuthCookie: vi.fn(),
}));

// Mock Prisma - define transaction callback type
type TransactionCallback = (tx: Record<string, unknown>) => unknown;

vi.mock('@/lib/prisma', () => ({
  getPrisma: vi.fn(() => ({
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    job: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    bid: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn((callback: TransactionCallback) => callback({})),
  })),
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(() => 'mock-jwt-token'),
  verify: vi.fn(),
}));