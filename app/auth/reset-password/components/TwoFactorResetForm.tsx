interface Props {
  totpCode: string;
  onTotpCodeChange: (value: string) => void;
  useBackupCode: boolean;
  onToggleBackupCode: () => void;
}

export function TwoFactorResetForm({
  totpCode,
  onTotpCodeChange,
  useBackupCode,
  onToggleBackupCode,
}: Props) {
  return (
    <div className="auth-field">
      <label htmlFor="totp-code">
        {useBackupCode ? "Backup code" : "Authentication code"} <span>*</span>
      </label>

      <input
        id="totp-code"
        type="text"
        inputMode={useBackupCode ? "text" : "numeric"}
        placeholder={useBackupCode ? "xxxxxxxxxx" : "123456"}
        maxLength={useBackupCode ? 10 : 6}
        className={useBackupCode ? "" : "otp-input"}
        value={totpCode}
        onChange={(e) => onTotpCodeChange(e.target.value)}
        autoComplete="one-time-code"
        required
      />

      <p style={{ marginTop: "8px" }}>
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
    </div>
  );
}
