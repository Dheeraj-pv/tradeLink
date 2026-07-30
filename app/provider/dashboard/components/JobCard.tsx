import Link from "next/link";
import { PinIcon, UserIcon, ChevronRightIcon } from "./icons";
import { CategoryIcon } from "./CategoryIcon";
import type { Job } from "../types";

interface Props {
  job: Job;
}

export function JobCard({ job }: Props) {
  return (
    <Link href={`/provider/dashboard/jobs/${job.id}`} className="job-card">
      <div className="job-icon">
        <CategoryIcon category={job.category} />
      </div>
      <div className="job-info">
        <div className="job-title-row">
          <span className="job-title">{job.title}</span>
          <span className={`job-badge badge-${job.status.toLowerCase()}`}>
            {job.status}
          </span>
        </div>
        <div className="job-meta">
          <span className="job-meta-item">
            <PinIcon />
            {job.address}
          </span>
          <span className="job-meta-item">
            <UserIcon />
            {job.customerName ||
              `${job.bidCount} bid${job.bidCount !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>
      <span className="job-chevron">
        <ChevronRightIcon />
      </span>
    </Link>
  );
}
