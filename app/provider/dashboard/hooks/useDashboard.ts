import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { DashboardData } from "../types";

const LIMIT = 5;

export function useDashboard() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/provider/jobs?page=${page}&limit=${LIMIT}`);
      const json = await res.json();

      if (!res.ok) {
        const errorMsg = getUserFriendlyErrorMessage(json);
        toast.error(errorMsg);
        setError(errorMsg);
        return;
      }

      if (!json.data) {
        const errorMsg = "Invalid response format from server";
        toast.error(errorMsg);
        setError(errorMsg);
        return;
      }

      setData(json.data);
    } catch {
      const errorMsg = "Network error — please try again.";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    fetchDashboard,
    pagination: data?.pagination,
    stats: data?.stats,
    provider: data?.provider,
    recentJobs: data?.recentJobs || [],
  };
}
