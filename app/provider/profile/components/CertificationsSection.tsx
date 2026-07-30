import { useState } from "react";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import { AwardIcon, PlusIcon } from "./icons";
import type { Certification } from "../types";

interface Props {
  certifications: Certification[];
  setCertifications: (certs: Certification[] | ((prev: Certification[]) => Certification[])) => void;
  onRefresh: () => void;
}

export function CertificationsSection({ certifications, setCertifications, onRefresh }: Props) {
  const [addingCert, setAddingCert] = useState(false);
  const [showCertInput, setShowCertInput] = useState(false);
  const [newCertTitle, setNewCertTitle] = useState("");
  const [newCertImage, setNewCertImage] = useState<File | null>(null);
  const [previewCert, setPreviewCert] = useState<string | null>(null);

  const handleAddCert = async () => {
    if (!newCertTitle.trim()) {
      toast.error("Please add a title");
      return;
    }
    if (!newCertImage) {
      toast.error("Please select an image");
      return;
    }

    setAddingCert(true);
    try {
      const formData = new FormData();
      formData.append("title", newCertTitle.trim());
      formData.append("image", newCertImage);

      const res = await fetch("/api/provider/settings/certifications", {
        method: "POST",
        body: formData,
      });
      const response = await res.json();
      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(response));
        return;
      }
      setCertifications((prev) => [...prev, response.data.certification]);
      setNewCertTitle("");
      setNewCertImage(null);
      setShowCertInput(false);
    } catch {
      toast.error("Network error");
    } finally {
      setAddingCert(false);
    }
  };

  const handleRemoveCert = async (id: string) => {
    // Optimistic update
    setCertifications((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch("/api/provider/settings/certifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        onRefresh();
        toast.error("Failed to remove");
      }
    } catch {
      onRefresh();
    }
  };

  return (
    <div className="ps-card">
      <h2 className="ps-card-title">Certifications</h2>
      <div className="cert-list">
        {certifications.map((cert) => (
          <div key={cert.id} className="cert-row">
            <div className="cert-label">
              <img
                src={cert.url}
                alt={cert.title}
                className="cert-thumb"
                onClick={() => setPreviewCert(cert.url)}
              />
              <div className="cert-info">
                <span className="cert-title">
                  <AwardIcon />
                  {cert.title}
                </span>
              </div>
            </div>
            <button className="btn-remove" onClick={() => handleRemoveCert(cert.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {showCertInput ? (
        <div className="cert-input-row">
          <input
            type="text"
            className="cert-input"
            placeholder="e.g. Licensed Master Plumber"
            value={newCertTitle}
            onChange={(e) => setNewCertTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCert()}
            autoFocus
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewCertImage(e.target.files?.[0] ?? null)}
          />
          <button className="btn-cert-confirm" onClick={handleAddCert} disabled={addingCert}>
            {addingCert ? "Adding…" : "Add"}
          </button>
          <button
            className="btn-cert-cancel"
            onClick={() => {
              setShowCertInput(false);
              setNewCertTitle("");
              setNewCertImage(null);
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button className="btn-add-cert" onClick={() => setShowCertInput(true)}>
          <PlusIcon />
          Add Certification
        </button>
      )}

      {previewCert && (
        <div className="photo-modal" onClick={() => setPreviewCert(null)}>
          <div className="photo-content" onClick={(e) => e.stopPropagation()}>
            <img src={previewCert} alt="Certificate" className="cert-full-image" />
            <button className="btn-close-preview" onClick={() => setPreviewCert(null)}>
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
}