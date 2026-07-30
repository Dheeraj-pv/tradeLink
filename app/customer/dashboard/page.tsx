"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, StatsGrid } from "@/components/ui/page-components";

function DropletIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function DollarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/* icons unchanged */
type DashboardStats = {
  totalJobs: number;
  openJobs: number;
  assignedJobs: number;
  completedJobs: number;
  inProgressJobs: number;
};

type DashboardStatsFilter =
  | "ALL"
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

type DashboardJob = {
  id: string;
  title: string;
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

  address: string;

  createdAt: string;

  bidCount: number;
};

function getBadgeClass(status: DashboardJob["status"]) {
  switch (status) {
    case "OPEN":
      return "badge-open";

    case "ASSIGNED":
      return "badge-assigned";

    case "IN_PROGRESS":
      return "badge-progress";

    case "COMPLETED":
      return "badge-completed";

    case "CANCELLED":
      return "badge-cancelled";

    default:
      return "badge-open";
  }
}

export default function DashboardPage() {
  const [selectedStatus, setSelectedStatus] = useState<DashboardStatsFilter>("ALL");
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [page, setPage] = useState(1);

  const LIMIT = 5;

  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT,
    totalItems: 0,
    totalPages: 1,
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    openJobs: 0,
    assignedJobs: 0,
    completedJobs: 0,
    inProgressJobs: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/customer/jobs?page=${page}&limit=${LIMIT}&status=${selectedStatus}`,
        );

        if (!res.ok) return;

        const response = await res.json();

        setJobs(Array.isArray(response.data.jobs) ? response.data.jobs : []);
        setStats(response.data.stats ?? {
          totalJobs: 0,
          openJobs: 0,
          assignedJobs: 0,
          completedJobs: 0,
          inProgressJobs: 0,
        });

        setPagination(
          response.data.pagination ?? {
            page: 1,
            limit: LIMIT,
            totalItems: 0,
            totalPages: 1,
          },
        );
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [page, selectedStatus]);
  const statCards = [
    {
      value: stats.totalJobs,
      label: "Total Jobs",
      filter: "ALL",
      className: "sc-navy",
    },
    {
      value: stats.openJobs,
      label: "Open Jobs",
      filter: "OPEN",
      className: "sc-blue",
    },
    {
      value: stats.assignedJobs,
      label: "Assigned",
      filter: "ASSIGNED",
      className: "sc-amber",
    },
    {
      value: stats.completedJobs,
      label: "Completed",
      filter: "COMPLETED",
      className: "sc-green",
    },
    {
      value: stats.inProgressJobs,
      label: "In Progress",
      filter: "IN_PROGRESS",
      className: "sc-purple",
    },
  ] as const;

  const filteredJobs = Array.isArray(jobs) ? jobs : [];

  return (
    <div className="dash-page">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your service requests"
      />

      <StatsGrid
        items={statCards.map((s) => ({
          ...s,
          value: s.value,
          label: s.label,
          className: s.className,
          filter: s.filter,
        }))}
        selectedFilter={selectedStatus}
        onSelect={(filter) => {
          setSelectedStatus(filter as DashboardStatsFilter);
          setPage(1);
        }}
      />

      <div className="dash-section-header">
        <h2 className="dash-section-title">My Jobs</h2>

        <Link
          href="/customer/post-job"

          className="btn-post-job"
        >
          <PlusIcon />
          Post New Job
        </Link>
      </div>

      <div className="job-list">
        {loading ? (
          <p>Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <p className="dash-page-sub">No jobs found.</p>
        ) : (
          filteredJobs.map((job) => (
            <Link
              key={job.id}

              href={`/customer/dashboard/jobs/${job.id}`}

              className="job-card"
            >
              <div className="job-icon">
                <DropletIcon />
              </div>

              <div className="job-info">
                <div className="job-title-row">
                  <span className="job-title">{job.title}</span>

                  <span className={`job-badge ${getBadgeClass(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                <div className="job-meta">
                  <span className="job-meta-item">
                    <PinIcon />

                    {job.address}
                  </span>

                  <span className="job-meta-item">
                    <ClockIcon />

                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>

                  <span className="job-meta-item">
                    <DollarIcon />
                    {job.bidCount} bids
                  </span>
                </div>
              </div>

              <span className="job-chevron">
                <ChevronRightIcon />
              </span>
            </Link>
          ))
        )}
      </div>
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            Previous
          </button>

          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
      <style>
        {`
          .pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  margin-top: 28px;
}

.pagination button {
  padding: 8px 18px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: white;
  font: inherit;
  cursor: pointer;
  transition: .15s;
}

.pagination button:hover:not(:disabled) {
  border-color: var(--navy);
}

.pagination button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.pagination span {
  font-size: .9rem;
  font-weight: 500;
}
          `}
      </style>
    </div>
  );
}
