import Link from "next/link";
import {
  AuthField,
  AuthTabs,
  PasswordRules,
} from "@/components/auth/auth-form-elements";

interface Props {
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  passwordChecks: Array<{ valid: boolean; message: string }>;
}

export function CredentialsForm({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onSubmit,
  isSubmitting,
  passwordChecks,
}: Props) {
  return (
    <>
      <h2>Welcome back</h2>
      <p className="auth-subtitle">Sign in to your TradeLink account</p>

      <AuthTabs active="login" />

      <form onSubmit={onSubmit} noValidate>
        <AuthField
          id="login-email"
          label="Email address"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          autoComplete="email"
          required
        />

        <AuthField
          id="login-password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
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
        Forgot your password?{" "}
        <Link href="/auth/forgot-password">Try Another Way</Link>
      </p>
      <p className="auth-switch">
        Don&apos;t have an account? <Link href="/auth/register">Register</Link>
      </p>

      <div className="demo-box">
        <strong>Demo:</strong> demo@tradelink.com / password123
      </div>
    </>
  );
}
