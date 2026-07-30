import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { Bid, SortOption } from "../types";
import { sortBids } from "../utils/sortHelpers";

interface UseBidsReturn {
  bids: Bid[];
  sortedBids: Bid[];
  loading: boolean;
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
  acceptBid: (bidId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useBids(jobId: string): UseBidsReturn {
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<SortOption>("Lowest Price");

  const fetchBids = useCallback(async (): Promise<void> => {
    if (!jobId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/customer/jobs/${jobId}/bids`);
      const response = await res.json();

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(response));
        return;
      }

      setBids(Array.isArray(response.data.bids) ? response.data.bids : []);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const acceptBid = useCallback(
    async (bidId: string): Promise<void> => {
      if (!jobId || !bidId) {
        toast.error("Missing required information");
        return;
      }

      try {
        const res = await fetch(
          `/api/customer/jobs/${jobId}/bids/${bidId}/accept`,
          { method: "POST" },
        );

        const data = await res.json();

        if (!res.ok) {
          toast.error(getUserFriendlyErrorMessage(data));
          return;
        }

        toast.success("Bid accepted successfully!");
        router.push("/customer/dashboard");
      } catch {
        toast.error("Network error — please try again.");
      }
    },
    [jobId, router],
  );

  const sortedBids = useMemo(() => {
    return sortBids(bids, sortBy);
  }, [bids, sortBy]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  return {
    bids,
    sortedBids,
    loading,
    sortBy,
    setSortBy,
    acceptBid,
    refetch: fetchBids,
  };
}
