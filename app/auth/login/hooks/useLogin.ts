import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type {
  LoginCredentials,
  LoginResponse,
  TwoFactorResponse,
} from "../types";

type Stage = "credentials" | "2fa";

interface UseLoginReturn {
  stage: Stage;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  useBackupCode: boolean;
  setUseBackupCode: (value: boolean) => void;
  isSubmitting: boolean;
  pendingToken: string | null;
  handleCredentialsSubmit: (
    e: React.FormEvent<HTMLFormElement>,
  ) => Promise<void>;
  handleTwoFactorSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  backToCredentials: () => void;
}

export function useLogin(): UseLoginReturn {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("credentials");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [useBackupCode, setUseBackupCode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const redirectAfterLogin = useCallback(
    (role: string | undefined) => {
      const destination =
        role === "provider" ? "/provider/dashboard" : "/customer/dashboard";
      router.push(destination);
      router.refresh();
    },
    [router],
  );

  const handleCredentialsSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        let data: LoginResponse | null = null;
        try {
          data = await res.json();
        } catch {
          // response wasn't JSON
        }

        if (!res.ok) {
          toast.error(getUserFriendlyErrorMessage(data ?? undefined));
          return;
        }

        if (data?.data?.requiresTwoFactor && data?.data?.pendingToken) {
          setPendingToken(data.data.pendingToken);
          setStage("2fa");
          return;
        }

        redirectAfterLogin(data?.data?.user?.role);
      } catch {
        toast.error(
          "Network error — please check your connection and try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, isSubmitting, redirectAfterLogin],
  );

  const handleTwoFactorSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (isSubmitting || !pendingToken) return;
      setIsSubmitting(true);

      try {
        const res = await fetch("/api/auth/2fa/verify-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pendingToken,
            code,
            isBackupCode: useBackupCode,
          }),
        });

        let data: TwoFactorResponse | null = null;
        try {
          data = await res.json();
        } catch {
          // ignore
        }

        if (!res.ok) {
          toast.error(getUserFriendlyErrorMessage(data ?? undefined));
          return;
        }

        redirectAfterLogin(data?.data?.user?.role);
      } catch {
        toast.error(
          "Network error — please check your connection and try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [pendingToken, code, useBackupCode, isSubmitting, redirectAfterLogin],
  );

  const backToCredentials = useCallback(() => {
    setStage("credentials");
    setPendingToken(null);
    setCode("");
    setUseBackupCode(false);
  }, []);

  return {
    stage,
    email,
    setEmail,
    password,
    setPassword,
    code,
    setCode,
    useBackupCode,
    setUseBackupCode,
    isSubmitting,
    pendingToken,
    handleCredentialsSubmit,
    handleTwoFactorSubmit,
    backToCredentials,
  };
}
