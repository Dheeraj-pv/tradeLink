// tests/unit/services/auth/register.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register } from '../../services/auth/register.service';
import * as authRepository from '../../repositories/auth/auth.repository';
import { ConflictError } from '../../lib/errors/ConflictError';
import { ValidationError } from '../../lib/errors/ValidationError';
import { ErrorCode } from '../../lib/errors/ErrorCode';
import { UserRole } from '@prisma/client';

// Type definitions - categoryIds is required for both roles
type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: typeof UserRole[keyof typeof UserRole];
  phone?: string | null;
  categoryIds: number[]; // Changed from optional to required
};

type CreatedUser = {
  id: string;
  email: string;
  name: string;
  userRole: typeof UserRole[keyof typeof UserRole];
};

vi.mock('../../repositories/auth/auth.repository', () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
  createProviderDetails: vi.fn(),
}));

vi.mock('../../lib/auth/password', () => ({
  hashPassword: vi.fn(() => 'hashed-password'),
}));

vi.mock('../../lib/auth/jwt', () => ({
  signToken: vi.fn(() => 'mock-jwt-token'),
}));

describe('Register Service', () => {
  const validCustomerInput: RegisterInput = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'ValidPass123!',
    role: UserRole.CUSTOMER,
    phone: '+1234567890',
    categoryIds: [], // Explicitly empty array for customer
  };

  const validProviderInput: RegisterInput = {
    ...validCustomerInput,
    role: UserRole.PROVIDER,
    categoryIds: [1, 2],
  };

  const mockCreatedUser: CreatedUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    userRole: UserRole.CUSTOMER,
  };

  const mockProviderUser: CreatedUser = {
    ...mockCreatedUser,
    userRole: UserRole.PROVIDER,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Registration', () => {
    it('should create a customer account', async () => {
      // Arrange
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.createUser).mockResolvedValue(mockCreatedUser);

      // Act
      const result = await register(validCustomerInput);

      // Assert
      expect(result.id).toBe(mockCreatedUser.id);
      expect(result.email).toBe(mockCreatedUser.email);
      expect(result.role).toBe(mockCreatedUser.userRole);
      expect(authRepository.createProviderDetails).not.toHaveBeenCalled();
    });

    it('should create a provider account with categories', async () => {
      // Arrange
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.createUser).mockResolvedValue(mockProviderUser);

      // Act
      const result = await register(validProviderInput);

      // Assert
      expect(result.role).toBe(UserRole.PROVIDER);
      expect(authRepository.createProviderDetails).toHaveBeenCalled();
    });
  });

  describe('Validation Failures', () => {
    it('should throw error when email already exists', async () => {
      // Arrange
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
        id: 'existing-user',
      });

      // Act & Assert
      await expect(register(validCustomerInput)).rejects.toThrow(ConflictError);
      await expect(register(validCustomerInput)).rejects.toMatchObject({
        code: ErrorCode.EMAIL_ALREADY_EXISTS,
      });
    });

    it('should throw error when provider has no categories', async () => {
      // Arrange
      const input: RegisterInput = { 
        ...validProviderInput, 
        categoryIds: [] // Empty array instead of undefined
      };
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

      // Act & Assert
      await expect(register(input)).rejects.toThrow(ValidationError);
      await expect(register(input)).rejects.toMatchObject({
        code: ErrorCode.INVALID_INPUT,
      });
    });

    it('should throw error when provider has more than 2 categories', async () => {
      // Arrange
      const input: RegisterInput = { 
        ...validProviderInput, 
        categoryIds: [1, 2, 3] 
      };
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

      // Act & Assert
      await expect(register(input)).rejects.toThrow(ValidationError);
    });
  });
});