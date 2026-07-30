import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { Job, Summary } from "../types";

export function useAssignedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/provider/assigned-jobs");
      const data = await res.json();

      if (!res.ok) {
        const message = getUserFriendlyErrorMessage(data);
        toast.error(message);
        setError(message);
        return;
      }

      setJobs(Array.isArray(data.data.jobs) ? data.data.jobs : []);
      setSummary(data.data.summary ?? null);
    } catch {
      const message = "Network error — please try again.";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  return { jobs, summary, loading, error, fetchJobs };
}