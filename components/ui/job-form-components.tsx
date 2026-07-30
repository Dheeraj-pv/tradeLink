"use client";

type Category = { id: number; name: string };

export function JobFormFields({
  title,
  description,
  category,
  categories,
  address,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onAddressChange,
}: {
  title: string;
  description: string;
  category: string;
  categories: Category[];
  address: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAddressChange: (value: string) => void;
}) {
  return (
    <>
      <div className="form-field">
        <label>
          Job Title <span>*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Fix leaking bathroom sink"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label>
          Description <span>*</span>
        </label>
        <textarea
          placeholder="Describe the issue in detail. Include relevant measurements, existing conditions, or special requirements…"
          rows={4}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label>
          Category <span>*</span>
        </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label>
          Service Address <span>*</span>
        </label>
        <input
          type="text"
          placeholder="142 Maple Street, Brooklyn, NY 11201"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
        />
      </div>

      <style jsx>{`
        .form-field {
          margin-bottom: 22px;
        }
        .form-field label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }
        .form-field label span {
          color: var(--orange);
        }
        .form-field input,
        .form-field textarea,
        .form-field select {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--border);
          border-radius: 9px;
          font-size: 0.875rem;
          font-family: inherit;
          background: var(--white);
          color: var(--text);
          outline: none;
          transition: border-color 0.15s;
        }
        .form-field input:focus,
        .form-field textarea:focus,
        .form-field select:focus {
          border-color: var(--navy);
        }
        .form-field input::placeholder,
        .form-field textarea::placeholder {
          color: #b0a898;
        }
        .form-field textarea {
          resize: vertical;
          min-height: 100px;
          line-height: 1.6;
        }
        .form-field select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231a2540' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
