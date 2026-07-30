import type { CustomerProfile } from "../types";

interface Props {
  profile: CustomerProfile;
  onUpdate: (data: Partial<CustomerProfile>) => void;
  onSave: () => void;
  saving: boolean;
}

export function ProfileForm({ profile, onUpdate, onSave, saving }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Full Name</label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          required
          placeholder="Enter your full name"
        />
      </div>

      <div className="form-field">
        <label>Email Address</label>
        <input
          type="email"
          value={profile.email}
          disabled
          className="input-disabled"
        />
        <p className="field-help">Email address cannot be changed</p>
      </div>

      <div className="form-field">
        <label>Phone Number</label>
        <input
          type="tel"
          value={profile.phone ?? ""}
          onChange={(e) => onUpdate({ phone: e.target.value })}
          placeholder="Enter your phone number"
        />
      </div>

      <button className="btn-save" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
