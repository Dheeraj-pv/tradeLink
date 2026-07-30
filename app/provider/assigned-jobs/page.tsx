"use client";

import { useAssignedJobs } from "./hooks/useAssignedJobs";
import { JobList } from "./components/JobList";
import { EarningsCard } from "./components/EarningsCard";
import { JobStagesCard } from "./components/JobStagesCard";
import { SupportCard } from "./components/SupportCard";

export default function AssignedJobsPage() {
  const { jobs, summary, loading, error } = useAssignedJobs();

  if (loading) {
    return (
      <div className="dash-page">
        <h1 className="dash-page-title">Assigned Jobs</h1>
        <p className="aj-state">Loading assigned jobs…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-page">
        <h1 className="dash-page-title">Assigned Jobs</h1>
        <p className="aj-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <h1 className="dash-page-title">Assigned Jobs</h1>
      {summary && (
        <p className="dash-page-sub">
          {summary.activeCount} active assignment
          {summary.activeCount !== 1 ? "s" : ""}
        </p>
      )}

      {jobs.length === 0 ? (
        <p className="aj-state">You have no active assigned jobs.</p>
      ) : (
        <div className="assigned-layout">
          <JobList jobs={jobs} />

          <div className="assigned-sidebar">
            <EarningsCard summary={summary} />
            <JobStagesCard />
            <SupportCard />
          </div>
        </div>
      )}

      <style>{`
        .aj-state {
          color: var(--sub);
          font-size: 0.9rem;
          padding: 40px 0;
          text-align: center;
        }
        .aj-error {
          padding: 12px 16px;
          background: #fdecec;
          border: 1px solid #f3c7c7;
          color: #c92e2e;
          border-radius: 9px;
          font-size: 0.875rem;
        }
        .assigned-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 24px;
          align-items: start;
        }
        .assigned-sidebar {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .sidebar-card {
          background: white;
          padding: 22px;
          border-radius: 14px;
        }
        .earnings-card {
          background: var(--navy);
          color: white;
        }
        .sidebar-title {
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--sub);
        }
        .stage-row {
          display: flex;
          gap: 12px;
          margin-bottom: 18px;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 4px;
        }
        .amber {
          background: #f59e0b;
        }
        .blue {
          background: #6366f1;
        }
        .green {
          background: #22c55e;
        }
        .btn-support {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: white;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-support:hover {
          background: #f5f5f5;
        }
        .earnings-card h2 {
          font-size: 2rem;
          margin-bottom: 8px;
        }
        .earnings-card p {
          opacity: 0.75;
          font-size: 0.85rem;
        }
        .earnings-card .sidebar-title {
          color: rgba(255, 255, 255, 0.75);
        }
        .stage-row strong {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 2px;
        }
        .stage-row p {
          font-size: 0.82rem;
          color: var(--sub);
          line-height: 1.5;
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
          background: white;
          padding: 20px;
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          transition: box-shadow 0.15s;
          cursor: pointer;
        }
        .job-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .job-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e8f0fe;
          color: var(--navy);
          flex-shrink: 0;
        }
        .job-info {
          flex: 1;
          min-width: 0;
        }
        .job-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }
        .job-title {
          font-weight: 600;
          font-size: 0.95rem;
        }
        .job-badge {
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-assigned {
          background: #fff4db;
          color: #c67a00;
        }
        .badge-progress {
          background: #e8efff;
          color: #3357c9;
        }
        .badge-awaiting {
          background: #fff8e6;
          color: #b7791f;
        }
        .badge-completed {
          background: #e9f9ef;
          color: #21864b;
        }
        .badge-cancelled {
          background: #fdecec;
          color: #c92e2e;
        }
        .job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .job-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: var(--sub);
        }
        .job-meta-item svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }
        .job-chevron {
          color: var(--sub);
          flex-shrink: 0;
        }

        @media (max-width: 1000px) {
          .assigned-layout {
            grid-template-columns: 1fr;
          }
          .assigned-sidebar {
            order: -1;
          }
        }
        @media (max-width: 600px) {
          .job-card {
            flex-wrap: wrap;
          }
          .job-meta {
            flex-direction: column;
            gap: 6px;
          }
          .job-title-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}