import type { Category } from "../types";

interface Props {
  categories: Category[];
  selectedCategories: number[];
  maxCategories: number;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onCategoryToggle: (
    categoryId: number,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
}

export function CategorySelector({
  categories,
  selectedCategories,
  maxCategories,
  showDropdown,
  onToggleDropdown,
  onCategoryToggle,
  error,
}: Props) {
  return (
    <div className="auth-field">
      <label>Categories</label>

      <div className="category-dropdown">
        <p className="category-helper">
          {selectedCategories.length}/{maxCategories} selected
        </p>

        <button
          type="button"
          className="category-trigger"
          onClick={onToggleDropdown}
        >
          {selectedCategories.length > 0
            ? categories
                .filter((category) => selectedCategories.includes(category.id))
                .map((category) => category.name)
                .join(", ")
            : "Select categories"}
        </button>

        {error && <p className="category-error">{error}</p>}

        {showDropdown && (
          <div className="category-menu">
            {categories.map((category) => (
              <label key={category.id} className="category-item">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  disabled={
                    selectedCategories.length >= maxCategories &&
                    !selectedCategories.includes(category.id)
                  }
                  onChange={onCategoryToggle(category.id)}
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
