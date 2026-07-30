import Link from "next/link";

export function InvalidTokenState() {
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
