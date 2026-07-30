"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  MediaGallery,
  MediaPreviewModal,
  type ServerMediaItem,
} from "@/components/ui/media-components";
import { BackLink } from "@/components/ui/page-components";
import { RatingStars } from "@/components/ui/review-components";

type Review = {
  id?: string;
  name: string;
  rating: number;
  comment: string;
  media: ServerMediaItem[];
};

type Certification = {
  id: string;
  title: string;
  url: string;
};

type Provider = {
  id: string;
  name: string;
  profileImage: string | null;
  specialty: string | null;
  bio: string | null;
  phone: string | null;
  certifications: Certification[];
  rating: number;
  reviewCount: number;
};

export default function ProviderProfilePage() {
  const params = useParams<{ id: string; providerId: string }>();
  const { id, providerId } = params;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<ServerMediaItem | null>(null);

  useEffect(() => {
    if (!providerId) return;

    async function load() {
      try {
        const res = await fetch(`/api/customer/providers/${providerId}`);
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          setLoadError(error.error ?? "Failed to load provider");
          return;
        }

        const response = await res.json();
        setProvider(response.data.provider ?? null);
        setReviews(Array.isArray(response.data.reviews) ? response.data.reviews : []);
      } catch {
        setLoadError("Network error — please try again.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [providerId]);

  const backLink = `/customer/dashboard/jobs/${id}/bids`;

  if (loading) {
    return (
      <div className="dash-page">
        <BackLink href={backLink} label="Back to Bids" />
        <p className="dash-page-sub">Loading profile…</p>
      </div>
    );
  }

  if (loadError || !provider) {
    return (
      <div className="dash-page">
        <BackLink href={backLink} label="Back to Bids" />
        <p className="dash-page-sub">{loadError ?? "Provider not found"}</p>
      </div>
    );
  }

  const initial = provider.name?.charAt(0).toUpperCase() ?? "?";
  const certifications = provider.certifications.map((certification) => ({
    id: certification.id,
    url: certification.url,
    mediaType: "IMAGE" as const,
  }));

  return (
    <div className="dash-page">
      <BackLink href={backLink} label="Back to Bids" />

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {provider.profileImage ? (
              <img src={provider.profileImage} alt={provider.name} />
            ) : (
              initial
            )}
          </div>

          <div>
            <h1>{provider.name}</h1>
            {provider.specialty ? <p>{provider.specialty}</p> : null}

            <div className="rating">
              <RatingStars rating={provider.rating} gap={2} />
              <span>
                {provider.rating.toFixed(1)} · {provider.reviewCount} review
                {provider.reviewCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-body">
          {provider.bio ? (
            <section>
              <h2>About</h2>
              <p>{provider.bio}</p>
            </section>
          ) : null}

          {provider.phone ? (
            <section>
              <h2>Contact</h2>
              <p>📞 {provider.phone}</p>
            </section>
          ) : null}

          {provider.certifications.length > 0 ? (
            <section>
              <h2>Certifications</h2>
              <div className="cert-grid">
                {provider.certifications.map((certification, index) => (
                  <div
                    key={certification.id}
                    className="cert-card"
                    onClick={() => setPreviewMedia(certifications[index])}
                  >
                    <img src={certification.url} alt={certification.title} />
                    <p>{certification.title}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2>Recent Reviews</h2>
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <div className="reviews">
                {reviews.map((review, index) => (
                  <div key={review.id ?? index} className="review-card">
                    <div className="review-header">
                      <strong>{review.name}</strong>
                      <RatingStars rating={review.rating} gap={2} />
                    </div>
                    <p>{review.comment}</p>
                    {review.media.length > 0 ? (
                      <MediaGallery
                        items={review.media}
                        onSelect={(mediaIndex) =>
                          setPreviewMedia(review.media[mediaIndex])
                        }
                        size={100}
                        rounded={8}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {previewMedia ? (
        <MediaPreviewModal
          src={previewMedia.url}
          type={previewMedia.mediaType === "VIDEO" ? "video" : "image"}
          onClose={() => setPreviewMedia(null)}
          lightCloseButton
        />
      ) : null}

      <style jsx>{`
        .profile-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          max-width: 620px;
        }
        .profile-header {
          background: var(--navy);
          padding: 32px;
          display: flex;
          gap: 28px;
          align-items: center;
        }
        .avatar {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          background: #e26f1c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
          overflow: hidden;
        }
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-header h1 {
          color: white;
          font-size: 2rem;
          margin-bottom: 4px;
        }
        .profile-header p {
          color: #d6dff0;
          margin-bottom: 14px;
        }
        .rating {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1rem;
        }
        .rating span {
          color: white;
        }
        .profile-body {
          padding: 28px;
        }
        .profile-body section {
          margin-bottom: 34px;
        }
        .profile-body h2 {
          font-size: 1.75rem;
          margin-bottom: 14px;
          color: var(--navy);
        }
        .profile-body p {
          line-height: 1.8;
          color: var(--sub);
        }
        .reviews {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .review-card {
          padding: 18px;
          background: #faf8f4;
          border-radius: 10px;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          align-items: center;
        }
        .review-card p {
          font-size: 0.9rem;
          line-height: 1.7;
          margin-bottom: 12px;
        }
        .cert-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
        .cert-card {
          background: #faf8f4;
          border-radius: 12px;
          padding: 12px;
          cursor: pointer;
          transition: 0.15s;
        }
        .cert-card:hover {
          transform: translateY(-3px);
        }
        .cert-card img {
          width: 100%;
          height: 140px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        .cert-card p {
          font-size: 0.9rem;
          font-weight: 600;
          text-align: center;
          color: var(--text);
          margin: 0;
        }
        @media (max-width: 700px) {
          .profile-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .profile-card {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
