export type DashboardStats = {
  totalJobs: number;
  openJobs: number;
  assignedJobs: number;
  completedJobs: number;
  inProgressJobs: number;
};

export type DashboardStatsFilter =
  "ALL" | "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type DashboardJob = {
  id: string;
  title: string;
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  address: string;
  createdAt: string;
  bidCount: number;
};

export type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};
