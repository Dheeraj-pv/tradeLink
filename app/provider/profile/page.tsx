"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, SettingsTabs } from "@/components/ui/page-components";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import { useProfileSettings } from "./hooks/useProfileSettings";
import { ProfileSidebar } from "./components/ProfileSidebar";
import { ProfileForm } from "./components/ProfileForm";
import { CertificationsSection } from "./components/CertificationsSection";
import { PhotoModal } from "./components/PhotoModal";

export default function ProviderProfileSettingsPage() {
  const {
    profile,
    certifications,
    categories,
    loading,
    name,
    setName,
    phone,
    setPhone,
    categoryIds,
    setCategoryIds,
    profilePhoto,
    setProfilePhoto,
    saveProfile,
    fetchSettings,
    setCertifications,
  } = useProfileSettings();

  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const handlePhotoChange = (file: File) => {
    setPendingPhoto(file);
    setPendingPreview(URL.createObjectURL(file));
    setShowPhotoModal(true);
  };

  const handleConfirmPhoto = async () => {
    if (!pendingPhoto) return;

    try {
      const formData = new FormData();
      formData.append("image", pendingPhoto);

      const res = await fetch("/api/provider/settings/profile-image", {
        method: "POST",
        body: formData,
      });

      const response = await res.json();

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(response));
        return;
      }

      setProfilePhoto(response.data.imageUrl);
      setPendingPhoto(null);
      setPendingPreview(null);
      setShowPhotoModal(false);
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleCancelPhoto = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingPhoto(null);
    setPendingPreview(null);
    setShowPhotoModal(false);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await saveProfile();
    setSavingProfile(false);
  };

  if (loading) {
    return (
      <div className="dash-page">
        <p className="ps-state">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <PageHeader title="Provider Settings" subtitle="Manage your profile and preferences" />

      <SettingsTabs
        items={[
          { href: "/provider/profile", label: "Profile" },
          { href: "/provider/security", label: "Security" },
        ]}
      />

      <div className="ps-layout">
        <ProfileSidebar
          profile={profile}
          categories={categories}
          profilePhoto={profilePhoto}
          onPhotoChange={handlePhotoChange}
        />

        <div className="ps-right">
          <ProfileForm
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            categories={categories}
            categoryIds={categoryIds}
            setCategoryIds={setCategoryIds}
            onSave={handleSaveProfile}
            saving={savingProfile}
          />

          <CertificationsSection
            certifications={certifications}
            setCertifications={setCertifications}
            onRefresh={fetchSettings}
          />
        </div>
      </div>

      <PhotoModal
        preview={pendingPreview}
        onConfirm={handleConfirmPhoto}
        onCancel={handleCancelPhoto}
      />

      <style>{`
        .settings-tabs {
          display: inline-flex;
          gap: 4px;
          padding: 4px;
          background: #e8e3dc;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .settings-tab {
          padding: 9px 20px;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
          color: var(--sub);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .settings-tab.active {
          background: var(--white);
          color: var(--navy);
        }
        .settings-tab:hover:not(.active) {
          color: var(--navy);
        }

        .ps-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 24px;
          align-items: start;
        }

        /* LEFT SIDEBAR */
        .ps-left {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ps-side-card {
          background: var(--white);
          border-radius: 14px;
          padding: 24px;
        }
        .ps-avatar {
          width: 72px;
          height: 72px;
          background: var(--orange);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.6rem;
          margin: 0 auto 14px;
        }
        .ps-avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          display: block;
        }
        .ps-avatar-name {
          text-align: center;
          font-size: 1rem;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 2px;
        }
        .ps-avatar-trade {
          text-align: center;
          font-size: 0.8rem;
          color: var(--sub);
          margin-bottom: 10px;
        }
        .ps-avatar-rating {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--navy);
          margin-bottom: 14px;
        }
        .ps-avatar-reviews {
          font-weight: 400;
          color: var(--sub);
        }
        .btn-change-photo {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 9px 16px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          background: var(--white);
          color: var(--text);
          font-size: 0.82rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .btn-change-photo:hover {
          border-color: var(--navy);
        }

        .ps-account-card {
          padding: 20px;
        }
        .ps-account-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--sub);
          margin-bottom: 14px;
        }
        .ps-account-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .ps-account-key {
          font-size: 0.82rem;
          color: var(--sub);
        }
        .ps-account-val {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--navy);
        }

        /* RIGHT CONTENT */
        .ps-right {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ps-card {
          background: var(--white);
          border-radius: 14px;
          padding: 28px 32px;
        }
        .ps-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 22px;
        }

        .ps-field {
          margin-bottom: 18px;
        }
        .ps-field label {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }
        .ps-field input,
        .ps-field select {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid var(--border);
          border-radius: 9px;
          font-size: 0.875rem;
          font-family: inherit;
          background: var(--white);
          color: var(--text);
          outline: none;
          transition: border-color 0.15s;
        }
        .ps-field input:focus,
        .ps-field select:focus {
          border-color: var(--navy);
        }
        .ps-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .btn-save {
          padding: 11px 24px;
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
        .btn-save:hover:not(:disabled) {
          background: #253460;
        }
        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Certifications */
        .cert-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }
        .cert-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f5f2ee;
          border-radius: 9px;
          padding: 11px 16px;
        }
        .cert-label {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .cert-info {
          display: flex;
          align-items: center;
        }
        .cert-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .cert-title svg {
          color: var(--orange);
        }
        .btn-remove {
          background: none;
          border: none;
          cursor: pointer;
          color: #d33;
          font-size: 0.8rem;
          font-weight: 600;
          font-family: inherit;
          transition: color 0.15s;
        }
        .btn-remove:hover {
          color: #b82424;
        }
        .cert-input-row {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .cert-input {
          flex: 1;
          padding: 10px 14px;
          border: 1.5px solid var(--border);
          border-radius: 9px;
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
          min-width: 150px;
        }
        .cert-input:focus {
          border-color: var(--navy);
        }
        .btn-cert-confirm {
          padding: 10px 16px;
          border: none;
          border-radius: 9px;
          background: var(--navy);
          color: #fff;
          font-size: 0.82rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
        }
        .btn-cert-confirm:hover:not(:disabled) {
          background: #253460;
        }
        .btn-cert-confirm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-cert-cancel {
          padding: 10px 14px;
          border: 1.5px solid var(--border);
          border-radius: 9px;
          background: var(--white);
          color: var(--sub);
          font-size: 0.82rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
        }
        .btn-cert-cancel:hover {
          background: #f5f5f5;
        }
        .btn-add-cert {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border: 1.5px solid var(--border);
          border-radius: 9px;
          background: var(--white);
          color: var(--text);
          font-size: 0.85rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .btn-add-cert:hover {
          border-color: var(--navy);
        }

        .ps-state {
          color: var(--sub);
          font-size: 0.9rem;
          padding: 40px 0;
          text-align: center;
        }
        .category-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .category-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .category-item input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .photo-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .photo-content {
          position: relative;
          background: white;
          padding: 30px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          width: 90%;
          max-width: 420px;
        }
        .photo-preview {
          width: 220px;
          height: 220px;
          border-radius: 50%;
          object-fit: cover;
        }
        .photo-actions {
          display: flex;
          gap: 12px;
        }
        .btn-close-preview {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.65);
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-close-preview:hover {
          background: rgba(0, 0, 0, 0.85);
        }
        .btn-confirm {
          padding: 10px 24px;
          border: none;
          border-radius: 8px;
          background: var(--navy);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-confirm:hover {
          background: #253460;
        }
        .btn-cancel-photo {
          padding: 10px 24px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-cancel-photo:hover {
          background: #f5f5f5;
        }
        .cert-thumb {
          width: 72px;
          height: 72px;
          border-radius: 10px;
          object-fit: cover;
          cursor: pointer;
          border: 1px solid var(--border);
          transition: 0.15s;
          flex-shrink: 0;
        }
        .cert-thumb:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .cert-full-image {
          max-width: 85vw;
          max-height: 85vh;
          border-radius: 12px;
          object-fit: contain;
        }

        @media (max-width: 900px) {
          .ps-layout {
            grid-template-columns: 1fr;
          }
          .ps-field-row {
            grid-template-columns: 1fr;
          }
          .cert-input-row {
            flex-direction: column;
            align-items: stretch;
          }
          .cert-input {
            min-width: unset;
          }
        }
      `}</style>
    </div>
  );
}