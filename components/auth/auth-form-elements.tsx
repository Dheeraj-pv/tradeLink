import Link from "next/link";
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

type AuthTabValue = "login" | "register";

type PasswordRule = {
  valid: boolean;
  message: string;
};

type AuthFieldProps = {
  id?: string;
  label: ReactNode;
  name?: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  className?: string;
  autoFocus?: boolean;
  children?: ReactNode;
};

export function AuthTabs({ active }: { active: AuthTabValue }) {
  return (
    <div className="auth-tabs">
      <Link
        href="/auth/login"
        className={`auth-tab ${active === "login" ? "active" : ""}`}
      >
        Log in
      </Link>
      <Link
        href="/auth/register"
        className={`auth-tab ${active === "register" ? "active" : ""}`}
      >
        Register
      </Link>
    </div>
  );
}

export function AuthField({
  id,
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  required = false,
  inputMode,
  maxLength,
  className,
  autoFocus,
  children,
}: AuthFieldProps) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>
        {label}
        {required && <span>*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        className={className}
        autoFocus={autoFocus}
      />
      {children}
    </div>
  );
}

export function PasswordRules({
  password,
  rules,
}: {
  password: string;
  rules: PasswordRule[];
}) {
  const firstFailedRule = rules.find((rule) => !rule.valid);

  if (password.length === 0) return null;

  return (
    <div className="password-rules">
      {firstFailedRule ? (
        <p className="invalid">✖ {firstFailedRule.message}</p>
      ) : (
        <p className="valid">✔ Password looks good</p>
      )}
    </div>
  );
}

export function RoleSelector({
  role,
  onChange,
}: {
  role: "CUSTOMER" | "PROVIDER";
  onChange: (value: "CUSTOMER" | "PROVIDER") => void;
}) {
  return (
    <>
      <p className="role-label">I am a…</p>
      <div className="role-grid">
        <button
          type="button"
          className={`role-card ${role === "CUSTOMER" ? "selected" : ""}`}
          onClick={() => onChange("CUSTOMER")}
        >
          <div className="role-name">Customer</div>
          <div className="role-sub-text">I need work done</div>
        </button>
        <button
          type="button"
          className={`role-card ${role === "PROVIDER" ? "selected" : ""}`}
          onClick={() => onChange("PROVIDER")}
        >
          <div className="role-name">Provider</div>
          <div className="role-sub-text">I offer services</div>
        </button>
      </div>
    </>
  );
}
