import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type {
  DashboardStats,
  DashboardStatsFilter,
  DashboardJob,
  Pagination,
} from "../types";

const LIMIT = 5;

interface UseCustomerDashboardReturn {
  jobs: DashboardJob[];
  stats: DashboardStats;
  pagination: Pagination;
  loading: boolean;
  selectedStatus: DashboardStatsFilter;
  setSelectedStatus: (status: DashboardStatsFilter) => void;
  page: number;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

export function useCustomerDashboard(): UseCustomerDashboardReturn {
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    openJobs: 0,
    assignedJobs: 0,
    completedJobs: 0,
    inProgressJobs: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: LIMIT,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] =
    useState<DashboardStatsFilter>("ALL");
  const [page, setPage] = useState<number>(1);

  const fetchDashboard = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/customer/jobs?page=${page}&limit=${LIMIT}&status=${selectedStatus}`,
      );

      if (!res.ok) {
        const data = await res.json();
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      const response = await res.json();

      setJobs(Array.isArray(response.data.jobs) ? response.data.jobs : []);
      setStats(
        response.data.stats ?? {
          totalJobs: 0,
          openJobs: 0,
          assignedJobs: 0,
          completedJobs: 0,
          inProgressJobs: 0,
        },
      );
      setPagination(
        response.data.pagination ?? {
          page: 1,
          limit: LIMIT,
          totalItems: 0,
          totalPages: 1,
        },
      );
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    jobs,
    stats,
    pagination,
    loading,
    selectedStatus,
    setSelectedStatus,
    page,
    setPage,
    refetch: fetchDashboard,
  };
}
