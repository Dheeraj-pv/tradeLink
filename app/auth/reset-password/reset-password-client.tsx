"use client";

import { useResetPassword } from "./hooks/useResetPassword";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
import { TwoFactorResetForm } from "./components/TwoFactorResetForm";
import { InvalidTokenState } from "./components/InvalidTokenState";
import { SuccessState } from "./components/SuccessState";

export default function ResetPasswordClient() {
  const {
    loading,
    tokenValid,
    requiresTwoFactor,
    useBackupCode,
    setUseBackupCode,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    totpCode,
    setTotpCode,
    success,
    isSubmitting,
    passwordChecks,
    firstFailedRule,
    handleSubmit,
  } = useResetPassword();

  if (loading) {
    return (
      <>
        <h2>Reset Password</h2>
        <p className="auth-subtitle">Validating your reset link...</p>
      </>
    );
  }

  if (!tokenValid) {
    return <InvalidTokenState />;
  }

  if (success) {
    return <SuccessState requiresTwoFactor={requiresTwoFactor} />;
  }

  return (
    <>
      <style>{`
        .password-rules {
          margin-top: 8px;
        }
        .password-rules p {
          font-size: .8rem;
          margin: 4px 0;
        }
        .valid {
          color: #16a34a;
        }
        .invalid {
          color: #dc2626;
        }
        .otp-input {
          letter-spacing: 6px;
          font-size: 1.1rem;
          text-align: center;
        }
        .link-button {
          background: none;
          border: none;
          padding: 0;
          color: var(--orange);
          font-weight: 600;
          font-size: .8rem;
          cursor: pointer;
          font-family: inherit;
        }
        .link-button:hover {
          text-decoration: underline;
        }
      `}</style>

      <h2>Reset Password</h2>

      <p className="auth-subtitle">Choose a new password for your account.</p>

      <ResetPasswordForm
        password={password}
        onPasswordChange={setPassword}
        confirmPassword={confirmPassword}
        onConfirmPasswordChange={setConfirmPassword}
        isSubmitting={isSubmitting}
        passwordChecks={passwordChecks}
        firstFailedRule={firstFailedRule}
        onSubmit={handleSubmit}
      >
        {requiresTwoFactor && (
          <TwoFactorResetForm
            totpCode={totpCode}
            onTotpCodeChange={setTotpCode}
            useBackupCode={useBackupCode}
            onToggleBackupCode={() => {
              setUseBackupCode(!useBackupCode);
              setTotpCode("");
            }}
          />
        )}
      </ResetPasswordForm>

      <p className="auth-switch">
        Remembered your password? <a href="/auth/login">Back to Login</a>
      </p>
    </>
  );
}
