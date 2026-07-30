import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { Provider, Review } from "../types";

interface UseProviderProfileReturn {
  provider: Provider | null;
  reviews: Review[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProviderProfile(
  providerId: string,
): UseProviderProfileReturn {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (): Promise<void> => {
    if (!providerId) {
      setError("Provider ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/customer/providers/${providerId}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.error ?? "Failed to load provider";
        setError(errorMsg);
        toast.error(getUserFriendlyErrorMessage(errorData));
        return;
      }

      const response = await res.json();
      setProvider(response.data.provider ?? null);
      setReviews(
        Array.isArray(response.data.reviews) ? response.data.reviews : [],
      );
    } catch {
      const errorMsg = "Network error — please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    provider,
    reviews,
    loading,
    error,
    refetch: fetchProfile,
  };
}
