// app/customer/profile/page.tsx

"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { PageHeader, SettingsCard } from "@/components/ui/page-components";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/customer/settings");
      const response = await res.json();

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(response));
        return;
      }

      setFullName(response.data.profile.name);
      setEmail(response.data.profile.email);
      setPhone(response.data.profile.phone ?? "");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProfile();
  }, []);

  async function handleSave() {
    setSaving(true);

    try {
      const res = await fetch("/api/customer/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "profile",
          name: fullName,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="dash-page">
        <PageHeader title="Profile" subtitle="Loading..." />
      </div>
    );
  }

  return (
    <div className="dash-page">
      <PageHeader title="Profile" subtitle="Manage your personal information." />

      <SettingsCard title="Personal Information">
        <div className="form-field">
          <label>Full Name</label>

          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Email Address</label>

          <input type="email" value={email} disabled />
        </div>

        <div className="form-field">
          <label>Phone Number</label>

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </SettingsCard>
    </div>
  );
}
