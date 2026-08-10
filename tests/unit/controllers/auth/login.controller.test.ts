// tests/unit/controllers/auth/login.controller.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { loginController } from '../../controllers/auth/login.controller';
import * as loginService from '../../services/auth/login.service';
import { UserRole } from '@prisma/client';

// Type definitions
type LoginResult = {
  requiresTwoFactor: boolean;
  pendingToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: typeof UserRole[keyof typeof UserRole];
  };
};

vi.mock('../../services/auth/login.service', () => ({
  login: vi.fn(),
}));

describe('Login Controller', () => {
  const mockRequest = (body: Record<string, unknown>): NextRequest => {
    return {
      json: vi.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 with user data on successful login', async () => {
    // Arrange
    const req = mockRequest({
      email: 'test@example.com',
      password: 'ValidPass123!',
    });
    const mockResult: LoginResult = {
      requiresTwoFactor: false,
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.CUSTOMER,
      },
    };
    vi.mocked(loginService.login).mockResolvedValue(mockResult);

    // Act
    const response = await loginController(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user).toBeDefined();
    expect(data.data.user.id).toBe('user-123');
  });

  it('should return 2FA required when user has 2FA enabled', async () => {
    // Arrange
    const req = mockRequest({
      email: 'test@example.com',
      password: 'ValidPass123!',
    });
    const mockResult: LoginResult = {
      requiresTwoFactor: true,
      pendingToken: 'mock-pending-token',
    };
    vi.mocked(loginService.login).mockResolvedValue(mockResult);

    // Act
    const response = await loginController(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.data.requiresTwoFactor).toBe(true);
    expect(data.data.pendingToken).toBe('mock-pending-token');
    expect(data.data.user).toBeUndefined();
  });

  it('should return error when request body is invalid', async () => {
    // Arrange
    const req = mockRequest({
      // Missing email field
      password: 'ValidPass123!',
    });
    const mockError = new Error('Invalid request body');
    vi.mocked(loginService.login).mockRejectedValue(mockError);

    // Act & Assert
    try {
      await loginController(req);
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect((error as Error).message).toBe('Invalid request body');
    }
  });

  it('should return error when credentials are invalid', async () => {
    // Arrange
    const req = mockRequest({
      email: 'test@example.com',
      password: 'wrong-password',
    });
    const mockError = new Error('Invalid credentials');
    vi.mocked(loginService.login).mockRejectedValue(mockError);

    // Act & Assert
    try {
      await loginController(req);
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect((error as Error).message).toBe('Invalid credentials');
    }
  });
});