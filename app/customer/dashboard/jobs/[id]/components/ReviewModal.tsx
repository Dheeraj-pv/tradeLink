import { useState } from "react";
import { toast } from "sonner";
import { XIcon } from "@/components/ui/icons";
import {
  FileList,
  FilePreviewModal,
  FileUploadDropzone,
} from "@/components/ui/media-components";
import { RatingInputStars } from "@/components/ui/review-components";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import { getProviderInitial } from "../utils/jobHelpers";
import type { Job } from "../types";

interface Props {
  job: Job;
  onClose: () => void;
  onSubmitted: () => void;
}

export function ReviewModal({ job, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const addFiles = (incoming: File[]): void => {
    setFiles((prev) => {
      const existing = new Set(prev.map((file) => `${file.name}-${file.size}`));
      return [
        ...prev,
        ...incoming.filter(
          (file) => !existing.has(`${file.name}-${file.size}`),
        ),
      ];
    });
  };

  const removeFile = (index: number): void => {
    setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleSubmit = async (): Promise<void> => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);

    try {
      // Approve the job first
      const approveRes = await fetch(`/api/customer/jobs/${job.id}/approve`, {
        method: "PATCH",
      });

      if (!approveRes.ok) {
        const data = await approveRes.json();
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      // Submit review
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

      // Upload media if any
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("media", file));

        const mediaRes = await fetch(
          `/api/customer/jobs/${job.id}/review/media`,
          {
            method: "POST",
            body: formData,
          },
        );

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
  };

  const providerName = job.providerName ?? "Provider";
  const providerInitial = getProviderInitial(job.providerName);

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-wrap" role="dialog" aria-modal="true">
        <div className="modal-card">
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <XIcon width={18} height={18} />
          </button>

          <h2 className="modal-title">Leave a Review</h2>
          <p className="modal-sub">How did {providerName} do?</p>

          <div className="modal-provider">
            <div className="modal-avatar">{providerInitial}</div>
            <div>
              <p className="modal-provider-name">{providerName}</p>
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
              Photos <span className="optional-text">optional</span>
            </label>

            <FileUploadDropzone
              inputId="review-photo"
              onFilesAdded={addFiles}
              onInvalidFile={(message) => toast.error(message)}
              prompt="Drag photos or click to upload"
              hint="JPEG, PNG, WebP, GIF, MP4, WebM · Max 10 MB"
              compact
            />

            {files.length > 0 && (
              <FileList
                files={files}
                onPreview={setPreviewIndex}
                onRemove={removeFile}
                compact
              />
            )}
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

      {previewIndex !== null && files[previewIndex] && (
        <FilePreviewModal
          file={files[previewIndex]}
          onClose={() => setPreviewIndex(null)}
          zIndex={200}
        />
      )}
    </>
  );
}
