"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { BriefcaseIcon, DollarIcon, PinIcon } from "@/components/ui/icons";
import { JobInfoGrid, JobStatusMeta } from "@/components/ui/job-components";
import {
  MediaGallery,
  MediaPreviewModal,
  type ServerMediaItem,
} from "@/components/ui/media-components";
import { BackLink } from "@/components/ui/page-components";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

type Job = {
  id: string;
  title: string;
  description: string;
  address: string;
  status: string;
  category: string;
  bidCount: number;
  createdAt: string;
};

const STATUS_BADGE: Record<string, string> = {
  OPEN: "badge-open",
  ASSIGNED: "badge-assigned",
  COMPLETED: "badge-completed",
  IN_PROGRESS: "badge-assigned",
  CANCELLED: "badge-cancelled",
};

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [media, setMedia] = useState<ServerMediaItem[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/provider/jobs/${jobId}`);
      const response = await res.json();
      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(response));
        return;
      }
      setJob(response.data.job);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch(`/api/provider/jobs/${jobId}/media`);
      if (!res.ok) return;
      const data = await res.json();
      setMedia(data.media);
    } catch (error) {
      console.error(error);
    }
  }, [jobId]);

  async function handleBid() {
    try {
      setSubmitting(true);

      const res = await fetch(`/api/provider/jobs/${jobId}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          toast.error(Object.values(data.details).flat().join("\n"));
        } else {
          toast.error(getUserFriendlyErrorMessage(data));
        }
        return;
      }

      toast.success("Bid submitted");
      setAmount("");
      setMessage("");
      router.push("/provider/bids");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    void fetchJob();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMedia();
  }, [fetchJob, fetchMedia]);

  if (loading) {
    return (
      <div className="dash-page">
        <div className="detail-loading">Loading job details…</div>
      </div>
    );
  }

  if (!job) return null;

  const badgeClass = STATUS_BADGE[job.status] ?? "badge-open";
  const isOpen = job.status === "OPEN";

  return (
    <div className="dash-page">
      <BackLink href="/provider/dashboard" label="Back" />

      <div className="detail-header">
        <h1 className="dash-page-title" style={{ marginBottom: 0 }}>
          {job.title}
        </h1>
      </div>

      <JobStatusMeta
        status={job.status}
        badgeClass={badgeClass}
        createdAt={job.createdAt}
      />

      <JobInfoGrid
        items={[
          {
            label: "Address",
            value: job.address,
            icon: <PinIcon width={14} height={14} />,
          },
          {
            label: "Category",
            value: job.category,
            icon: <BriefcaseIcon width={14} height={14} />,
          },
          {
            label: "Bids Received",
            value: `${job.bidCount} ${job.bidCount === 1 ? "bid" : "bids"}`,
            icon: <DollarIcon width={14} height={14} />,
          },
        ]}
      />

      <div className="detail-card">
        <h2 className="detail-card-title">Description</h2>
        <p className="detail-card-text">{job.description}</p>
      </div>

      {media.length > 0 ? (
        <div className="detail-card">
          <h2 className="detail-card-title">Media</h2>
          <MediaGallery items={media} onSelect={setPreviewIndex} />
        </div>
      ) : null}

      {previewIndex !== null ? (
        <MediaPreviewModal
          src={media[previewIndex].url}
          type={media[previewIndex].mediaType === "VIDEO" ? "video" : "image"}
          onClose={() => setPreviewIndex(null)}
          zIndex={9999}
        />
      ) : null}

      {isOpen ? (
        <div className="detail-card">
          <h2 className="detail-card-title">Place Your Bid</h2>

          <div className="auth-field">
            <label>
              Bid Amount ($)
              <span>*</span>
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>
              Message to Customer
              <span>*</span>
            </label>
            <textarea
              placeholder="Introduce yourself, explain your approach, and mention your availability..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            className="btn-submit-bid"
            disabled={submitting || !amount || !message.trim()}
            onClick={handleBid}
          >
            {submitting ? "Submitting..." : "Submit Bid"}
          </button>
        </div>
      ) : null}

      <style jsx>{`
        .detail-loading {
          padding: 40px;
          text-align: center;
          color: var(--sub);
        }
        .detail-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .detail-card {
          background: var(--white);
          border-radius: 14px;
          padding: 28px 32px;
          margin-bottom: 20px;
        }
        .detail-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 12px;
        }
        .detail-card-text {
          font-size: 0.875rem;
          color: var(--sub);
          line-height: 1.7;
        }
        .auth-field {
          margin-bottom: 18px;
        }
        .auth-field label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .auth-field span {
          color: #d4621a;
        }
        .auth-field input,
        .auth-field textarea {
          width: 100%;
          padding: 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: inherit;
          background: white;
        }
        .auth-field textarea {
          resize: none;
          min-height: 110px;
        }
        .btn-submit-bid {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          background: var(--navy);
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-submit-bid:hover {
          background: #253460;
        }
        .btn-submit-bid:disabled {
          background: #98a2b3;
          cursor: not-allowed;
        }
        @media (max-width: 700px) {
          .detail-card {
            padding: 22px;
          }
        }
      `}</style>
    </div>
  );
}
