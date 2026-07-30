"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  MediaPreviewModal,
  type ServerMediaItem,
} from "@/components/ui/media-components";
import { BackLink } from "@/components/ui/page-components";
import { useProviderProfile } from "./hooks/useProviderProfile";
import { ProviderHeader } from "./components/ProviderHeader";
import { ProviderInfo } from "./components/ProviderInfo";
import { CertificationsList } from "./components/CertificationsList";
import { ReviewsList } from "./components/ReviewsList";
import type { Certification } from "./types";

export default function ProviderProfilePage() {
  const params = useParams<{ id: string; providerId: string }>();
  const jobId = params?.id;
  const providerId = params?.providerId;

  const { provider, reviews, loading, error } = useProviderProfile(providerId);
  const [previewMedia, setPreviewMedia] = useState<ServerMediaItem | null>(
    null,
  );

  const backLink = `/customer/dashboard/jobs/${jobId}/bids`;

  // Loading state
  if (loading) {
    return (
      <div className="dash-page">
        <BackLink href={backLink} label="Back to Bids" />
        <p className="dash-page-sub">Loading profile…</p>
      </div>
    );
  }

  // Error or no provider
  if (error || !provider) {
    return (
      <div className="dash-page">
        <BackLink href={backLink} label="Back to Bids" />
        <p
          className="dash-page-sub"
          style={{ color: "var(--error-color, #c92e2e)" }}
        >
          {error ?? "Provider not found"}
        </p>
      </div>
    );
  }

  const handleCertClick = (cert: Certification) => {
    setPreviewMedia({
      id: cert.id,
      url: cert.url,
      mediaType: "IMAGE",
    });
  };

  return (
    <div className="dash-page">
      <BackLink href={backLink} label="Back to Bids" />

      <div className="profile-card">
        <ProviderHeader provider={provider} />
        <ProviderInfo provider={provider} />

        <div className="profile-body">
          <CertificationsList
            certifications={provider.certifications}
            onCertClick={handleCertClick}
          />

          <ReviewsList reviews={reviews} onMediaSelect={setPreviewMedia} />
        </div>
      </div>

      {previewMedia && (
        <MediaPreviewModal
          src={previewMedia.url}
          type={previewMedia.mediaType === "VIDEO" ? "video" : "image"}
          onClose={() => setPreviewMedia(null)}
          lightCloseButton
        />
      )}

      <style>{`
        .profile-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          max-width: 620px;
        }
        .profile-header {
          background: var(--navy);
          padding: 32px;
          display: flex;
          gap: 28px;
          align-items: center;
        }
        .avatar {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          background: #e26f1c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
          overflow: hidden;
        }
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-header h1 {
          color: white;
          font-size: 2rem;
          margin-bottom: 4px;
        }
        .profile-header p {
          color: #d6dff0;
          margin-bottom: 14px;
        }
        .rating {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1rem;
        }
        .rating span {
          color: white;
        }
        .profile-body {
          padding: 28px;
        }
        .profile-body section {
          margin-bottom: 34px;
        }
        .profile-body section:last-child {
          margin-bottom: 0;
        }
        .profile-body h2 {
          font-size: 1.75rem;
          margin-bottom: 14px;
          color: var(--navy);
        }
        .profile-body p {
          line-height: 1.8;
          color: var(--sub);
        }
        .reviews {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .review-card {
          padding: 18px;
          background: #faf8f4;
          border-radius: 10px;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          align-items: center;
        }
        .review-card p {
          font-size: 0.9rem;
          line-height: 1.7;
          margin-bottom: 12px;
        }
        .cert-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
        .cert-card {
          background: #faf8f4;
          border-radius: 12px;
          padding: 12px;
          cursor: pointer;
          transition: 0.15s;
        }
        .cert-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .cert-card img {
          width: 100%;
          height: 140px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        .cert-card p {
          font-size: 0.9rem;
          font-weight: 600;
          text-align: center;
          color: var(--text);
          margin: 0;
        }
        .dash-page-sub {
          color: var(--sub);
          font-size: 0.9rem;
          padding: 20px 0;
        }
        @media (max-width: 700px) {
          .profile-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .profile-card {
            max-width: 100%;
          }
          .cert-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 450px) {
          .cert-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
