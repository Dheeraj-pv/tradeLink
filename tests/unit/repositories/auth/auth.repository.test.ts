// tests/unit/repositories/auth/auth.repository.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authRepository from '@repositories/auth/auth.repository';
import { getPrisma } from '@lib/prisma';
import { UserRole } from '@prisma/client';
vi.mock('../../lib/prisma', () => ({
  getPrisma: vi.fn(),
}));

// Define a type for the mock Prisma client
type MockPrismaClient = {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  passwordResetToken: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

describe('Auth Repository', () => {
  const mockPrisma: MockPrismaClient = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    passwordResetToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((callback: (tx: MockPrismaClient) => unknown) => callback(mockPrisma)),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Use type assertion to satisfy PrismaClient type
    vi.mocked(getPrisma).mockReturnValue(mockPrisma as unknown as ReturnType<typeof getPrisma>);
  });

  describe('findUserForLogin', () => {
    it('should find user by email with login fields', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = {
        id: 'user-123',
        email,
        name: 'Test User',
        password: 'hashed',
        userRole: UserRole.CUSTOMER,
        twoFactorEnabled: false,
        passwordVersion: 0,
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await authRepository.findUserForLogin(email);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          userRole: true,
          twoFactorEnabled: true,
          passwordVersion: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await authRepository.findUserForLogin('notfound@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user with role-specific profile', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'hashed-password',
        name: 'Test User',
        role: UserRole.CUSTOMER,
        phone: null,
        categoryIds: [],
      };
      const mockUser = {
        id: 'user-123',
        ...input,
        userRole: input.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordVersion: 0,
        twoFactorEnabled: false,
        twoFactorSecret: null,
      };
      mockPrisma.user.create.mockResolvedValue(mockUser);

      // Act
      const result = await authRepository.createUser(input);

      // Assert
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: input.email,
          name: input.name,
          userRole: input.role,
        }),
      });
      expect(result).toEqual(mockUser);
    });

    it('should create provider with categories when role is PROVIDER', async () => {
      // Arrange
      const input = {
        email: 'provider@example.com',
        password: 'hashed-password',
        name: 'Test Provider',
        role: UserRole.PROVIDER,
        phone: null,
        categoryIds: [1, 2],
      };
      const mockUser = {
        id: 'user-456',
        ...input,
        userRole: input.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordVersion: 0,
        twoFactorEnabled: false,
        twoFactorSecret: null,
      };
      mockPrisma.user.create.mockResolvedValue(mockUser);

      // Act
      const result = await authRepository.createUser(input);

      // Assert
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: input.email,
          name: input.name,
          userRole: input.role,
        }),
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = { id: 'user-123' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await authRepository.findUserByEmail(email);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: { id: true },
      });
      expect(result).toEqual(mockUser);
    });
  });
});