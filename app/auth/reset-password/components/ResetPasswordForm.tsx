import type { PasswordRule } from "../types";

interface Props {
  password: string;
  onPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  isSubmitting: boolean;
  passwordChecks: PasswordRule[];
  firstFailedRule: PasswordRule | undefined;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children?: React.ReactNode;
}

export function ResetPasswordForm({
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  isSubmitting,
  passwordChecks,
  firstFailedRule,
  onSubmit,
  children,
}: Props) {
  return (
    <form onSubmit={onSubmit} noValidate>
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
          onChange={(e) => onPasswordChange(e.target.value)}
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
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          required
        />
      </div>

      {children}

      <button
        type="submit"
        className="btn-auth-primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Updating..." : "Reset Password"}
      </button>
    </form>
  );
}
