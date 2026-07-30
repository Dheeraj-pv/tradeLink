"use client";

import { useLogin } from "./hooks/useLogin";
import { CredentialsForm } from "./components/CredentialsForm";
import { TwoFactorForm } from "./components/TwoFactorForm";

export default function LoginPage() {
  const {
    stage,
    email,
    setEmail,
    password,
    setPassword,
    code,
    setCode,
    useBackupCode,
    setUseBackupCode,
    isSubmitting,
    handleCredentialsSubmit,
    handleTwoFactorSubmit,
    backToCredentials,
  } = useLogin();

  // Password checks - now defined inside the component where password is available
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

  return (
    <>
      <style>{`
        .password-rules {
          margin-top: 8px;
        }
        .password-rules p {
          font-size: 0.8rem;
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
          font-size: .85rem;
          cursor: pointer;
          font-family: inherit;
        }
        .link-button:hover {
          text-decoration: underline;
        }
      `}</style>

      {stage === "credentials" ? (
        <CredentialsForm
          email={email}
          onEmailChange={setEmail}
          password={password}
          onPasswordChange={setPassword}
          onSubmit={handleCredentialsSubmit}
          isSubmitting={isSubmitting}
          passwordChecks={passwordChecks}
        />
      ) : (
        <TwoFactorForm
          code={code}
          onCodeChange={setCode}
          onSubmit={handleTwoFactorSubmit}
          isSubmitting={isSubmitting}
          useBackupCode={useBackupCode}
          onToggleBackupCode={() => setUseBackupCode(!useBackupCode)}
          onBack={backToCredentials}
        />
      )}
    </>
  );
}
