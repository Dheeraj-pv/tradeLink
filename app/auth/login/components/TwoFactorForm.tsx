import { AuthField } from "@/components/auth/auth-form-elements";

interface Props {
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  useBackupCode: boolean;
  onToggleBackupCode: () => void;
  onBack: () => void;
}

export function TwoFactorForm({
  code,
  onCodeChange,
  onSubmit,
  isSubmitting,
  useBackupCode,
  onToggleBackupCode,
  onBack,
}: Props) {
  return (
    <>
      <h2>Two-factor verification</h2>
      <p className="auth-subtitle">
        {useBackupCode
          ? "Enter one of your saved backup codes."
          : "Enter the 6-digit code from your authenticator app."}
      </p>

      <form onSubmit={onSubmit} noValidate>
        <AuthField
          id="totp-code"
          label={useBackupCode ? "Backup code" : "Authentication code"}
          type="text"
          inputMode={useBackupCode ? "text" : "numeric"}
          placeholder={useBackupCode ? "xxxxxxxxxx" : "123456"}
          maxLength={useBackupCode ? 10 : 6}
          className={useBackupCode ? "" : "otp-input"}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
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
          onClick={onToggleBackupCode}
        >
          {useBackupCode
            ? "Use authenticator code instead"
            : "Use a backup code instead"}
        </button>
      </p>

      <p className="auth-switch">
        <button type="button" className="link-button" onClick={onBack}>
          Back to login
        </button>
      </p>
    </>
  );
}
