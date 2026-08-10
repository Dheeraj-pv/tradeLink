// tests/unit/services/auth/login.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from '../../services/auth/login.service';
import * as authRepository from '../../repositories/auth/auth.repository';
import { AuthenticationError } from '../../lib/errors/AuthenticationError';
import { verifyPassword } from '../../lib/auth/password';
import { setAuthCookie } from '../../lib/auth/cookies';
import { UserRole } from '@prisma/client';

// Mock the repository
vi.mock('../../repositories/auth/auth.repository', () => ({
  findUserForLogin: vi.fn(),
}));

// Mock password verification
vi.mock('../../lib/auth/password', () => ({
  verifyPassword: vi.fn(),
}));

// Mock JWT
vi.mock('../../lib/auth/jwt', () => ({
  signToken: vi.fn(() => 'mock-jwt-token'),
  signPendingToken: vi.fn(() => 'mock-pending-token'),
}));

// Mock cookies
vi.mock('../../lib/auth/cookies', () => ({
  setAuthCookie: vi.fn(),
}));

describe('Login Service', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed-password',
    userRole: UserRole.CUSTOMER,
    twoFactorEnabled: false,
    passwordVersion: 0,
  };

  const validInput = {
    email: 'test@example.com',
    password: 'ValidPass123!',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Login', () => {
    it('should return user data when credentials are valid', async () => {
      // Arrange
      vi.mocked(authRepository.findUserForLogin).mockResolvedValue(mockUser);
      vi.mocked(verifyPassword).mockResolvedValue(true);

      // Act
      const result = await login(validInput);

      // Assert
      expect(result.requiresTwoFactor).toBe(false);
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe(mockUser.id);
      expect(result.user?.email).toBe(mockUser.email);
    });

    it('should set auth cookie on successful login', async () => {
      // Arrange
      vi.mocked(authRepository.findUserForLogin).mockResolvedValue(mockUser);
      vi.mocked(verifyPassword).mockResolvedValue(true);

      // Act
      await login(validInput);

      // Assert
      expect(setAuthCookie).toHaveBeenCalledWith('mock-jwt-token');
    });
  });

  describe('Failed Login', () => {
    it('should throw error when user not found', async () => {
      // Arrange
      vi.mocked(authRepository.findUserForLogin).mockResolvedValue(null);

      // Act & Assert
      await expect(login(validInput)).rejects.toThrow(AuthenticationError);
    });

    it('should throw error when password is invalid', async () => {
      // Arrange
      vi.mocked(authRepository.findUserForLogin).mockResolvedValue(mockUser);
      vi.mocked(verifyPassword).mockResolvedValue(false);

      // Act & Assert
      await expect(login(validInput)).rejects.toThrow(AuthenticationError);
    });
  });

  describe('2FA Flow', () => {
    const twoFactorUser = {
      ...mockUser,
      twoFactorEnabled: true,
    };

    it('should return pending token when 2FA is enabled', async () => {
      // Arrange
      vi.mocked(authRepository.findUserForLogin).mockResolvedValue(twoFactorUser);
      vi.mocked(verifyPassword).mockResolvedValue(true);

      // Act
      const result = await login(validInput);

      // Assert
      expect(result.requiresTwoFactor).toBe(true);
      expect(result.pendingToken).toBeDefined();
      expect(result.user).toBeUndefined();
    });

    it('should not set auth cookie when 2FA is required', async () => {
      // Arrange
      vi.mocked(authRepository.findUserForLogin).mockResolvedValue(twoFactorUser);
      vi.mocked(verifyPassword).mockResolvedValue(true);

      // Act
      await login(validInput);

      // Assert
      expect(setAuthCookie).not.toHaveBeenCalled();
    });
  });
});