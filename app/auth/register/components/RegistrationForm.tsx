import Link from "next/link";
import {
  AuthField,
  AuthTabs,
  PasswordRules,
  RoleSelector,
} from "@/components/auth/auth-form-elements";
import { CategorySelector } from "./CategorySelector";
import type { Role, Category } from "../types";

interface Props {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  role: Role;
  onRoleChange: (role: Role) => void;
  categories: Category[];
  selectedCategories: number[];
  showCategories: boolean;
  onToggleCategories: () => void;
  onCategoryToggle: (
    categoryId: number,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  categoryError: string;
  maxCategories: number;
  loading: boolean;
  success: string;
  password: string;
  passwordChecks: Array<{ valid: boolean; message: string }>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function RegistrationForm({
  formData,
  onFormChange,
  role,
  onRoleChange,
  categories,
  selectedCategories,
  showCategories,
  onToggleCategories,
  onCategoryToggle,
  categoryError,
  maxCategories,
  loading,
  success,
  password,
  passwordChecks,
  onSubmit,
}: Props) {
  return (
    <>
      <h2>Create account</h2>
      <p className="auth-subtitle">
        Join thousands of customers and providers on TradeLink.
      </p>

      <AuthTabs active="register" />
      <RoleSelector role={role} onChange={onRoleChange} />

      <form onSubmit={onSubmit} noValidate>
        <div className="auth-field-row">
          <AuthField
            id="firstName"
            label="First name"
            name="firstName"
            value={formData.firstName}
            onChange={onFormChange}
            type="text"
            placeholder="Jane"
            required
          />

          <AuthField
            id="lastName"
            label="Last name"
            name="lastName"
            value={formData.lastName}
            onChange={onFormChange}
            type="text"
            placeholder="Smith"
            required
          />
        </div>

        <AuthField
          id="email"
          label="Email address"
          name="email"
          value={formData.email}
          onChange={onFormChange}
          type="email"
          placeholder="you@email.com"
          required
        />

        <AuthField
          id="password"
          label="Password"
          name="password"
          value={formData.password}
          onChange={onFormChange}
          type="password"
          placeholder="••••••••"
          required
        >
          <PasswordRules password={password} rules={passwordChecks} />
        </AuthField>

        <AuthField
          id="phone"
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={onFormChange}
          type="text"
          placeholder="+91 9876543210"
        />

        {role === "PROVIDER" && (
          <CategorySelector
            categories={categories}
            selectedCategories={selectedCategories}
            maxCategories={maxCategories}
            showDropdown={showCategories}
            onToggleDropdown={onToggleCategories}
            onCategoryToggle={onCategoryToggle}
            error={categoryError}
          />
        )}

        {success && <p className="auth-success">{success}</p>}

        <button type="submit" disabled={loading} className="btn-auth-primary">
          {loading ? "Creating Account..." : "Create account"}
        </button>
      </form>

      <p className="auth-terms">
        By creating an account you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </p>

      <p className="auth-switch">
        Already have an account? <Link href="/auth/login">Log in</Link>
      </p>
    </>
  );
}
