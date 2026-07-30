"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { JobFormFields } from "@/components/ui/job-form-components";
import {
  FileList,
  FilePreviewModal,
  FileUploadDropzone,
} from "@/components/ui/media-components";
import { BackLink } from "@/components/ui/page-components";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

type Category = { id: number; name: string };

export default function PostJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [address, setAddress] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const isValid =
    title.trim() !== "" &&
    description.trim() !== "" &&
    address.trim() !== "" &&
    category !== "";

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) return;
        const response = await res.json();

        setCategories(response.data);

        if (response.data.length > 0) {
          setCategory(String(response.data[0].id));
        }
      } catch (error) {
        console.error(error);
      }
    }

    void fetchCategories();
  }, []);

  function addFiles(incoming: File[]) {
    setFiles((prev) => {
      const existing = new Set(prev.map((file) => `${file.name}-${file.size}`));
      const fresh = incoming.filter(
        (file) => !existing.has(`${file.name}-${file.size}`),
      );
      return [...prev, ...fresh];
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  }

  async function handleSubmit() {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const jobRes = await fetch("/api/customer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          address,
          categoryId: Number(category),
        }),
      });

      const jobData = await jobRes.json();

      if (!jobRes.ok) {
        const messages = jobData.details
          ? Object.values(jobData.details).flat().join("\n")
          : getUserFriendlyErrorMessage(jobData);
        toast.error(messages);
        return;
      }

      const jobId: string = jobData.job?.id ?? jobData.id;

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("media", file));

        const mediaRes = await fetch(`/api/customer/jobs/${jobId}/media`, {
          method: "POST",
          body: formData,
        });

        if (!mediaRes.ok) {
          const mediaData = await mediaRes.json();
          toast.warning(
            `Job created but media upload failed: ${mediaData.error ?? "Unknown error"}`,
          );
        } else {
          const mediaData = await mediaRes.json();
          toast.success(
            `Job posted with ${mediaData.media.length} photo${mediaData.media.length !== 1 ? "s" : ""}`,
          );
        }
      } else {
        toast.success("Job posted successfully!");
      }

      router.push("/customer/dashboard");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

        <FileUploadDropzone
          inputId="post-job-media"
          onFilesAdded={addFiles}
          onInvalidFile={(message) => toast.error(message)}
          prompt="Drag photos or click to upload"
          hint="JPEG, PNG, WebP, GIF · Max 10 MB each"
        />

        {files.length > 0 ? (
          <FileList
            files={files}
            onPreview={setPreviewIndex}
            onRemove={removeFile}
          />
        ) : null}

        {previewIndex !== null ? (
          <FilePreviewModal
            file={files[previewIndex]}
            onClose={() => setPreviewIndex(null)}
          />
        ) : null}

        <div className="form-actions">
          <button
            className="btn-post"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Posting…" : "Post Job"}
          </button>
          <Link href="/customer/dashboard" className="btn-cancel">
            Cancel
          </Link>
        </div>
      </div>

      <style jsx>{`
        .job-form-card {
          background: var(--white);
          border-radius: 14px;
          padding: 32px;
          max-width: 600px;
        }
        .form-actions {
          display: flex;
          gap: 12px;
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
