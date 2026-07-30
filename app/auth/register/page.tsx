"use client";

import { useRegister } from "./hooks/useRegister";
import { RegistrationForm } from "./components/RegistrationForm";

const MAX_CATEGORIES = 2;

export default function RegisterPage() {
  const {
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
    handleSubmit,
    handleCategoryToggle,
  } = useRegister();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <style>{`
        .category-dropdown {
          position: relative;
        }
        .category-trigger {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--border);
          border-radius: 9px;
          background: var(--white);
          color: #1f2937;
          font-size: .875rem;
          font-family: inherit;
          text-align: left;
          cursor: pointer;
          transition: border-color .15s;
        }
        .category-trigger:hover {
          border-color: var(--navy);
        }
        .category-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 10px;
          max-height: 220px;
          overflow-y: auto;
          padding: 10px;
          box-shadow: 0 8px 20px rgba(0,0,0,.08);
          z-index: 100;
        }
        .category-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
        }
        .category-item:hover {
          background: #f9f7f4;
        }
        .category-item input {
          width: 16px;
          height: 16px;
        }
        .category-item span {
          font-size: .875rem;
        }
        .category-helper {
          margin-top: 8px;
          font-size: .8rem;
          color: var(--sub);
        }
        .category-error {
          margin-top: 4px;
          font-size: .8rem;
          color: #dc2626;
        }
        .auth-success {
          color: #16a34a;
          padding: 8px 0;
        }
      `}</style>

      <RegistrationForm
        formData={formData}
        onFormChange={handleFormChange}
        role={role}
        onRoleChange={setRole}
        categories={categories}
        selectedCategories={selectedCategories}
        showCategories={showCategories}
        onToggleCategories={() => setShowCategories(!showCategories)}
        onCategoryToggle={handleCategoryToggle}
        categoryError={categoryError}
        maxCategories={MAX_CATEGORIES}
        loading={loading}
        success={success}
        password={password}
        passwordChecks={passwordChecks}
        onSubmit={handleSubmit}
      />
    </>
  );
}
