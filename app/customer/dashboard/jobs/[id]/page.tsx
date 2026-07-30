"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  BriefcaseIcon,
  DollarIcon,
  PinIcon,
  XIcon,
} from "@/components/ui/icons";
import {
  JobInfoGrid,
  JobProgress,
  JobStatusMeta,
} from "@/components/ui/job-components";
import {
  FileList,
  FilePreviewModal,
  FileUploadDropzone,
  MediaGallery,
  MediaPreviewModal,
  type ServerMediaItem,
} from "@/components/ui/media-components";
import { BackLink } from "@/components/ui/page-components";
import { RatingInputStars } from "@/components/ui/review-components";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

type Job = {
  id: string;
  title: string;
  description: string;
  address: string;
  status: string;
  category: string;
  bidCount: number;
  createdAt: string;
  providerName?: string;
  providerCategory?: string;
  providerId?: string;
};

const STATUS_BADGE: Record<string, string> = {
  OPEN: "badge-open",
  ASSIGNED: "badge-assigned",
  COMPLETED: "badge-completed",
  IN_PROGRESS: "badge-assigned",
  AWAITING_APPROVAL: "badge-assigned",
  CANCELLED: "badge-cancelled",
};

const PROGRESS_STEPS = [
  { label: "Assigned", sub: "Provider confirmed" },
  { label: "In Progress", sub: "Work underway" },
  { label: "Completed", sub: "Job finished" },
];

function currentStageIndex(status: string) {
  if (status === "ASSIGNED") return 0;
  if (status === "IN_PROGRESS" || status === "AWAITING_APPROVAL") return 1;
  if (status === "COMPLETED") return 2;
  return -1;
}

function shouldShowProgress(status: string) {
  return ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "AWAITING_APPROVAL"].includes(
    status,
  );
}

function ReviewModal({
  job,
  onClose,
  onSubmitted,
}: {
  job: Job;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function addFiles(incoming: File[]) {
    setFiles((prev) => {
      const existing = new Set(prev.map((file) => `${file.name}-${file.size}`));
      return [
        ...prev,
        ...incoming.filter((file) => !existing.has(`${file.name}-${file.size}`)),
      ];
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  }

  async function handleSubmit() {
    setSubmitting(true);

    try {
      const approveRes = await fetch(`/api/customer/jobs/${job.id}/approve`, {
        method: "PATCH",
      });

      if (!approveRes.ok) {
        const data = await approveRes.json();
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      const reviewRes = await fetch(`/api/customer/jobs/${job.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (!reviewRes.ok) {
        const data = await reviewRes.json();
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("media", file));

        const mediaRes = await fetch(`/api/customer/jobs/${job.id}/review/media`, {
          method: "POST",
          body: formData,
        });

        if (!mediaRes.ok) {
          const data = await mediaRes.json();
          toast.warning(
            `Review submitted but photo upload failed: ${data.error ?? "Unknown error"}`,
          );
        }
      }

      onSubmitted();
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-wrap" role="dialog" aria-modal="true">
        <div className="modal-card">
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <XIcon width={18} height={18} />
          </button>

          <h2 className="modal-title">Leave a Review</h2>
          <p className="modal-sub">
            How did {job.providerName ?? "the provider"} do?
          </p>

          <div className="modal-provider">
            <div className="modal-avatar">
              {(job.providerName ?? "P").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="modal-provider-name">
                {job.providerName ?? "Provider"}
              </p>
              <p className="modal-provider-trade">
                {job.providerCategory ?? job.category}
              </p>
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label">Rating</label>
            <RatingInputStars rating={rating} onRate={setRating} />
          </div>

          <div className="modal-field">
            <label className="modal-label">Comments</label>
            <textarea
              className="modal-textarea"
              placeholder="Share your experience with this provider…"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">
              Photos{" "}
              <span className="optional-text">optional</span>
            </label>

            <FileUploadDropzone
              inputId="review-photo"
              onFilesAdded={addFiles}
              onInvalidFile={(message) => toast.error(message)}
              prompt="Drag photos or click to upload"
              hint="JPEG, PNG, WebP, GIF, MP4, WebM · Max 10 MB"
              compact
            />

            {files.length > 0 ? (
              <FileList
                files={files}
                onPreview={setPreviewIndex}
                onRemove={removeFile}
                compact
              />
            ) : null}
          </div>

          <button
            className="btn-submit-review"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      </div>

      {previewIndex !== null ? (
        <FilePreviewModal
          file={files[previewIndex]}
          onClose={() => setPreviewIndex(null)}
          zIndex={200}
        />
      ) : null}
    </>
  );
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [media, setMedia] = useState<ServerMediaItem[]>([]);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customer/jobs/${jobId}`);
      const response = await res.json();

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(response));
        return;
      }

      setJob(response.data.job);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch(`/api/customer/jobs/${jobId}/media`);
      if (!res.ok) return;
      const response = await res.json();
      setMedia(response.data.media);
    } catch (error) {
      console.error(error);
    }
  }, [jobId]);

  useEffect(() => {
    void fetchJob();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMedia();
  }, [fetchJob, fetchMedia]);

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this job?")) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/customer/jobs/${jobId}`, {
        method: "PATCH",
      });
      const response = await res.json();

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(response));
        return;
      }

      setJob(response.data.job);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setCancelling(false);
    }
  }

  function handleReviewSubmitted() {
    setShowReview(false);
    setJob((prev) => (prev ? { ...prev, status: "COMPLETED" } : prev));
    toast.success("Review submitted! Thank you.");
  }

  if (loading) {
    return (
      <div className="dash-page">
        <div className="detail-loading">Loading job details…</div>
      </div>
    );
  }

  if (!job) return null;

  const badgeClass = STATUS_BADGE[job.status] ?? "badge-open";
  const isOpen = job.status === "OPEN";

  return (
    <div className="dash-page">
      {showReview ? (
        <ReviewModal
          job={job}
          onClose={() => setShowReview(false)}
          onSubmitted={handleReviewSubmitted}
        />
      ) : null}

      <BackLink href="/customer/dashboard" label="Back" />

      <div className="detail-header">
        <h1 className="dash-page-title" style={{ marginBottom: 0 }}>
          {job.title}
        </h1>
        {isOpen ? (
          <div className="detail-actions">
            <Link
              href={`/customer/dashboard/jobs/${job.id}/edit`}
              className="btn-edit"
            >
              Edit
            </Link>
            <button
              className="btn-cancel-job"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling…" : "Cancel Job"}
            </button>
          </div>
        ) : null}
      </div>

      <JobStatusMeta
        status={job.status}
        badgeClass={badgeClass}
        createdAt={job.createdAt}
        formatStatus
      />

      <JobInfoGrid
        items={[
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
        ]}
      />

      <div className="detail-card">
        <h2 className="detail-card-title">Description</h2>
        <p className="detail-card-text">{job.description}</p>
        {shouldShowProgress(job.status) ? (
          <div style={{ marginTop: 28 }}>
            <JobProgress
              steps={PROGRESS_STEPS}
              currentIndex={currentStageIndex(job.status)}
            />
          </div>
        ) : null}
      </div>

      {media.length > 0 ? (
        <div className="detail-card">
          <h2 className="detail-card-title">Media</h2>
          <MediaGallery items={media} onSelect={setPreviewIndex} />
        </div>
      ) : null}

      {previewIndex !== null ? (
        <MediaPreviewModal
          src={media[previewIndex].url}
          type={media[previewIndex].mediaType === "VIDEO" ? "video" : "image"}
          onClose={() => setPreviewIndex(null)}
          zIndex={9999}
        />
      ) : null}

      {job.bidCount > 0 && job.status === "OPEN" ? (
        <Link
          href={`/customer/dashboard/jobs/${job.id}/bids`}
          className="btn-view-bids"
        >
          View All Bids ({job.bidCount})
        </Link>
      ) : null}

      {job.status === "AWAITING_APPROVAL" ? (
        <div className="approval-box">
          <p>
            The provider has marked this job as completed. Please verify the
            work before approving.
          </p>
          <button className="btn-approve" onClick={() => setShowReview(true)}>
            Approve Completion
          </button>
        </div>
      ) : null}

      <style jsx>{`
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
