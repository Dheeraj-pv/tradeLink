import type { Category } from "../types";

interface Props {
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  categories: Category[];
  categoryIds: number[];
  setCategoryIds: (ids: number[] | ((prev: number[]) => number[])) => void;
  onSave: () => void;
  saving: boolean;
}

export function ProfileForm({
  name,
  setName,
  phone,
  setPhone,
  categories,
  categoryIds,
  setCategoryIds,
  onSave,
  saving,
}: Props) {
  return (
    <div className="ps-card">
      <h2 className="ps-card-title">Personal Information</h2>
      <div className="ps-field-row">
        <div className="ps-field">
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="ps-field">
          <label>Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
      <div className="ps-field">
        <label>Trade Category</label>
        <div className="category-list">
          {categories.map((category) => (
            <label key={category.id} className="category-item">
              <input
                type="checkbox"
                checked={categoryIds.includes(category.id)}
                onChange={() => {
                  setCategoryIds((prev: number[]) =>
                    prev.includes(category.id)
                      ? prev.filter((id) => id !== category.id)
                      : [...prev, category.id],
                  );
                }}
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>
      <button className="btn-save" disabled={saving} onClick={onSave}>
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
