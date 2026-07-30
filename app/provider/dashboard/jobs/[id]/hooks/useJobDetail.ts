import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { Job, BidData, MediaItem } from "../types";

interface UseJobDetailReturn {
  job: Job | null;
  loading: boolean;
  media: MediaItem[];
  previewIndex: number | null;
  setPreviewIndex: (index: number | null) => void;
  handleBid: (data: BidData) => Promise<void>;
  submitting: boolean;
  refetch: () => Promise<void>;
}

export function useJobDetail(jobId: string): UseJobDetailReturn {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/provider/jobs/${jobId}`);
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
    if (!jobId) return;

    try {
      const res = await fetch(`/api/provider/jobs/${jobId}/media`);
      if (!res.ok) return;
      const data = await res.json();
      setMedia(Array.isArray(data.media) ? data.media : []);
    } catch (error) {
      console.error("Failed to fetch media:", error);
    }
  }, [jobId]);

  const handleBid = useCallback(
    async (data: BidData): Promise<void> => {
      if (!jobId) {
        toast.error("Job ID is missing");
        return;
      }

      try {
        setSubmitting(true);

        const res = await fetch(`/api/provider/jobs/${jobId}/bid`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: data.amount,
            message: data.message,
          }),
        });

        const response = await res.json();

        if (!res.ok) {
          if (response.details) {
            const errorMessages = Object.values(response.details)
              .flat()
              .join("\n");
            toast.error(errorMessages);
          } else {
            toast.error(getUserFriendlyErrorMessage(response));
          }
          return;
        }

        toast.success("Bid submitted successfully!");
        router.push("/provider/bids");
      } catch {
        toast.error("Network error — please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [jobId, router],
  );

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
    previewIndex,
    setPreviewIndex,
    handleBid,
    submitting,
    refetch,
  };
}
