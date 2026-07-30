"use client";

import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

// Type definitions
type ForgotPasswordResponse = {
  message?: string;
  error?: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSubmitting) return;

    setMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      let data: ForgotPasswordResponse | null = null;
      try {
        data = await res.json();
      } catch {
        // Handle non-JSON response
      }

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(data ?? undefined));
        return;
      }

      setMessage(data?.message ?? "Password reset link sent to your email.");
      setEmail("");
      toast.success("Reset link sent!");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h2>Forgot Password</h2>

      <p className="auth-subtitle">
        Enter your email address and we&apos;ll send you a password reset link.
      </p>

      <div className="auth-tabs">
        <Link href="/auth/login" className="auth-tab">
          Log in
        </Link>

        <Link href="/auth/register" className="auth-tab">
          Register
        </Link>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {message && (
          <div
            style={{
              background: "#ecfdf5",
              color: "#166534",
              border: "1px solid #86efac",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "16px",
            }}
          >
            {message}
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="email">
            Email address <span>*</span>
          </label>

          <input
            id="email"
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-auth-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="auth-switch">
        Remember your password? <Link href="/auth/login">Back to Login</Link>
      </p>
    </>
  );
}
