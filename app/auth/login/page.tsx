"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import { AuthField, AuthTabs, PasswordRules } from "@/components/auth/auth-form-elements";

type Stage = "credentials" | "2fa";

export default function LoginPage() {
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2FA step state
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

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

  function redirectAfterLogin(role: string | undefined) {
    const destination =
      role === "provider" ? "/provider/dashboard" : "/customer/dashboard";
    router.push(destination);
    router.refresh();
  }

  async function handleCredentialsSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // response wasn't JSON — fall through to generic error below
      }

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      // NEW: password was correct but account has 2FA enabled —
      // no session exists yet, move to the code-entry step
     if (
  data?.data?.requiresTwoFactor &&
  data?.data?.pendingToken
) {
  setPendingToken(data.data.pendingToken);
  setStage("2fa");
  return;
}

redirectAfterLogin(data?.data?.user?.role);
    } catch (err) {
      console.error("Login request failed:", err);
      toast.error(
        "Network error — please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTwoFactorSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSubmitting || !pendingToken) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/2fa/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendingToken,
          code,
          isBackupCode: useBackupCode,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      redirectAfterLogin(data?.data?.user?.role);
    } catch (err) {
      console.error("2FA verification failed:", err);
      toast.error(
        "Network error — please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function backToCredentials() {
    setStage("credentials");
    setPendingToken(null);
    setCode("");
    setUseBackupCode(false);
  }

  return (
    <>
      <style>
        {`.password-rules{
        margin-top:8px;
      }

      .password-rules p{
        font-size:0.8rem;
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
        font-size:.85rem;
        cursor:pointer;
        font-family:inherit;
      }
      .link-button:hover{
        text-decoration:underline;
      }`}
      </style>

      {stage === "credentials" ? (
        <>
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to your TradeLink account</p>

          <AuthTabs active="login" />

          <form onSubmit={handleCredentialsSubmit} noValidate>
            <AuthField
              id="login-email"
              label="Email address"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <AuthField
              id="login-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            >
              <PasswordRules password={password} rules={passwordChecks} />
            </AuthField>

            <button
              type="submit"
              className="btn-auth-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            forgot your password?{" "}
            <Link href="/auth/forgot-password">Try Another Way</Link>
          </p>
          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register">Register</Link>
          </p>

          <div className="demo-box">
            <strong>Demo:</strong> demo@tradelink.com / password123
          </div>
        </>
      ) : (
        <>
          <h2>Two-factor verification</h2>
          <p className="auth-subtitle">
            {useBackupCode
              ? "Enter one of your saved backup codes."
              : "Enter the 6-digit code from your authenticator app."}
          </p>

          <form onSubmit={handleTwoFactorSubmit} noValidate>
            <AuthField
              id="totp-code"
              label={useBackupCode ? "Backup code" : "Authentication code"}
              type="text"
              inputMode={useBackupCode ? "text" : "numeric"}
              placeholder={useBackupCode ? "xxxxxxxxxx" : "123456"}
              maxLength={useBackupCode ? 10 : 6}
              className={useBackupCode ? "" : "otp-input"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="one-time-code"
              autoFocus
              required
            />

            <button
              type="submit"
              className="btn-auth-primary"
              disabled={isSubmitting || code.length === 0}
            >
              {isSubmitting ? "Verifying…" : "Verify and sign in"}
            </button>
          </form>

          <p className="auth-switch">
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setUseBackupCode((prev) => !prev);
                setCode("");
              }}
            >
              {useBackupCode
                ? "Use authenticator code instead"
                : "Use a backup code instead"}
            </button>
          </p>

          <p className="auth-switch">
            <button
              type="button"
              className="link-button"
              onClick={backToCredentials}
            >
              Back to login
            </button>
          </p>
        </>
      )}
    </>
  );
}
