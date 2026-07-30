import { JobCard } from "./JobCard";
import type { Job } from "../types";

interface Props {
  jobs: Job[];
}

export function JobList({ jobs }: Props) {
  return (
    <div className="assigned-main">
      <div className="job-list">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
