"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link"; // ✅ Add this import
import { toast } from "sonner";
import { BriefcaseIcon, DollarIcon, PinIcon } from "@/components/ui/icons";
import {
  JobInfoGrid,
  JobProgress,
  JobStatusMeta,
} from "@/components/ui/job-components";
import {
  MediaGallery,
  MediaPreviewModal,
} from "@/components/ui/media-components";
import { BackLink } from "@/components/ui/page-components";
import { useJobDetail } from "./hooks/useJobDetail";
import { ReviewModal } from "./components/ReviewModal";
import { JobActions } from "./components/JobActions";
import { STATUS_BADGE, PROGRESS_STEPS } from "./constants";
import { shouldShowProgress, currentStageIndex } from "./utils/jobHelpers";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id;

  const {
    job,
    loading,
    media,
    cancelling,
    previewIndex,
    setPreviewIndex,
    handleCancel,
    refetch,
  } = useJobDetail(jobId);

  const [showReview, setShowReview] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="dash-page">
        <div className="detail-loading">Loading job details…</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="dash-page">
        <div className="detail-loading">Job not found</div>
      </div>
    );
  }

  const badgeClass = STATUS_BADGE[job.status] ?? "badge-open";
  const isOpen = job.status === "OPEN";
  const isAwaitingApproval = job.status === "AWAITING_APPROVAL";
  const showProgress = shouldShowProgress(job.status);
  const currentIndex = currentStageIndex(job.status);

  const handleReviewSubmitted = (): void => {
    setShowReview(false);
    void refetch();
    toast.success("Review submitted! Thank you.");
  };

  const handleApprove = (): void => {
    setShowReview(true);
  };

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

  return (
    <div className="dash-page">
      {showReview && (
        <ReviewModal
          job={job}
          onClose={() => setShowReview(false)}
          onSubmitted={handleReviewSubmitted}
        />
      )}

      <BackLink href="/customer/dashboard" label="Back" />

      <div className="detail-header">
        <h1 className="dash-page-title" style={{ marginBottom: 0 }}>
          {job.title}
        </h1>
        <JobActions
          jobId={job.id}
          isOpen={isOpen}
          isAwaitingApproval={isAwaitingApproval}
          cancelling={cancelling}
          onCancel={handleCancel}
          onApprove={handleApprove}
        />
      </div>

      <JobStatusMeta
        status={job.status}
        badgeClass={badgeClass}
        createdAt={job.createdAt}
        formatStatus
      />

      <JobInfoGrid items={infoItems} />

      <div className="detail-card">
        <h2 className="detail-card-title">Description</h2>
        <p className="detail-card-text">{job.description}</p>
        {showProgress && currentIndex >= 0 && (
          <div style={{ marginTop: 28 }}>
            <JobProgress steps={PROGRESS_STEPS} currentIndex={currentIndex} />
          </div>
        )}
      </div>

      {media.length > 0 && (
        <div className="detail-card">
          <h2 className="detail-card-title">Media</h2>
          <MediaGallery
            items={media}
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

      {/* View All Bids - Now at the bottom */}
      {isOpen && job.bidCount > 0 && (
        <Link
          href={`/customer/dashboard/jobs/${job.id}/bids`}
          className="btn-view-bids"
        >
          View All Bids ({job.bidCount})
        </Link>
      )}

      {/* Approval box at the bottom */}
      {isAwaitingApproval && (
        <div className="approval-box">
          <p>
            The provider has marked this job as completed. Please verify the
            work before approving.
          </p>
          <button className="btn-approve" onClick={handleApprove}>
            Approve Completion
          </button>
        </div>
      )}

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
        .detail-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .btn-edit {
          padding: 9px 20px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          background: var(--white);
          color: var(--text);
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: border-color 0.15s;
        }
        .btn-edit:hover {
          border-color: var(--navy);
        }
        .btn-cancel-job {
          padding: 9px 20px;
          border: none;
          border-radius: 8px;
          background: #d33;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-cancel-job:hover:not(:disabled) {
          background: #b82424;
        }
        .btn-cancel-job:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
        .btn-view-bids {
          display: block;
          width: 100%;
          padding: 15px;
          background: var(--navy);
          color: #fff;
          text-align: center;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s;
          margin-bottom: 20px;
        }
        .btn-view-bids:hover {
          background: #253460;
        }
        .approval-box {
          margin-top: 20px;
          padding: 20px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }
        .approval-box p {
          font-size: 0.88rem;
          color: var(--sub);
          line-height: 1.6;
          margin: 0;
        }
        .btn-approve {
          padding: 12px 22px;
          border: none;
          border-radius: 10px;
          background: #16a34a;
          color: #fff;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .btn-approve:hover {
          background: #15803d;
        }

        /* Modal styles */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 100;
        }
        .modal-wrap {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 101;
          padding: 24px;
        }
        .modal-card {
          background: var(--cream);
          border-radius: 18px;
          padding: 32px;
          width: 100%;
          max-width: 460px;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--sub);
          padding: 4px;
          border-radius: 6px;
          transition: color 0.15s;
        }
        .modal-close:hover {
          color: var(--text);
        }
        .modal-title {
          font-family: "Playfair Display", serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 4px;
        }
        .modal-sub {
          font-size: 0.85rem;
          color: var(--sub);
          margin-bottom: 20px;
        }
        .modal-provider {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--white);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 22px;
        }
        .modal-avatar {
          width: 40px;
          height: 40px;
          background: var(--navy);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .modal-provider-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--navy);
          margin: 0;
        }
        .modal-provider-trade {
          font-size: 0.78rem;
          color: var(--sub);
          margin: 0;
        }
        .modal-field {
          margin-bottom: 18px;
        }
        .modal-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--navy);
          margin-bottom: 10px;
        }
        .optional-text {
          font-weight: 400;
          color: var(--sub);
        }
        .modal-textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 0.875rem;
          font-family: inherit;
          background: var(--white);
          color: var(--text);
          outline: none;
          resize: vertical;
          min-height: 100px;
          line-height: 1.6;
          transition: border-color 0.15s;
        }
        .modal-textarea:focus {
          border-color: var(--navy);
        }
        .modal-textarea::placeholder {
          color: #b0a898;
        }
        .btn-submit-review {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          background: var(--navy);
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-submit-review:hover:not(:disabled) {
          background: #253460;
        }
        .btn-submit-review:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 700px) {
          .detail-card {
            padding: 22px;
          }
          .detail-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .approval-box {
            flex-direction: column;
            align-items: flex-start;
          }
          .modal-card {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
