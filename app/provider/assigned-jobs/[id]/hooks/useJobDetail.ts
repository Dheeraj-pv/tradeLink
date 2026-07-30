import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { Job, JobStatus } from "../types";

export function useJobDetail(jobId: string) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/provider/assigned-jobs/${jobId}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      setJob(data.data.job);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const updateJobStatus = useCallback(
    async (action: "start" | "complete") => {
      setActioning(true);
      try {
        const res = await fetch(`/api/provider/assigned-jobs/${jobId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, action }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(getUserFriendlyErrorMessage(data));
          return;
        }

        setJob((prev) =>
          prev ? { ...prev, status: data.data.job.status as JobStatus } : prev,
        );
        toast.success("Job updated successfully");
      } catch {
        toast.error("Network error — please try again.");
      } finally {
        setActioning(false);
      }
    },
    [jobId],
  );

  useEffect(() => {
    const loadJob = async () => {
      await fetchJob();
    };

    void loadJob();
  }, [fetchJob]);

  return { job, loading, actioning, fetchJob, updateJobStatus };
}
