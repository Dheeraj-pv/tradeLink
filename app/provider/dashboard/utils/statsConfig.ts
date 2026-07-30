import type { DashboardStats } from "../types";

export const getStatCards = (stats: DashboardStats | undefined) => {
  if (!stats) return [];

  return [
    {
      value: stats.openJobs ?? 0,
      label: "Available Jobs",
      className: "sc-blue",
    },
    {
      value: stats.inProgressJobs ?? 0,
      label: "In Progress",
      className: "sc-amber",
    },
    {
      value: stats.assignedJobs ?? 0,
      label: "Assigned Jobs",
      className: "sc-green",
    },
    {
      value: stats.completedJobs ?? 0,
      label: "Completed Jobs",
      className: "sc-purple",
    },
  ];
};
