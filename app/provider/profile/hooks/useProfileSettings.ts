import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { Profile, Certification, Category } from "../types";

export function useProfileSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/provider/settings");
      const response = await res.json();
      if (!res.ok) return;

      setProfile(response.data.profile);
      setCertifications(response.data.certifications);
      setCategories(response.data.categories);
      setName(response.data.profile.name);
      setPhone(response.data.profile.phone ?? "");
      setProfilePhoto(response.data.profile.profileImage ?? null);
      setCategoryIds(response.data.profile.categoryIds ?? []);
    } catch {
      // silently fail on load
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = async () => {
    try {
      const res = await fetch("/api/provider/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "profile", name, phone, categoryIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(data));
        return false;
      }
      toast.success("Profile saved successfully");
      setProfile((prev) => (prev ? { ...prev, name, phone, categoryIds } : prev));
      return true;
    } catch {
      toast.error("Network error");
      return false;
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  return {
    profile,
    certifications,
    categories,
    loading,
    name,
    setName,
    phone,
    setPhone,
    categoryIds,
    setCategoryIds,
    profilePhoto,
    setProfilePhoto,
    saveProfile,
    fetchSettings,
    setCertifications,
  };
}