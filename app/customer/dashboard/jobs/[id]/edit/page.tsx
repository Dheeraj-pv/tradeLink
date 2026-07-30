"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { JobFormFields } from "@/components/ui/job-form-components";
import {
  MediaPreviewModal,
  FilePreviewModal,
} from "@/components/ui/media-components";
import { BackLink } from "@/components/ui/page-components";
import { useEditJob } from "./hooks/useEditJob";
import { DeleteMediaModal } from "./components/DeleteMediaModal";
import { MediaSection } from "./components/MediaSection";
import type { PreviewRef } from "./types";

export default function EditJobPage() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id;

  const {
    loading,
    error,
    title,
    setTitle,
    description,
    setDescription,
    address,
    setAddress,
    category,
    setCategory,
    categories,
    existingMedia,
    newFiles,
    isSubmitting,
    deletingMedia,
    deleteMediaId,
    setDeleteMediaId,
    isValid,
    addFiles,
    removeNewFile,
    confirmDeleteMedia,
    handleSubmit,
  } = useEditJob(jobId);

  const [previewRef, setPreviewRef] = useState<PreviewRef | null>(null);

  // Loading state
  if (loading) {
    return (
      <div className="dash-page">
        <p className="dash-page-sub">Loading job…</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dash-page">
        <BackLink href="/customer/dashboard" label="Back to Dashboard" />
        <p
          className="dash-page-sub"
          style={{ color: "var(--error-color, #c92e2e)" }}
        >
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <BackLink href="/customer/dashboard" label="Back to Dashboard" />

      <h1 className="dash-page-title">Edit Job</h1>
      <p className="dash-page-sub">
        Update the details below and save your changes.
      </p>

      <div className="job-form-card">
        <JobFormFields
          title={title}
          description={description}
          category={category}
          categories={categories}
          address={address}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onCategoryChange={setCategory}
          onAddressChange={setAddress}
        />

        <MediaSection
          existingMedia={existingMedia}
          newFiles={newFiles}
          deletingMedia={deletingMedia}
          deleteMediaId={deleteMediaId}
          onPreview={setPreviewRef}
          onRemoveExisting={setDeleteMediaId}
          onRemoveNew={removeNewFile}
          onAddFiles={addFiles}
        />

        {previewRef?.kind === "existing" && existingMedia[previewRef.index] && (
          <MediaPreviewModal
            src={existingMedia[previewRef.index].url}
            type={existingMedia[previewRef.index].type}
            onClose={() => setPreviewRef(null)}
          />
        )}

        {previewRef?.kind === "new" && newFiles[previewRef.index] && (
          <FilePreviewModal
            file={newFiles[previewRef.index]}
            onClose={() => setPreviewRef(null)}
          />
        )}

        <div className="form-actions">
          <button
            className="btn-post"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Saving…" : "Save Changes"}
          </button>
          <Link href="/customer/dashboard" className="btn-cancel">
            Cancel
          </Link>
        </div>
      </div>

      <DeleteMediaModal
        isOpen={!!deleteMediaId}
        deleting={deletingMedia}
        onConfirm={confirmDeleteMedia}
        onCancel={() => setDeleteMediaId(null)}
      />

      <style>{`
        .job-form-card {
          background: var(--white);
          border-radius: 14px;
          padding: 32px;
          max-width: 600px;
        }
        .form-field {
          margin-bottom: 22px;
        }
        .form-field label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }
        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .btn-post {
          flex: 1;
          padding: 13px;
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
        .btn-post:hover:not(:disabled) {
          background: #253460;
        }
        .btn-post:disabled {
          background: #a8b0bf;
          cursor: not-allowed;
        }
        .btn-cancel {
          padding: 13px 24px;
          border-radius: 9px;
          background: #ece6dd;
          color: var(--text);
          font-size: 0.9rem;
          font-weight: 600;
          font-family: inherit;
          text-decoration: none;
          text-align: center;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-cancel:hover {
          background: #e2dacd;
        }
        .dash-page-sub {
          color: var(--sub);
          font-size: 0.9rem;
          padding: 20px 0;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          width: 380px;
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
        }
        .modal h3 {
          margin: 0 0 12px;
          font-size: 1.15rem;
        }
        .modal p {
          margin: 0;
          color: var(--sub);
          line-height: 1.6;
        }
        .modal-actions {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .modal-btn {
          padding: 10px 18px;
        }
        .btn-delete {
          padding: 10px 18px;
          border: none;
          background: #dc2626;
          color: white;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.15s;
        }
        .btn-delete:hover:not(:disabled) {
          background: #b91c1c;
        }
        .btn-delete:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 600px) {
          .job-form-card {
            padding: 22px;
          }
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
