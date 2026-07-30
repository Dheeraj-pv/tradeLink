import { useState, useCallback } from "react";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { SecurityFormData } from "../types";

interface UseCustomerSecurityReturn {
  formData: SecurityFormData;
  changingPassword: boolean;
  updateFormData: (data: Partial<SecurityFormData>) => void;
  handlePasswordChange: () => Promise<void>;
  handleDeleteAccount: () => Promise<void>;
  handleTwoFactorCodeChange: (value: string) => void;
}

export function useCustomerSecurity(): UseCustomerSecurityReturn {
  const [formData, setFormData] = useState<SecurityFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorCode: "",
  });
  const [changingPassword, setChangingPassword] = useState<boolean>(false);

  const updateFormData = useCallback(
    (data: Partial<SecurityFormData>): void => {
      setFormData((prev) => ({ ...prev, ...data }));
    },
    [],
  );

  const handleTwoFactorCodeChange = useCallback((value: string): void => {
    // Only allow digits, max 6 characters
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, twoFactorCode: cleaned }));
  }, []);

  const handlePasswordChange = useCallback(async (): Promise<void> => {
    const { currentPassword, newPassword, confirmPassword, twoFactorCode } =
      formData;

    // Validation
    if (!currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("New password is required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch("/api/customer/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "password",
          currentPassword,
          newPassword,
          confirmPassword,
          twoFactorCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          toast.error(Object.values(data.details).flat().join("\n"));
        } else {
          toast.error(getUserFriendlyErrorMessage(data));
        }
        return;
      }

      toast.success("Password changed successfully.");

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFactorCode: "",
      });
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setChangingPassword(false);
    }
  }, [formData]);

  const handleDeleteAccount = useCallback(async (): Promise<void> => {
    const confirmDelete = window.confirm(
      "Delete your account permanently? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/customer/settings", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      toast.success("Account deleted successfully");
      window.location.href = "/auth/login";
    } catch {
      toast.error("Network error — please try again.");
    }
  }, []);

  return {
    formData,
    changingPassword,
    updateFormData,
    handlePasswordChange,
    handleDeleteAccount,
    handleTwoFactorCodeChange,
  };
}
