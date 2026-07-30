"use client";

import { PageHeader, SettingsCard } from "@/components/ui/page-components";
import { useCustomerProfile } from "./hooks/useCustomerProfile";
import { ProfileForm } from "./components/ProfileForm";

export default function ProfilePage() {
  const { profile, loading, saving, updateProfile, saveProfile } =
    useCustomerProfile();

  if (loading) {
    return (
      <div className="dash-page">
        <PageHeader title="Profile" subtitle="Loading..." />
      </div>
    );
  }

  return (
    <div className="dash-page">
      <PageHeader
        title="Profile"
        subtitle="Manage your personal information."
      />

      <SettingsCard title="Personal Information">
        <ProfileForm
          profile={profile}
          onUpdate={updateProfile}
          onSave={saveProfile}
          saving={saving}
        />
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
        .form-field input:focus:not(.input-disabled) {
          border-color: var(--navy);
        }
        .form-field input.input-disabled {
          background: var(--bg-subtle);
          color: var(--sub);
          cursor: not-allowed;
          opacity: 0.7;
        }
        .field-help {
          font-size: 0.78rem;
          color: var(--sub);
          margin-top: 6px;
        }
        .btn-save {
          padding: 12px 28px;
          border: none;
          border-radius: 9px;
          background: var(--navy);
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s, opacity 0.15s;
        }
        .btn-save:hover:not(:disabled) {
          background: #253460;
        }
        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
