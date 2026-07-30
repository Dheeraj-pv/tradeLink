"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import { AuthField, AuthTabs, PasswordRules, RoleSelector } from "@/components/auth/auth-form-elements";

type Role = "CUSTOMER" | "PROVIDER";

type Category = {
  id: number;
  name: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const MAX_CATEGORIES = 2;
  const [categoryError, setCategoryError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [showCategories, setShowCategories] = useState(false);

  const [role, setRole] = useState<Role>("CUSTOMER");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [password, setPassword] = useState("");

  const passwordChecks = [
    {
      valid: /[A-Z]/.test(password),
      message: "One uppercase letter",
    },
    {
      valid: /[a-z]/.test(password),
      message: "One lowercase letter",
    },
    {
      valid: /\d/.test(password),
      message: "One number",
    },
    {
      valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      message: "One special character",
    },
    {
      valid: password.length >= 8,
      message: "At least 8 characters",
    },
  ];

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");

        if (!res.ok) return;

        const response = await res.json();

        setCategories(response.data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "password") {
      setPassword(e.target.value);
    }
    setForm((prev) => ({
      ...prev,

      [e.target.name]: e.target.value,
    }));
  };

  async function handleSubmit() {
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
          name: `${form.firstName} ${form.lastName}`.trim(),

          email: form.email,

          password: form.password,

          role,

          phone: form.phone || null,

          categoryIds: selectedCategories,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(getUserFriendlyErrorMessage(data));
      }

      setSuccess("Account created successfully");

      const destination =
        role === "PROVIDER" ? "/provider/dashboard" : "/customer/dashboard";

      router.push(destination);

      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`

        .category-dropdown{
          position:relative;
        }

        .category-trigger{
          width:100%;
          padding:12px 14px;
          border:1.5px solid var(--border);
          border-radius:9px;
          background:var(--white);
          color:#1f2937;
          font-size:.875rem;
          font-family:inherit;
          text-align:left;
          cursor:pointer;
          transition:border-color .15s;
        }

        .category-trigger:hover{
          border-color:var(--navy);
        }

        .category-menu{
          position:absolute;
          top:calc(100% + 4px);
          left:0;
          right:0;
          background:var(--white);
          border:1.5px solid var(--border);
          border-radius:10px;
          max-height:220px;
          overflow-y:auto;
          padding:10px;
          box-shadow:0 8px 20px rgba(0,0,0,.08);
          z-index:100;
        }

        .category-item{
          display:flex;
          align-items:center;
          gap:10px;
          padding:8px;
          border-radius:8px;
          cursor:pointer;
        }

        .category-item:hover{
          background:#f9f7f4;
        }

        .category-item input{
          width:16px;
          height:16px;
          color:#dc2626;
        }

        .category-item span{
          font-size:.875rem;
        }

        .category-helper{
        margin-top:8px;
        font-size:.8rem;
        color:var(--sub);
      }

      .category-error{
        margin-top:4px;
        font-size:.8rem;
        color:#dc2626;
      }

      .password-rules{
        margin-top:8px;
      }

      .password-rules p{
        font-size:0.8rem;
        margin:4px 0;
      }

      .valid{
        color:#16a34a;
      }

      .invalid{
        color:#dc2626;
      }

      `}</style>
      <h2>Create account</h2>
      <p className="auth-subtitle">
        Join thousands of customers and providers on TradeLink.
      </p>
      <AuthTabs active="register" />
      <RoleSelector role={role} onChange={(value) => setRole(value)} />
      <div className="auth-field-row">
        <AuthField
          id="firstName"
          label="First name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          type="text"
          placeholder="Jane"
          required
        />

        <AuthField
          id="lastName"
          label="Last name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          type="text"
          placeholder="Smith"
          required
        />
      </div>
      <AuthField
        id="email"
        label="Email address"
        name="email"
        value={form.email}
        onChange={handleChange}
        type="email"
        placeholder="you@email.com"
        required
      />
      <AuthField
        id="password"
        label="Password"
        name="password"
        value={form.password}
        onChange={handleChange}
        type="password"
        placeholder="••••••••"
        required
      >
        <PasswordRules password={password} rules={passwordChecks} />
      </AuthField>
      <AuthField
        id="phone"
        label="Phone Number"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        type="text"
        placeholder="+91 9876543210"
      />
      setCategoryError("");
      {role === "PROVIDER" && (
        <div className="auth-field">
          <label>Categories</label>

          <div className="category-dropdown">
            <p className="category-helper">
              {selectedCategories.length}/{MAX_CATEGORIES}
              selected
            </p>

            <button
              type="button"
              className="category-trigger"
              onClick={() => setShowCategories(!showCategories)}
            >
              {selectedCategories.length > 0
                ? categories

                    .filter((category) =>
                      selectedCategories.includes(category.id),
                    )

                    .map((category) => category.name)

                    .join(", ")
                : "Select categories"}
            </button>

            {categoryError && <p className="category-error">{categoryError}</p>}

            {showCategories && (
              <div className="category-menu">
                {categories.map((category) => (
                  <label key={category.id} className="category-item">
                    <input
                      type="checkbox"

                      checked={selectedCategories.includes(category.id)}
                      disabled={
                        selectedCategories.length >= MAX_CATEGORIES &&
                        !selectedCategories.includes(category.id)
                      }

                      onChange={(e) => {
                        if (e.target.checked) {
                          if (selectedCategories.length >= MAX_CATEGORIES) {
                            setCategoryError(
                              `Maximum ${MAX_CATEGORIES} categories allowed`,
                            );

                            return;
                          }

                          setCategoryError("");

                          setSelectedCategories((prev) => [
                            ...prev,

                            category.id,
                          ]);
                        } else {
                          setCategoryError("");

                          setSelectedCategories((prev) =>
                            prev.filter((id) => id !== category.id),
                          );
                        }
                      }}
                    />

                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {success && <p className="auth-success">{success}</p>}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-auth-primary"
      >
        {loading ? "Creating Account..." : "Create account"}
      </button>
      <p className="auth-terms">
        By creating an account you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </p>
      <p className="auth-switch">
        Already have an account? <Link href="/auth/login">Log in</Link>
      </p>
    </>
  );
}
