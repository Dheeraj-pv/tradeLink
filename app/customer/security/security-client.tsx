// app/customer/security/page.tsx

"use client";

import { toast } from "sonner";
import { useState } from "react";
import TwoFactorSetup from "@/components/two-factor-setup";
import { PageHeader, SettingsCard } from "@/components/ui/page-components";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

interface SecurityClientProps {
  initialTwoFactorEnabled: boolean;
}

export default function SecurityClient({
  initialTwoFactorEnabled,
}: SecurityClientProps) {
  const [changingPassword, setChangingPassword] = useState(false);
  console.log("2FA enabled:", initialTwoFactorEnabled);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  async function handlePassword() {
    setChangingPassword(true);

    try {
      const res = await fetch("/api/customer/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "password",
          currentPassword,
          newPassword,
          confirmPassword,
          twoFactorCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          toast.error(Object.values(data.details).flat().join("\n"));
        } else {
          toast.error(getUserFriendlyErrorMessage(data));
        }
        return;
      }

      toast.success("Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTwoFactorCode("");
    } catch {
      toast.error("Network error");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDelete() {
    const confirmDelete = window.confirm(
      "Delete your account permanently? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/customer/settings", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      window.location.href = "/auth/login";
    } catch {
      toast.error("Network error");
    }
  }

  return (
    <div className="dash-page">
      <PageHeader
        title="Security"
        subtitle="Manage your password, two-factor authentication, and account security."
      />

      {/* Change Password */}
      <SettingsCard title="Change Password">

        <div className="form-field">
          <label>Current Password</label>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>New Password</label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Confirm New Password</label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {initialTwoFactorEnabled && (
          <div className="form-field">
            <label>Authenticator Code</label>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={twoFactorCode}
              onChange={(e) =>
                setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />

            <p className="field-help">
              Enter the 6-digit code from your authenticator app to confirm your
              password change.
            </p>
          </div>
        )}

        <button
          className="btn-update"
          onClick={handlePassword}
          disabled={changingPassword}
        >
          {changingPassword ? "Updating..." : "Update Password"}
        </button>
      </SettingsCard>

      {/* Two Factor */}
      <SettingsCard
        title="Two-Factor Authentication"
        subtitle="Add an extra layer of security to your account by enabling two-factor authentication."
      >
        <TwoFactorSetup initialEnabled={initialTwoFactorEnabled} />
      </SettingsCard>

      {/* Danger Zone */}
      <SettingsCard title="Danger Zone" className="danger-card">
        <p className="danger-text">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>

        <button className="btn-delete" onClick={handleDelete}>
          Delete Account
        </button>
      </SettingsCard>

      <style>{`
        .btn-update{
          padding:12px 24px;
          border:none;
          border-radius:9px;
          background:var(--navy);
          color:#fff;
          font-size:.875rem;
          font-weight:600;
          font-family:inherit;
          cursor:pointer;
          transition:background .15s;
        }

        .btn-update:hover:not(:disabled){
          background:#253460;
        }

        .btn-update:disabled{
          opacity:.6;
          cursor:not-allowed;
        }

        .btn-delete{
          padding:11px 22px;
          border:none;
          border-radius:9px;
          background:#d33;
          color:#fff;
          font-size:.875rem;
          font-weight:600;
          font-family:inherit;
          cursor:pointer;
          transition:background .15s;
        }

        .btn-delete:hover{
          background:#b82424;
        }

        .field-help{
  margin-top:8px;
  font-size:.8rem;
  color:var(--sub);
  line-height:1.4;
}
      `}</style>
    </div>
  );
}
