import Link from "next/link";
import {
  PinIcon,
  ClockIcon,
  DollarIcon,
  ChevronRightIcon,
  DropletIcon,
} from "./icons";
import { getBadgeClass } from "../utils/statusHelpers";
import type { DashboardJob } from "../types";

interface Props {
  job: DashboardJob;
}

export function JobCard({ job }: Props) {
  return (
    <Link href={`/customer/dashboard/jobs/${job.id}`} className="job-card">
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
  );
}
