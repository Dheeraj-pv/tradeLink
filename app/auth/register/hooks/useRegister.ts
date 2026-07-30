import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type {
  Role,
  Category,
  RegisterFormData,
  RegisterResponse,
} from "../types";

const MAX_CATEGORIES = 2;

interface UseRegisterReturn {
  formData: RegisterFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegisterFormData>>;
  role: Role;
  setRole: (role: Role) => void;
  categories: Category[];
  selectedCategories: number[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<number[]>>;
  showCategories: boolean;
  setShowCategories: React.Dispatch<React.SetStateAction<boolean>>;
  categoryError: string;
  loading: boolean;
  success: string;
  password: string;
  passwordChecks: Array<{ valid: boolean; message: string }>;
  firstFailedRule: { valid: boolean; message: string } | undefined;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleCategoryToggle: (
    categoryId: number,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useRegister(): UseRegisterReturn {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [role, setRole] = useState<Role>("CUSTOMER");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [showCategories, setShowCategories] = useState<boolean>(false);
  const [categoryError, setCategoryError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Password validation checks
  const passwordChecks = useMemo(
    () => [
      { valid: /[A-Z]/.test(password), message: "One uppercase letter" },
      { valid: /[a-z]/.test(password), message: "One lowercase letter" },
      { valid: /\d/.test(password), message: "One number" },
      {
        valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        message: "One special character",
      },
      { valid: password.length >= 8, message: "At least 8 characters" },
    ],
    [password],
  );

  const firstFailedRule = passwordChecks.find((rule) => !rule.valid);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) return;
        const response = await res.json();
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch {
        console.error("Failed to fetch categories");
      }
    }

    fetchCategories();
  }, []);

  const handleCategoryToggle = useCallback(
    (categoryId: number) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
          if (selectedCategories.length >= MAX_CATEGORIES) {
            setCategoryError(`Maximum ${MAX_CATEGORIES} categories allowed`);
            return;
          }
          setCategoryError("");
          setSelectedCategories((prev) => [...prev, categoryId]);
        } else {
          setCategoryError("");
          setSelectedCategories((prev) =>
            prev.filter((id) => id !== categoryId),
          );
        }
      };
    },
    [selectedCategories],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (loading) return;

      setLoading(true);

      if (role === "PROVIDER" && selectedCategories.length === 0) {
        setCategoryError("Please select at least one category");
        setLoading(false);
        return;
      }
      setCategoryError("");

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            password: formData.password,
            role,
            phone: formData.phone || null,
            categoryIds: selectedCategories,
          }),
        });

        let data: RegisterResponse | null = null;
        try {
          data = await res.json();
        } catch {
          // Handle non-JSON response
        }

        if (!res.ok) {
          toast.error(getUserFriendlyErrorMessage(data ?? undefined));
          return;
        }

        setSuccess("Account created successfully");
        toast.success("Account created successfully!");

        const destination =
          role === "PROVIDER" ? "/provider/dashboard" : "/customer/dashboard";
        router.push(destination);
        router.refresh();
      } catch {
        toast.error("Network error — please try again.");
      } finally {
        setLoading(false);
      }
    },
    [formData, role, selectedCategories, loading, router],
  );

  return {
    formData,
    setFormData,
    role,
    setRole,
    categories,
    selectedCategories,
    setSelectedCategories,
    showCategories,
    setShowCategories,
    categoryError,
    loading,
    success,
    password,
    passwordChecks,
    firstFailedRule,
    handleSubmit,
    handleCategoryToggle,
  };
}
