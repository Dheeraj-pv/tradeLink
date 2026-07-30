"use client";

import Link from "next/link";
import { PageHeader, StatsGrid } from "@/components/ui/page-components";
import { PlusIcon } from "./components/icons";
import { useCustomerDashboard } from "./hooks/useCustomerDashboard";
import { getStatCards } from "./utils/statCards";
import { JobList } from "./components/JobList";
import { Pagination } from "./components/Pagination";

export default function DashboardPage() {
  const {
    jobs,
    stats,
    pagination,
    loading,
    selectedStatus,
    setSelectedStatus,
    page,
    setPage,
  } = useCustomerDashboard();

  const statCards = getStatCards(stats);

  return (
    <div className="dash-page">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your service requests"
      />

      <StatsGrid
        items={statCards}
        selectedFilter={selectedStatus}
        onSelect={(filter) => {
          setSelectedStatus(filter as typeof selectedStatus);
          setPage(1);
        }}
      />

      <div className="dash-section-header">
        <h2 className="dash-section-title">My Jobs</h2>
        <Link href="/customer/post-job" className="btn-post-job">
          <PlusIcon />
          Post New Job
        </Link>
      </div>

      <JobList jobs={jobs} loading={loading} />

      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />

      <style>{`
        .dash-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 24px 0 16px 0;
        }
        .dash-section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--navy);
        }
        .btn-post-job {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          background: var(--navy);
          color: #fff;
          border-radius: 9px;
          font-weight: 600;
          font-size: 0.85rem;
          text-decoration: none;
          transition: background 0.15s;
        }
        .btn-post-job:hover {
          background: #253460;
        }

        .job-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .job-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
          cursor: pointer;
        }
        .job-card:hover {
          border-color: var(--navy);
          background: var(--bg-subtle);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .job-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-subtle);
          border-radius: 8px;
          color: var(--navy);
        }
        .job-icon svg {
          width: 20px;
          height: 20px;
        }
        .job-info {
          flex: 1;
          min-width: 0;
        }
        .job-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }
        .job-title {
          font-weight: 600;
          font-size: 1rem;
        }
        .job-badge {
          font-size: 0.7rem;
          padding: 2px 10px;
          border-radius: 20px;
          font-weight: 500;
          text-transform: uppercase;
        }
        .badge-open {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .badge-assigned {
          background: #fff3e0;
          color: #e65100;
        }
        .badge-progress {
          background: #e3f2fd;
          color: #0d47a1;
        }
        .badge-completed {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .badge-cancelled {
          background: #fdecec;
          color: #c92e2e;
        }
        .job-meta {
          display: flex;
          gap: 16px;
          font-size: 0.85rem;
          color: var(--sub);
          flex-wrap: wrap;
        }
        .job-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .job-meta-item svg {
          width: 14px;
          height: 14px;
        }
        .job-chevron {
          flex-shrink: 0;
          color: var(--sub);
        }

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

        .dash-page-sub {
          color: var(--sub);
          font-size: 0.9rem;
        }

        @media (max-width: 600px) {
          .job-meta {
            flex-direction: column;
            gap: 4px;
          }
          .job-title-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .dash-section-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
          .btn-post-job {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
