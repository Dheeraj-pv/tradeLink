"use client";

import { PageHeader, SettingsCard } from "@/components/ui/page-components";
import TwoFactorSetup from "@/components/two-factor-setup";
import { useCustomerSecurity } from "./hooks/useCustomerSecurity";
import { ChangePasswordForm } from "./components/ChangePasswordForm";
import { DangerZone } from "./components/DangerZone";
import type { SecurityClientProps } from "./types";

export default function SecurityClient({
  initialTwoFactorEnabled,
}: SecurityClientProps) {
  const {
    formData,
    changingPassword,
    updateFormData,
    handlePasswordChange,
    handleDeleteAccount,
    handleTwoFactorCodeChange,
  } = useCustomerSecurity();

  return (
    <div className="dash-page">
      <PageHeader
        title="Security"
        subtitle="Manage your password, two-factor authentication, and account security."
      />

      {/* Change Password */}
      <SettingsCard title="Change Password">
        <ChangePasswordForm
          formData={formData}
          onUpdate={updateFormData}
          onTwoFactorCodeChange={handleTwoFactorCodeChange}
          onSubmit={handlePasswordChange}
          changing={changingPassword}
          showTwoFactor={initialTwoFactorEnabled}
        />
      </SettingsCard>

      {/* Two Factor Authentication */}
      <SettingsCard
        title="Two-Factor Authentication"
        subtitle="Add an extra layer of security to your account by enabling two-factor authentication."
      >
        <TwoFactorSetup initialEnabled={initialTwoFactorEnabled} />
      </SettingsCard>

      {/* Danger Zone */}
      <SettingsCard title="Danger Zone" className="danger-card">
        <DangerZone onDelete={handleDeleteAccount} />
      </SettingsCard>

      <style>{`
        .form-field {
          margin-bottom: 20px;
        }
        .form-field label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }
        .form-field input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--border);
          border-radius: 9px;
          font-size: 0.9rem;
          font-family: inherit;
          background: var(--white);
          color: var(--text);
          outline: none;
          transition: border-color 0.15s;
        }
        .form-field input:focus {
          border-color: var(--navy);
        }
        .field-help {
          margin-top: 8px;
          font-size: 0.8rem;
          color: var(--sub);
          line-height: 1.4;
        }
        .btn-update {
          padding: 12px 24px;
          border: none;
          border-radius: 9px;
          background: var(--navy);
          color: #fff;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-update:hover:not(:disabled) {
          background: #253460;
        }
        .btn-update:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .danger-card {
          border-color: #f3c7c7;
        }
        .danger-text {
          font-size: 0.9rem;
          color: var(--sub);
          margin-bottom: 18px;
          line-height: 1.6;
        }
        .btn-delete {
          padding: 11px 22px;
          border: none;
          border-radius: 9px;
          background: #d33;
          color: #fff;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-delete:hover {
          background: #b82424;
        }
      `}</style>
    </div>
  );
}
