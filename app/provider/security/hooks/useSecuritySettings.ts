import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { PasswordFormState } from "../types";

interface UseSecuritySettingsReturn {
  formState: PasswordFormState;
  setFormState: React.Dispatch<React.SetStateAction<PasswordFormState>>;
  savingPassword: boolean;
  handleChangePassword: () => Promise<void>;
  handleDeleteAccount: () => Promise<void>;
  handleTwoFactorCodeChange: (value: string) => void;
}

export function useSecuritySettings(): UseSecuritySettingsReturn {
  const router = useRouter();
  const [formState, setFormState] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorCode: "",
  });
  const [savingPassword, setSavingPassword] = useState<boolean>(false);

  const handleTwoFactorCodeChange = (value: string): void => {
    // Only allow digits, max 6 characters
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setFormState((prev) => ({ ...prev, twoFactorCode: cleaned }));
  };

  const handleChangePassword = async (): Promise<void> => {
    const { currentPassword, newPassword, confirmPassword, twoFactorCode } =
      formState;

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

    setSavingPassword(true);
    try {
      const res = await fetch("/api/provider/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      toast.success("Password updated successfully");
      // Reset form
      setFormState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFactorCode: "",
      });
    } catch {
      toast.error("Network error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async (): Promise<void> => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    try {
      const res = await fetch("/api/provider/settings", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Account deleted successfully");
        router.push("/auth/login");
      } else {
        const data = await res.json();
        toast.error(
          getUserFriendlyErrorMessage(data) || "Failed to delete account",
        );
      }
    } catch {
      toast.error("Network error");
    }
  };

  return {
    formState,
    setFormState,
    savingPassword,
    handleChangePassword,
    handleDeleteAccount,
    handleTwoFactorCodeChange,
  };
}
