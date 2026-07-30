import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { registerSchema } from "@/lib/auth/schemas";
import { ConflictError } from "@/lib/errors/ConflictError";
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

export async function register(input: RegisterInput): Promise<RegisteredUser> {
  return withSpan("Register User", async (span) => {
    const { name, email, password, role, phone, categoryIds = [] } = input;

    const normalizedEmail = email.toLowerCase().trim();

    logger.info(
      {
        email: normalizedEmail,
        role,
      },
      "Registration attempt",
    );

    const existingUser = await withSpan("Check Existing User", async () => {
      return authRepository.findUserByEmail(normalizedEmail);
    });

    if (existingUser) {
      span.setAttribute("failure.reason", "email_already_exists");

      logger.warn(
        {
          email: normalizedEmail,
        },
        "Registration failed: email already exists",
      );

      throw new ConflictError(ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await withSpan("Hash Password", async () => {
      return hashPassword(password);
    });

    const user = await withSpan("Create User", async () => {
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

    logger.info(
      {
        userId: user.id,
        role: user.userRole,
      },
      "User created successfully",
    );

    if (role === "PROVIDER") {
      await withSpan("Create Provider Details", async () => {
        await authRepository.createProviderDetails(user.id);
      });

      logger.info(
        {
          userId: user.id,
        },
        "Provider details created",
      );
    }

    const token = await withSpan("Create Session", async () => {
      return signToken({
        userId: user.id,
        email: user.email,
        role: user.userRole,
        passwordVersion: 0,
      });
    });

    await withSpan("Set Authentication Cookie", async () => {
      await setAuthCookie(token);
    });

    logger.info(
      {
        userId: user.id,
        email: user.email,
        role: user.userRole,
      },
      "User registered successfully",
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.userRole,
    };
  });
}
