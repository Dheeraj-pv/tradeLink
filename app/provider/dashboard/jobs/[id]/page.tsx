"use client";

import { useParams } from "next/navigation";
import { BriefcaseIcon, DollarIcon, PinIcon } from "@/components/ui/icons";
import { JobInfoGrid, JobStatusMeta } from "@/components/ui/job-components";
import {
  MediaGallery,
  MediaPreviewModal,
  type ServerMediaItem,
} from "@/components/ui/media-components";
import { BackLink } from "@/components/ui/page-components";
import { useJobDetail } from "./hooks/useJobDetail";
import { JobDetailCard } from "./components/JobDetailCard";
import { BidForm } from "./components/BidForm";
import { STATUS_BADGE } from "./constants";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id;

  const {
    job,
    loading,
    media,
    previewIndex,
    setPreviewIndex,
    handleBid,
    submitting,
  } = useJobDetail(jobId);

  // Loading state
  if (loading) {
    return (
      <div className="dash-page">
        <div className="detail-loading">Loading job details…</div>
      </div>
    );
  }

  // No job found
  if (!job) {
    return (
      <div className="dash-page">
        <div className="detail-loading">Job not found</div>
      </div>
    );
  }

  const badgeClass = STATUS_BADGE[job.status] ?? "badge-open";
  const isOpen = job.status === "OPEN";

  // Prepare info grid items
  const infoItems = [
    {
      label: "Address",
      value: job.address,
      icon: <PinIcon width={14} height={14} />,
    },
    {
      label: "Category",
      value: job.category,
      icon: <BriefcaseIcon width={14} height={14} />,
    },
    {
      label: "Bids Received",
      value: `${job.bidCount} ${job.bidCount === 1 ? "bid" : "bids"}`,
      icon: <DollarIcon width={14} height={14} />,
    },
  ];

  // Transform media to match ServerMediaItem type (includes id)
  const mediaItems: ServerMediaItem[] = media.map((item) => ({
    id: item.id, // Now includes the required id field
    url: item.url,
    mediaType: item.mediaType === "VIDEO" ? "VIDEO" : "IMAGE",
  }));

  return (
    <div className="dash-page">
      <BackLink href="/provider/dashboard" label="Back" />

      <div className="detail-header">
        <h1 className="dash-page-title" style={{ marginBottom: 0 }}>
          {job.title}
        </h1>
      </div>

      <JobStatusMeta
        status={job.status}
        badgeClass={badgeClass}
        createdAt={job.createdAt}
      />

      <JobInfoGrid items={infoItems} />

      <JobDetailCard title="Description" description={job.description} />

      {media.length > 0 && (
        <div className="detail-card">
          <h2 className="detail-card-title">Media</h2>
          <MediaGallery
            items={mediaItems}
            onSelect={(index) => setPreviewIndex(index)}
          />
        </div>
      )}

      {previewIndex !== null && media[previewIndex] && (
        <MediaPreviewModal
          src={media[previewIndex].url}
          type={media[previewIndex].mediaType === "VIDEO" ? "video" : "image"}
          onClose={() => setPreviewIndex(null)}
          zIndex={9999}
        />
      )}

      {isOpen && <BidForm onSubmit={handleBid} submitting={submitting} />}

      <style>{`
        .detail-loading {
          padding: 40px;
          text-align: center;
          color: var(--sub);
        }
        .detail-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .detail-card {
          background: var(--white);
          border-radius: 14px;
          padding: 28px 32px;
          margin-bottom: 20px;
        }
        .detail-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 12px;
        }
        .detail-card-text {
          font-size: 0.875rem;
          color: var(--sub);
          line-height: 1.7;
        }
        .auth-field {
          margin-bottom: 18px;
        }
        .auth-field label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .auth-field span {
          color: #d4621a;
        }
        .auth-field input,
        .auth-field textarea {
          width: 100%;
          padding: 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: inherit;
          background: white;
          transition: border-color 0.15s;
        }
        .auth-field input:focus,
        .auth-field textarea:focus {
          border-color: var(--navy);
          outline: none;
        }
        .auth-field textarea {
          resize: vertical;
          min-height: 110px;
        }
        .btn-submit-bid {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          background: var(--navy);
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-submit-bid:hover:not(:disabled) {
          background: #253460;
        }
        .btn-submit-bid:disabled {
          background: #98a2b3;
          cursor: not-allowed;
        }
        @media (max-width: 700px) {
          .detail-card {
            padding: 22px;
          }
        }
      `}</style>
    </div>
  );
}
