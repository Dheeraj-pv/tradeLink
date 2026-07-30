import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { Category, JobFormData } from "../types";

interface UsePostJobReturn {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  categories: Category[];
  files: File[];
  isSubmitting: boolean;
  isValid: boolean;
  addFiles: (incoming: File[]) => void;
  removeFile: (index: number) => void;
  handleSubmit: () => Promise<void>;
  loading: boolean;
}

export function usePostJob(): UsePostJobReturn {
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const isValid =
    title.trim() !== "" &&
    description.trim() !== "" &&
    address.trim() !== "" &&
    category !== "";

  const fetchCategories = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      const response = await res.json();
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);

      // Set default category if available
      if (categoriesData.length > 0) {
        setCategory(String(categoriesData[0].id));
      }
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const addFiles = useCallback((incoming: File[]): void => {
    setFiles((prev) => {
      const existing = new Set(prev.map((file) => `${file.name}-${file.size}`));
      const fresh = incoming.filter(
        (file) => !existing.has(`${file.name}-${file.size}`),
      );
      return [...prev, ...fresh];
    });
  }, []);

  const removeFile = useCallback((index: number): void => {
    setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  }, []);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Create the job
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

      // Upload media if any
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("media", file));

        const mediaRes = await fetch(`/api/customer/jobs/${jobId}/media`, {
          method: "POST",
          body: formData,
        });

        if (!mediaRes.ok) {
          const mediaData = await mediaRes.json().catch(() => ({}));
          toast.warning(
            `Job created but media upload failed: ${mediaData.error ?? "Unknown error"}`,
          );
        } else {
          const mediaData = await mediaRes.json();
          const mediaCount = Array.isArray(mediaData.media)
            ? mediaData.media.length
            : 0;
          toast.success(
            `Job posted with ${mediaCount} photo${mediaCount !== 1 ? "s" : ""}`,
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
  }, [
    title,
    description,
    address,
    category,
    files,
    isValid,
    isSubmitting,
    router,
  ]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
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
  };
}
