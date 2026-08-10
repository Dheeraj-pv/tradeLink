// services/auth/register.service.ts
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { registerSchema } from "@/lib/auth/schemas";
import { ConflictError } from "@/lib/errors/ConflictError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as authRepository from "@/repositories/auth/auth.repository";
import { z } from "zod";
import { ErrorCode } from "@/lib/errors/ErrorCode";

type RegisterInput = z.infer<typeof registerSchema>;

interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "PROVIDER";
}

/**
 * Register Service
 * Creates a new user account with role-specific profile
 */
export async function register(input: RegisterInput): Promise<RegisteredUser> {
  return withSpan("RegisterService", async (span) => {
    const { name, email, password, role, phone, categoryIds = [] } = input;

    const normalizedEmail = email.toLowerCase().trim();

    logger.info("Registration attempt", {
      email: normalizedEmail,
      role,
    });

    // 1. Check if user already exists
    const existingUser = await withSpan("CheckExistingUser", async () => {
      return authRepository.findUserByEmail(normalizedEmail);
    });

    if (existingUser) {
      logger.warn("Registration failed: Email already exists", {
        email: normalizedEmail,
      });
      span.setAttribute("failure.reason", "email_already_exists");
      throw new ConflictError(ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    // 2. Validate provider categories if role is PROVIDER
    if (role === "PROVIDER") {
      if (!categoryIds || categoryIds.length === 0) {
        logger.warn("Registration failed: No categories selected", {
          email: normalizedEmail,
        });
        span.setAttribute("failure.reason", "no_categories_selected");
        throw new ValidationError(ErrorCode.INVALID_INPUT);
      }

      if (categoryIds.length > 2) {
        logger.warn("Registration failed: Too many categories", {
          email: normalizedEmail,
          categoryCount: categoryIds.length,
        });
        span.setAttribute("failure.reason", "too_many_categories");
        throw new ValidationError(ErrorCode.INVALID_INPUT);
      }
    }

    // 3. Hash password
    const hashedPassword = await withSpan("HashPassword", async () => {
      return hashPassword(password);
    });

    // 4. Create user
    const user = await withSpan("CreateUser", async () => {
      return authRepository.createUser({
        email: normalizedEmail,
        password: hashedPassword,
        name: name.trim(),
        role,
        phone: phone ?? null,
        categoryIds,
      });
    });

    span.setAttribute("user.id", user.id);
    span.setAttribute("user.role", user.userRole);
    span.setAttribute("provider.categories.count", categoryIds.length);

    logger.info("User created successfully", {
      userId: user.id,
      email: user.email,
      role: user.userRole,
    });

    // 5. Create provider details if role is PROVIDER
    if (role === "PROVIDER") {
      await withSpan("CreateProviderDetails", async () => {
        await authRepository.createProviderDetails(user.id);
      });

      logger.info("Provider details created", {
        userId: user.id,
      });
    }

    // 6. Create session
    const token = await withSpan("CreateSession", async () => {
      return signToken({
        userId: user.id,
        email: user.email,
        role: user.userRole,
        passwordVersion: 0,
      });
    });

    // 7. Set authentication cookie
    await withSpan("SetAuthenticationCookie", async () => {
      await setAuthCookie(token);
    });

    logger.info("User registered successfully", {
      userId: user.id,
      email: user.email,
      role: user.userRole,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.userRole,
    };
  });
}