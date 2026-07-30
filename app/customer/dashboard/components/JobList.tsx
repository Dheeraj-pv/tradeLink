import { JobCard } from "./JobCard";
import type { DashboardJob } from "../types";

interface Props {
  jobs: DashboardJob[];
  loading: boolean;
  emptyMessage?: string;
}

export function JobList({
  jobs,
  loading,
  emptyMessage = "No jobs found.",
}: Props) {
  if (loading) {
    return <p className="dash-page-sub">Loading jobs...</p>;
  }

  if (jobs.length === 0) {
    return <p className="dash-page-sub">{emptyMessage}</p>;
  }

  return (
    <div className="job-list">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
