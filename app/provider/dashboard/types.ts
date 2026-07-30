export type Job = {
  id: string;
  title: string;
  address: string;
  status: string;
  createdAt: string;
  bidCount: number;
  category?: string;
  customerName?: string;
};

export type DashboardStats = {
  openJobs: number;
  assignedJobs: number;
  completedJobs: number;
  totalJobs: number;
  inProgressJobs: number;
};

export type DashboardData = {
  provider: {
    name: string;
    avgRating: number;
    reviewCount: number;
  };
  stats: DashboardStats;
  recentJobs: Job[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};
