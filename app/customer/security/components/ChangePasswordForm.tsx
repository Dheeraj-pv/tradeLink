import type { SecurityFormData } from "../types";

interface Props {
  formData: SecurityFormData;
  onUpdate: (data: Partial<SecurityFormData>) => void;
  onTwoFactorCodeChange: (value: string) => void;
  onSubmit: () => void;
  changing: boolean;
  showTwoFactor: boolean;
}

export function ChangePasswordForm({
  formData,
  onUpdate,
  onTwoFactorCodeChange,
  onSubmit,
  changing,
  showTwoFactor,
}: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Current Password</label>
        <input
          type="password"
          value={formData.currentPassword}
          onChange={(e) => onUpdate({ currentPassword: e.target.value })}
          required
        />
      </div>

      <div className="form-field">
        <label>New Password</label>
        <input
          type="password"
          value={formData.newPassword}
          onChange={(e) => onUpdate({ newPassword: e.target.value })}
          required
          minLength={8}
        />
      </div>

      <div className="form-field">
        <label>Confirm New Password</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => onUpdate({ confirmPassword: e.target.value })}
          required
        />
      </div>

      {showTwoFactor && (
        <div className="form-field">
          <label>Authenticator Code</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            value={formData.twoFactorCode}
            onChange={(e) => onTwoFactorCodeChange(e.target.value)}
          />
          <p className="field-help">
            Enter the 6-digit code from your authenticator app to confirm your
            password change.
          </p>
        </div>
      )}

      <button type="submit" className="btn-update" disabled={changing}>
        {changing ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
