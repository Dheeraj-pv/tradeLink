import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { Review, ReviewSummary } from "../types";

interface UseReviewsReturn {
  reviews: Review[];
  summary: ReviewSummary | null;
  loading: boolean;
  refetch: () => Promise<void>;
  maxBreakdown: number;
}

export function useReviews(): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReviews = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch("/api/provider/reviews");
      const response = await res.json();

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(response));
        return;
      }

      setReviews(
        Array.isArray(response.data.reviews) ? response.data.reviews : [],
      );
      setSummary(response.data.summary ?? null);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Calculate max breakdown value for bar chart
  const maxBreakdown = summary?.breakdown
    ? Math.max(...Object.values(summary.breakdown), 1)
    : 1;

  return {
    reviews,
    summary,
    loading,
    refetch: fetchReviews,
    maxBreakdown,
  };
}
