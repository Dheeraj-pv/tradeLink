"use client";
// app/provider/settings/security/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TwoFactorSetup from "@/components/two-factor-setup";
import { PageHeader, SettingsTabs } from "@/components/ui/page-components";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

interface SecurityClientProps {
  initialTwoFactorEnabled: boolean;
}

export default function SecurityClient({
  initialTwoFactorEnabled,
}: SecurityClientProps) {
  const router = useRouter();


  // Password form state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [savingPw, setSavingPw] = useState(false);





  // ── Change password ───────────────────────────────────────────────────
  async function handleChangePassword() {
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/provider/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "password",
          currentPassword: currentPw,
          newPassword: newPw,
          confirmPassword: confirmPw,
          twoFactorCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }
      toast.success("Password updated successfully");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTwoFactorCode("");
    } catch {
      toast.error("Network error");
    } finally {
      setSavingPw(false);
    }
  }

  // ── Delete account ────────────────────────────────────────────────────
  async function handleDeleteAccount() {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/provider/settings", { method: "DELETE" });
      if (res.ok) router.push("/auth/login");
      else toast.error("Failed to delete account");
    } catch {
      toast.error("Network error");
    }
  }



  return (
    <div className="dash-page">
      <PageHeader title="Provider Settings" subtitle="Manage your account security" />

      <SettingsTabs items={[{ href: "/provider/profile", label: "Profile" }, { href: "/provider/security", label: "Security" }]} />

      <div className="ps-layout-single">
        {/* Account info */}
        <div className="ps-card ps-account-summary">
          <p className="ps-account-label">ACCOUNT</p>
          <div className="ps-account-row">
            <span className="ps-account-key">Role</span>
            <span className="ps-account-val">Provider</span>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="ps-card">
  <h2 className="ps-card-title">Two-Factor Authentication</h2>

  <p className="ps-card-desc">
    Add an extra layer of protection by requiring a code from your
    authenticator app when signing in or resetting your password.
  </p>

  <TwoFactorSetup initialEnabled={initialTwoFactorEnabled} />
</div>

        {/* Change Password */}
        <div className="ps-card">
          <h2 className="ps-card-title">Change Password</h2>
          <div className="ps-field">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
          </div>
          <div className="ps-field-row">
            <div className="ps-field">
              <label>New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
            </div>
            <div className="ps-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
            </div>
          </div>
          {initialTwoFactorEnabled && (
  <div className="ps-field">
    <label>Authenticator Code</label>

    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]*"
      maxLength={6}
      placeholder="123456"
      value={twoFactorCode}
      onChange={(e) =>
        setTwoFactorCode(
          e.target.value.replace(/\D/g, "").slice(0, 6),
        )
      }
    />

    <p className="ps-field-help">
      Enter the 6-digit code from your authenticator app or a backup code.
    </p>
  </div>
)}
          <button
            className="btn-save"
            disabled={savingPw}
            onClick={handleChangePassword}
          >
            {savingPw ? "Updating…" : "Update Password"}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="ps-card danger-card">
          <h2 className="danger-title">Danger Zone</h2>
          <p className="danger-text">
            Permanently delete your account and all data. This cannot be undone.
          </p>
          <button className="btn-delete" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </div>

      <style>{`
        .settings-tabs {
          display: inline-flex; gap: 4px; padding: 4px;
          background: #e8e3dc; border-radius: 10px; margin-bottom: 20px;
        }
        .settings-tab {
          padding: 9px 20px; font-size: .85rem; font-weight: 600;
          border-radius: 8px; color: var(--sub); text-decoration: none;
          transition: background .15s, color .15s;
        }
        .settings-tab.active { background: var(--white); color: var(--navy); }
        .settings-tab:hover:not(.active) { color: var(--navy); }

        .ps-layout-single {
          display: flex; flex-direction: column; gap: 20px;
          max-width: 640px;
        }

        .ps-card { background: var(--white); border-radius: 14px; padding: 28px 32px; }
        .ps-card-title { font-size: 1.05rem; font-weight: 700; color: var(--navy); margin-bottom: 10px; }
        .ps-card-desc { font-size: .85rem; color: var(--sub); margin-bottom: 18px; line-height: 1.5; }

        .ps-account-summary { padding: 24px 32px; }
        .ps-account-label {
          font-size: .68rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: var(--sub); margin-bottom: 14px;
        }
        .ps-account-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .ps-account-row:last-child { margin-bottom: 0; }
        .ps-account-key { font-size: .82rem; color: var(--sub); }
        .ps-account-val { font-size: .82rem; font-weight: 700; color: var(--navy); }

        .btn-two-factor{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding:11px 20px;
          border:1.5px solid var(--border);
          border-radius:9px;
          background:var(--navy);
          color:#fff;
          font-size:.85rem;
          font-weight:600;
          text-decoration:none;
          transition:.2s;
        }
        .btn-two-factor:hover{ background:#253460; }

        .ps-field { margin-bottom: 18px; }
        .ps-field label { display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 8px; }
        .ps-field input {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid var(--border); border-radius: 9px;
          font-size: .875rem; font-family: inherit; background: var(--white); color: var(--text);
          outline: none; transition: border-color .15s;
        }
        .ps-field input:focus { border-color: var(--navy); }
        .ps-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .btn-save {
          padding: 11px 24px; border: none; border-radius: 9px;
          background: var(--navy); color: #fff; font-size: .875rem; font-weight: 600;
          font-family: inherit; cursor: pointer; transition: background .15s;
        }
        .btn-save:hover:not(:disabled) { background: #253460; }
        .btn-save:disabled { opacity: .6; cursor: not-allowed; }

        .danger-card { border: 1.5px solid #f3c7c7; }
        .danger-title { font-size: 1.05rem; font-weight: 700; color: #c92e2e; margin-bottom: 10px; }
        .danger-text { font-size: .85rem; color: var(--sub); margin-bottom: 18px; }
        .btn-delete {
          padding: 11px 22px; border: none; border-radius: 9px; background: #d33; color: #fff;
          font-size: .85rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: background .15s;
        }
        .btn-delete:hover { background: #b82424; }

        .ps-state { color: var(--sub); font-size: .9rem; padding: 40px 0; text-align: center; }
        .ps-field-help {
  margin-top: 8px;
  font-size: .8rem;
  color: var(--sub);
  line-height: 1.4;
}

        @media (max-width: 900px) {
          .ps-field-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
