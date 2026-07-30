"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // NEW: whether this account has 2FA enabled — determined by the GET check below
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [success, setSuccess] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = [
    { valid: /[A-Z]/.test(password), message: "One uppercase letter" },
    { valid: /[a-z]/.test(password), message: "One lowercase letter" },
    { valid: /\d/.test(password), message: "One number" },
    {
      valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      message: "One special character",
    },
    { valid: password.length >= 8, message: "At least 8 characters" },
  ];

  const firstFailedRule = passwordChecks.find((rule) => !rule.valid);

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

        const data = await res.json();

        if (!res.ok || !data.valid) {
          toast.error(getUserFriendlyErrorMessage(data));
          setLoading(false);
          return;
        }

        setTokenValid(true);
        // NEW: server tells us up front whether a TOTP/backup code will be needed
        setRequiresTwoFactor(Boolean(data.requiresTwoFactor));
      } catch {
        toast.error("Unable to validate reset link.");
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSubmitting) return;

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

      const data = await res.json();

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      // Edge case: server determined 2FA is required but the client didn't
      // know yet (e.g. state went stale) — surface the field and stop.
      if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        toast.error("Please enter your authentication code.");
        return;
      }

      setSuccess(true);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <h2>Reset Password</h2>
        <p className="auth-subtitle">Validating your reset link...</p>
      </>
    );
  }

  if (!tokenValid) {
    return (
      <>
        <h2>Reset Password</h2>

        <p className="auth-subtitle">
          This password reset link is invalid or has expired.
        </p>

        <Link
          href="/auth/forgot-password"
          className="btn-auth-primary"
          style={{
            display: "block",
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          Request New Reset Link
        </Link>

        <p className="auth-switch">
          <Link href="/auth/login">Back to Login</Link>
        </p>
      </>
    );
  }

  if (success) {
    return (
      <>
        <h2>Password Updated</h2>

        <p className="auth-subtitle">
          Your password has been successfully updated.
          {requiresTwoFactor
            ? " You've been signed out everywhere for your security."
            : ""}
        </p>

        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #86efac",
            color: "#166534",
            padding: "14px",
            borderRadius: "10px",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          ✔ Password reset successful.
        </div>

        <button
          className="btn-auth-primary"
          onClick={() => router.push("/auth/login")}
        >
          Back to Login
        </button>
      </>
    );
  }

  return (
    <>
      <style>{`
        .password-rules{
          margin-top:8px;
        }

        .password-rules p{
          font-size:.8rem;
          margin:4px 0;
        }

        .valid{
          color:#16a34a;
        }

        .invalid{
          color:#dc2626;
        }

        .otp-input{
          letter-spacing:6px;
          font-size:1.1rem;
          text-align:center;
        }

        .link-button{
          background:none;
          border:none;
          padding:0;
          color:var(--orange);
          font-weight:600;
          font-size:.8rem;
          cursor:pointer;
          font-family:inherit;
        }
        .link-button:hover{
          text-decoration:underline;
        }
      `}</style>

      <h2>Reset Password</h2>

      <p className="auth-subtitle">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="password">
            New Password <span>*</span>
          </label>

          <input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="password-rules">
            {password.length > 0 && firstFailedRule && (
              <p className="invalid">✖ {firstFailedRule.message}</p>
            )}

            {password.length > 0 && !firstFailedRule && (
              <p className="valid">✔ Password looks good</p>
            )}
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="confirmPassword">
            Confirm Password <span>*</span>
          </label>

          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* NEW: only shown when the account has 2FA enabled */}
        {requiresTwoFactor && (
          <div className="auth-field">
            <label htmlFor="totp-code">
              {useBackupCode ? "Backup code" : "Authentication code"}{" "}
              <span>*</span>
            </label>

            <input
              id="totp-code"
              type="text"
              inputMode={useBackupCode ? "text" : "numeric"}
              placeholder={useBackupCode ? "xxxxxxxxxx" : "123456"}
              maxLength={useBackupCode ? 10 : 6}
              className={useBackupCode ? "" : "otp-input"}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              autoComplete="one-time-code"
              required
            />

            <p style={{ marginTop: "8px" }}>
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setUseBackupCode((prev) => !prev);
                  setTotpCode("");
                }}
              >
                {useBackupCode
                  ? "Use authenticator code instead"
                  : "Use a backup code instead"}
              </button>
            </p>
          </div>
        )}

        <button
          type="submit"
          className="btn-auth-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Reset Password"}
        </button>
      </form>

      <p className="auth-switch">
        Remembered your password? <Link href="/auth/login">Back to Login</Link>
      </p>
    </>
  );
}
