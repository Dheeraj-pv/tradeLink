"use client";
import Image from "next/image";


import { useState } from "react";
import { toast } from "sonner";

type Step = "idle" | "scan" | "backup-codes";

interface TwoFactorSetupProps {
  // Pass down from a server component / session check — whether the
  // logged-in user currently has 2FA enabled.
  initialEnabled: boolean;
}

export default function TwoFactorSetup({
  initialEnabled,
}: TwoFactorSetupProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [step, setStep] = useState<Step>("idle");

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const [disableCode, setDisableCode] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function startSetup() {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/2fa/setup", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not start 2FA setup.");
        return;
      }

      setQrCodeDataUrl(data.qrCodeDataUrl);
      setManualSecret(data.secret);
      setStep("scan");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmSetup() {
    if (confirmCode.trim().length === 0) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/2fa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: confirmCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid code. Please try again.");
        return;
      }

      setBackupCodes(data.backupCodes || []);
      setEnabled(true);
      setStep("backup-codes");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function disableTwoFactor() {
    if (disableCode.trim().length === 0) {
      toast.error("Enter a code to confirm.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: disableCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid code.");
        return;
      }

      toast.success("Two-factor authentication disabled.");
      setEnabled(false);
      setShowDisableForm(false);
      setDisableCode("");
      setStep("idle");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function finishSetup() {
    setStep("idle");
    setQrCodeDataUrl(null);
    setManualSecret(null);
    setConfirmCode("");
    setBackupCodes([]);
  }

  return (
    <div className="tfa-card">
      <style>{`
        .tfa-card{
          border:1.5px solid var(--border, #e2ddd8);
          border-radius:12px;
          padding:24px;
          max-width:480px;
          background:var(--white,#fff);
        }
        .tfa-status{
          display:flex; align-items:center; gap:10px; margin-bottom:16px;
        }
        .tfa-badge{
          font-size:.75rem; font-weight:700; padding:4px 10px;
          border-radius:999px; text-transform:uppercase; letter-spacing:.02em;
        }
        .tfa-badge.on{ background:#ecfdf5; color:#166534; }
        .tfa-badge.off{ background:#fdecec; color:#c92e2e; }
        .tfa-qr{
          display:flex; justify-content:center; margin:16px 0;
        }
        .tfa-qr img{ width:200px; height:200px; }
        .tfa-secret{
          font-family:monospace; background:#f5f2ec; padding:10px 12px;
          border-radius:8px; font-size:.85rem; word-break:break-all; margin-bottom:16px;
        }
        .tfa-field{ margin-bottom:16px; }
        .tfa-field label{ display:block; font-size:.8rem; font-weight:600; margin-bottom:6px; }
        .tfa-field input{
          width:100%; padding:12px 14px; border:1.5px solid var(--border,#e2ddd8);
          border-radius:9px; font-size:.9rem; font-family:inherit; letter-spacing:4px; text-align:center;
        }
        .tfa-backup-list{
          list-style:none; display:grid; grid-template-columns:1fr 1fr;
          gap:8px; margin:16px 0; padding:16px; background:#f5f2ec; border-radius:10px;
          font-family:monospace; font-size:.85rem;
        }
        .tfa-warning{
          background:#fffbf5; border:1.5px solid #f0d9c0; border-radius:10px;
          padding:12px 14px; font-size:.82rem; color:#7a5c3a; margin-bottom:16px; line-height:1.5;
        }
        .tfa-btn{
          padding:11px 18px; border-radius:9px; border:none; font-weight:600;
          font-size:.875rem; cursor:pointer; font-family:inherit;
        }
        .tfa-btn.primary{ background:var(--navy,#1a2540); color:#fff; }
        .tfa-btn.primary:disabled{ opacity:.6; cursor:not-allowed; }
        .tfa-btn.danger{ background:#fdecec; color:#c92e2e; }
        .tfa-btn.ghost{ background:transparent; color:var(--sub,#7a7060); text-decoration:underline; }
      `}</style>

      <div className="tfa-status">
        <span className={`tfa-badge ${enabled ? "on" : "off"}`}>
          {enabled ? "Enabled" : "Disabled"}
        </span>
        <p style={{ fontSize: ".85rem", color: "#7a7060" }}>
          Two-factor authentication{" "}
          {enabled
            ? "adds a code from your authenticator app to sign-in and password resets."
            : "is currently off. Turn it on for extra account protection."}
        </p>
      </div>

      {/* Not enabled, no setup in progress */}
      {!enabled && step === "idle" && (
        <button
          className="tfa-btn primary"
          onClick={startSetup}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Starting…" : "Enable two-factor authentication"}
        </button>
      )}

      {/* Setup in progress — scan QR + confirm */}
      {step === "scan" && (
        <>
          <p
            style={{
              fontSize: ".85rem",
              marginBottom: "12px",
              color: "#7a7060",
            }}
          >
            Scan this QR code with Google Authenticator, Authy, or any TOTP app.
          </p>

          {qrCodeDataUrl && (
            <div className="tfa-qr">
              <Image
                src=""
                alt="Scan with your authenticator app"
                width={100}
                height={100}
              />
            </div>
          )}

          {manualSecret && (
            <>
              <p
                style={{
                  fontSize: ".78rem",
                  color: "#7a7060",
                  marginBottom: "6px",
                }}
              >
                Can't scan? Enter this code manually:
              </p>
              <div className="tfa-secret" style={{ color: "#7a7060" }}>
                {manualSecret}
              </div>
            </>
          )}

          <div className="tfa-field">
            <label htmlFor="confirm-code" style={{ color: "#7a7060" }}>
              Enter the 6-digit code to confirm
            </label>
            <input
              style={{ color: "#7a7060" }}
              id="confirm-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="tfa-btn primary"
              onClick={confirmSetup}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Confirming…" : "Confirm and enable"}
            </button>
            <button className="tfa-btn ghost" onClick={finishSetup}>
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Just enabled — show backup codes once */}
      {step === "backup-codes" && (
        <>
          <div className="tfa-warning">
            Save these backup codes somewhere safe. Each one can be used once to
            sign in if you lose access to your authenticator app. They won't be
            shown again.
          </div>

          <ul className="tfa-backup-list" style={{ color: "#7a7060" }}>
            {backupCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <button className="tfa-btn primary" onClick={finishSetup}>
            I've saved my codes
          </button>
        </>
      )}

      {/* Already enabled — offer to disable */}
      {enabled && step === "idle" && (
        <>
          {!showDisableForm ? (
            <button
              className="tfa-btn danger"
              onClick={() => setShowDisableForm(true)}
            >
              Disable two-factor authentication
            </button>
          ) : (
            <>
              <div className="tfa-field">
                <label htmlFor="disable-code">
                  Enter a code to confirm disabling 2FA
                </label>
                <input
                  id="disable-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="tfa-btn danger"
                  onClick={disableTwoFactor}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Disabling…" : "Confirm disable"}
                </button>
                <button
                  className="tfa-btn ghost"
                  onClick={() => {
                    setShowDisableForm(false);
                    setDisableCode("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
