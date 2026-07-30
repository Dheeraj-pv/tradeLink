"use client";

import { useState } from "react";
import { JobFormFields } from "@/components/ui/job-form-components";
import { BackLink } from "@/components/ui/page-components";
import { usePostJob } from "./hooks/usePostJob";
import { FileUploadSection } from "./components/FileUploadSection";
import { FormActions } from "./components/FormActions";

export default function PostJobPage() {
  const {
    title,
    setTitle,
    description,
    setDescription,
    address,
    setAddress,
    category,
    setCategory,
    categories,
    files,
    isSubmitting,
    isValid,
    addFiles,
    removeFile,
    handleSubmit,
    loading,
  } = usePostJob();

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Loading state
  if (loading) {
    return (
      <div className="dash-page">
        <BackLink href="/customer/dashboard" label="Back to Dashboard" />
        <p className="dash-page-sub">Loading categories…</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <BackLink href="/customer/dashboard" label="Back to Dashboard" />

      <h1 className="dash-page-title">Post a New Job</h1>
      <p className="dash-page-sub">
        Describe your job clearly to attract the best bids.
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

        <FileUploadSection
          files={files}
          onAddFiles={addFiles}
          onRemoveFile={removeFile}
          onPreview={setPreviewIndex}
          previewIndex={previewIndex}
        />

        <FormActions
          isValid={isValid}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>

      <style>{`
        .job-form-card {
          background: var(--white);
          border-radius: 14px;
          padding: 32px;
          max-width: 600px;
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
