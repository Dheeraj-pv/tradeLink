import type { PasswordFormState } from "../types";

interface Props {
  formState: PasswordFormState;
  onFormChange: (updates: Partial<PasswordFormState>) => void;
  onTwoFactorCodeChange: (value: string) => void;
  onSubmit: () => void;
  saving: boolean;
  showTwoFactor: boolean;
}

export function ChangePasswordForm({
  formState,
  onFormChange,
  onTwoFactorCodeChange,
  onSubmit,
  saving,
  showTwoFactor,
}: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="ps-card" onSubmit={handleSubmit}>
      <h2 className="ps-card-title">Change Password</h2>

      <div className="ps-field">
        <label>Current Password</label>
        <input
          type="password"
          value={formState.currentPassword}
          onChange={(e) => onFormChange({ currentPassword: e.target.value })}
          required
        />
      </div>

      <div className="ps-field-row">
        <div className="ps-field">
          <label>New Password</label>
          <input
            type="password"
            value={formState.newPassword}
            onChange={(e) => onFormChange({ newPassword: e.target.value })}
            required
            minLength={8}
          />
        </div>
        <div className="ps-field">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={formState.confirmPassword}
            onChange={(e) => onFormChange({ confirmPassword: e.target.value })}
            required
          />
        </div>
      </div>

      {showTwoFactor && (
        <div className="ps-field">
          <label>Authenticator Code</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="123456"
            value={formState.twoFactorCode}
            onChange={(e) => onTwoFactorCodeChange(e.target.value)}
          />
          <p className="ps-field-help">
            Enter the 6-digit code from your authenticator app or a backup code.
          </p>
        </div>
      )}

      <button type="submit" className="btn-save" disabled={saving}>
        {saving ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}
