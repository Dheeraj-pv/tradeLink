import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { CustomerProfile, ProfileFormData } from "../types";

interface UseCustomerProfileReturn {
  profile: CustomerProfile;
  loading: boolean;
  saving: boolean;
  updateProfile: (data: Partial<CustomerProfile>) => void;
  saveProfile: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useCustomerProfile(): UseCustomerProfileReturn {
  const [profile, setProfile] = useState<CustomerProfile>({
    name: "",
    email: "",
    phone: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchProfile = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch("/api/customer/settings");
      const response = await res.json();

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(response));
        return;
      }

      setProfile({
        name: response.data.profile.name ?? "",
        email: response.data.profile.email ?? "",
        phone: response.data.profile.phone ?? null,
      });
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback((data: Partial<CustomerProfile>): void => {
    setProfile((prev) => ({ ...prev, ...data }));
  }, []);

  const saveProfile = useCallback(async (): Promise<void> => {
    const { name, phone } = profile;

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/customer/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "profile",
          name: name.trim(),
          phone: phone || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    saving,
    updateProfile,
    saveProfile,
    refetch: fetchProfile,
  };
}
