import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { Job } from "../types";
import type { ServerMediaItem } from "@/components/ui/media-components";

interface UseJobDetailReturn {
  job: Job | null;
  loading: boolean;
  media: ServerMediaItem[];
  cancelling: boolean;
  previewIndex: number | null;
  setPreviewIndex: (index: number | null) => void;
  handleCancel: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useJobDetail(jobId: string): UseJobDetailReturn {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [media, setMedia] = useState<ServerMediaItem[]>([]);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const fetchJob = useCallback(async (): Promise<void> => {
    if (!jobId) return;

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

  const fetchMedia = useCallback(async (): Promise<void> => {
    if (!jobId) return;

    try {
      const res = await fetch(`/api/customer/jobs/${jobId}/media`);
      if (!res.ok) return;
      const response = await res.json();
      setMedia(Array.isArray(response.data.media) ? response.data.media : []);
    } catch (error) {
      console.error("Failed to fetch media:", error);
    }
  }, [jobId]);

  const handleCancel = useCallback(async (): Promise<void> => {
    if (!jobId) return;
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
      toast.success("Job cancelled successfully");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setCancelling(false);
    }
  }, [jobId]);

  const refetch = useCallback(async (): Promise<void> => {
    await Promise.all([fetchJob(), fetchMedia()]);
  }, [fetchJob, fetchMedia]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    job,
    loading,
    media,
    cancelling,
    previewIndex,
    setPreviewIndex,
    handleCancel,
    refetch,
  };
}
