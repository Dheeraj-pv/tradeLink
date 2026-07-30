import type { DashboardStats, DashboardStatsFilter } from "../types";

export const STAT_CARDS = [
  {
    key: "totalJobs",
    label: "Total Jobs",
    filter: "ALL" as DashboardStatsFilter,
    className: "sc-navy",
  },
  {
    key: "openJobs",
    label: "Open Jobs",
    filter: "OPEN" as DashboardStatsFilter,
    className: "sc-blue",
  },
  {
    key: "assignedJobs",
    label: "Assigned",
    filter: "ASSIGNED" as DashboardStatsFilter,
    className: "sc-amber",
  },
  {
    key: "completedJobs",
    label: "Completed",
    filter: "COMPLETED" as DashboardStatsFilter,
    className: "sc-green",
  },
  {
    key: "inProgressJobs",
    label: "In Progress",
    filter: "IN_PROGRESS" as DashboardStatsFilter,
    className: "sc-purple",
  },
] as const;

export const getStatCards = (stats: DashboardStats | undefined) => {
  if (!stats) {
    return STAT_CARDS.map((card) => ({
      ...card,
      value: 0,
    }));
  }

  return STAT_CARDS.map((card) => ({
    ...card,
    value: stats[card.key as keyof DashboardStats] ?? 0,
  }));
};
