import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { Category, ExistingMedia, JobFormData } from "../types";

interface UseEditJobReturn {
  loading: boolean;
  error: string | null;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  categories: Category[];
  existingMedia: ExistingMedia[];
  newFiles: File[];
  isSubmitting: boolean;
  deletingMedia: boolean;
  deleteMediaId: string | null;
  setDeleteMediaId: (id: string | null) => void;
  isValid: boolean;
  addFiles: (files: File[]) => void;
  removeNewFile: (index: number) => void;
  confirmDeleteMedia: () => Promise<void>;
  handleSubmit: () => Promise<void>;
}

export function useEditJob(jobId: string): UseEditJobReturn {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deletingMedia, setDeletingMedia] = useState<boolean>(false);
  const [deleteMediaId, setDeleteMediaId] = useState<string | null>(null);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const isValid =
    title.trim() !== "" &&
    description.trim() !== "" &&
    address.trim() !== "" &&
    category !== "";

  const fetchJobData = useCallback(async (): Promise<void> => {
    if (!jobId) {
      setError("Job ID is missing");
      setLoading(false);
      return;
    }

    try {
      const [catRes, jobRes] = await Promise.all([
        fetch("/api/categories"),
        fetch(`/api/customer/jobs/${jobId}/edit`),
      ]);

      if (catRes.ok) {
        const cats = await catRes.json();
        setCategories(Array.isArray(cats.data) ? cats.data : []);
      }

      if (!jobRes.ok) {
        const errorData = await jobRes.json().catch(() => ({}));
        const errorMsg = errorData.error ?? "Failed to load job";
        setError(errorMsg);
        toast.error(getUserFriendlyErrorMessage(errorData));
        return;
      }

      const response = await jobRes.json();
      const job = response.data.job;

      setTitle(job.title ?? "");
      setDescription(job.description ?? "");
      setAddress(job.address ?? "");
      setCategory(job.categoryId != null ? String(job.categoryId) : "");
      setExistingMedia(Array.isArray(job.media) ? job.media : []);
    } catch {
      const errorMsg = "Network error — please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const confirmDeleteMedia = useCallback(async (): Promise<void> => {
    if (!deleteMediaId || !jobId) return;

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

      setExistingMedia((prev) =>
        prev.filter((item) => item.id !== deleteMediaId),
      );
      setDeleteMediaId(null);
      toast.success("Media deleted successfully");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setDeletingMedia(false);
    }
  }, [deleteMediaId, jobId]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!isValid || isSubmitting || !jobId) return;

    setIsSubmitting(true);

    try {
      // Update job details
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

      // Upload new media if any
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
  }, [
    jobId,
    title,
    description,
    address,
    category,
    newFiles,
    isValid,
    isSubmitting,
    router,
  ]);

  const addFiles = useCallback((incoming: File[]): void => {
    setNewFiles((prev) => {
      const existing = new Set(prev.map((file) => `${file.name}-${file.size}`));
      const fresh = incoming.filter(
        (file) => !existing.has(`${file.name}-${file.size}`),
      );
      return [...prev, ...fresh];
    });
  }, []);

  const removeNewFile = useCallback((index: number): void => {
    setNewFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  }, []);

  useEffect(() => {
    fetchJobData();
  }, [fetchJobData]);

  return {
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
  };
}
