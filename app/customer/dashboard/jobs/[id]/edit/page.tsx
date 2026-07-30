"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { JobFormFields } from "@/components/ui/job-form-components";
import {
  ExistingMediaGrid,
  FileList,
  FilePreviewModal,
  FileUploadDropzone,
  MediaPreviewModal,
  type ServerMediaItem,
} from "@/components/ui/media-components";
import { BackLink } from "@/components/ui/page-components";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

type Category = { id: number; name: string };
type ExistingMedia = ServerMediaItem & { type: "image" | "video" };
type PreviewRef =
  | { kind: "existing"; index: number }
  | { kind: "new"; index: number };

export default function EditJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = params.id;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [address, setAddress] = useState("");

  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewRef, setPreviewRef] = useState<PreviewRef | null>(null);
  const [deleteMediaId, setDeleteMediaId] = useState<string | null>(null);
  const [deletingMedia, setDeletingMedia] = useState(false);

  const isValid =
    title.trim() !== "" &&
    description.trim() !== "" &&
    address.trim() !== "" &&
    category !== "";

  useEffect(() => {
    async function load() {
      try {
        const [catRes, jobRes] = await Promise.all([
          fetch("/api/categories"),
          fetch(`/api/customer/jobs/${jobId}/edit`),
        ]);

        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(cats.data);
        }

        if (!jobRes.ok) {
          const error = await jobRes.json().catch(() => ({}));
          setLoadError(error.error ?? "Failed to load job");
          return;
        }

        const response = await jobRes.json();
        const job = response.data.job;
        setTitle(job.title ?? "");
        setDescription(job.description ?? "");
        setAddress(job.address ?? "");
        setCategory(job.categoryId != null ? String(job.categoryId) : "");
        setExistingMedia(job.media ?? []);
      } catch (error) {
        console.error(error);
        setLoadError("Network error — please try again.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [jobId]);

  function addFiles(incoming: File[]) {
    setNewFiles((prev) => {
      const existing = new Set(prev.map((file) => `${file.name}-${file.size}`));
      const fresh = incoming.filter(
        (file) => !existing.has(`${file.name}-${file.size}`),
      );
      return [...prev, ...fresh];
    });
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  }

  async function confirmDeleteMedia() {
    if (!deleteMediaId) return;

    try {
      setDeletingMedia(true);

      const res = await fetch(`/api/customer/jobs/${jobId}/media`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: deleteMediaId }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      setExistingMedia((prev) => prev.filter((item) => item.id !== deleteMediaId));
      setDeleteMediaId(null);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setDeletingMedia(false);
    }
  }

  async function handleSubmit() {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const jobRes = await fetch(`/api/customer/jobs/${jobId}/edit`, {
        method: "PATCH",
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

      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => formData.append("media", file));

        const mediaRes = await fetch(`/api/customer/jobs/${jobId}/media`, {
          method: "POST",
          body: formData,
        });

        if (!mediaRes.ok) {
          const mediaData = await mediaRes.json().catch(() => ({}));
          toast.warning(
            `Job updated but media upload failed: ${mediaData.error ?? "Unknown error"}`,
          );
        } else {
          toast.success("Job updated successfully!");
        }
      } else {
        toast.success("Job updated successfully!");
      }

      router.push("/customer/dashboard");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="dash-page">
        <p className="dash-page-sub">Loading job…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="dash-page">
        <BackLink href="/customer/dashboard" label="Back to Dashboard" />
        <p className="dash-page-sub">{loadError}</p>
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

        {existingMedia.length > 0 ? (
          <div className="form-field">
            <label>Current Photos</label>
            <ExistingMediaGrid
              items={existingMedia}
              onPreview={(index) => setPreviewRef({ kind: "existing", index })}
              onRemove={(id) => setDeleteMediaId(id)}
              removingId={deletingMedia ? deleteMediaId : null}
            />
          </div>
        ) : null}

        <div className="form-field">
          <label>Add More Photos</label>
          <FileUploadDropzone
            inputId="edit-job-media"
            onFilesAdded={addFiles}
            onInvalidFile={(message) => toast.error(message)}
            prompt="Drag photos or click to upload"
            hint="JPEG, PNG, WebP, GIF · Max 10 MB each"
          />
        </div>

        {newFiles.length > 0 ? (
          <FileList
            files={newFiles}
            onPreview={(index) => setPreviewRef({ kind: "new", index })}
            onRemove={removeNewFile}
          />
        ) : null}

        {previewRef?.kind === "existing" ? (
          <MediaPreviewModal
            src={existingMedia[previewRef.index].url}
            type={existingMedia[previewRef.index].type}
            onClose={() => setPreviewRef(null)}
          />
        ) : null}

        {previewRef?.kind === "new" ? (
          <FilePreviewModal
            file={newFiles[previewRef.index]}
            onClose={() => setPreviewRef(null)}
          />
        ) : null}

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

      {deleteMediaId ? (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Delete Media</h3>
            <p>Are you sure you want to permanently remove this media?</p>
            <div className="modal-actions">
              <button
                className="btn-cancel modal-btn"
                onClick={() => setDeleteMediaId(null)}
                disabled={deletingMedia}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={confirmDeleteMedia}
                disabled={deletingMedia}
              >
                {deletingMedia ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
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
        }
        .btn-delete:hover {
          background: #b91c1c;
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
