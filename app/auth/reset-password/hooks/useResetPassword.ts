import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type {
  TokenValidationResponse,
  ResetPasswordResponse,
  PasswordRule,
} from "../types";

interface UseResetPasswordReturn {
  loading: boolean;
  tokenValid: boolean;
  requiresTwoFactor: boolean;
  useBackupCode: boolean;
  setUseBackupCode: (value: boolean) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  totpCode: string;
  setTotpCode: (value: string) => void;
  success: boolean;
  isSubmitting: boolean;
  passwordChecks: PasswordRule[];
  firstFailedRule: PasswordRule | undefined;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useResetPassword(): UseResetPasswordReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState<boolean>(true);
  const [tokenValid, setTokenValid] = useState<boolean>(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState<boolean>(false);
  const [useBackupCode, setUseBackupCode] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [totpCode, setTotpCode] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Password validation checks
  const passwordChecks = useMemo<PasswordRule[]>(
    () => [
      { valid: /[A-Z]/.test(password), message: "One uppercase letter" },
      { valid: /[a-z]/.test(password), message: "One lowercase letter" },
      { valid: /\d/.test(password), message: "One number" },
      {
        valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        message: "One special character",
      },
      { valid: password.length >= 8, message: "At least 8 characters" },
    ],
    [password],
  );

  const firstFailedRule = passwordChecks.find((rule) => !rule.valid);

  // Validate token on mount
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        toast.error("Invalid password reset link.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
        );

        let data: TokenValidationResponse | null = null;
        try {
          data = await res.json();
        } catch {
          // Handle non-JSON response
        }

        if (!res.ok || !data?.valid) {
          toast.error(getUserFriendlyErrorMessage(data ?? undefined));
          setLoading(false);
          return;
        }

        setTokenValid(true);
        setRequiresTwoFactor(Boolean(data?.requiresTwoFactor));
      } catch {
        toast.error("Unable to validate reset link.");
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (isSubmitting) return;

      // Validation
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }

      if (firstFailedRule) {
        toast.error("Please choose a stronger password.");
        return;
      }

      if (requiresTwoFactor && totpCode.trim().length === 0) {
        toast.error(
          useBackupCode
            ? "Please enter a backup code."
            : "Please enter your authentication code.",
        );
        return;
      }

      setIsSubmitting(true);

      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
            ...(requiresTwoFactor
              ? { totpCode, isBackupCode: useBackupCode }
              : {}),
          }),
        });

        let data: ResetPasswordResponse | null = null;
        try {
          data = await res.json();
        } catch {
          // Handle non-JSON response
        }

        if (!res.ok) {
          toast.error(getUserFriendlyErrorMessage(data ?? undefined));
          return;
        }

        // Edge case: server determined 2FA is required but the client didn't know
        if (data?.requiresTwoFactor) {
          setRequiresTwoFactor(true);
          toast.error("Please enter your authentication code.");
          return;
        }

        setSuccess(true);
        toast.success("Password reset successfully!");
      } catch {
        toast.error("Network error. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      token,
      password,
      confirmPassword,
      totpCode,
      useBackupCode,
      requiresTwoFactor,
      isSubmitting,
      firstFailedRule,
    ],
  );

  return {
    loading,
    tokenValid,
    requiresTwoFactor,
    useBackupCode,
    setUseBackupCode,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    totpCode,
    setTotpCode,
    success,
    isSubmitting,
    passwordChecks,
    firstFailedRule,
    handleSubmit,
  };
}
