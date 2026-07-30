export type JobStatus =
  "ASSIGNED" | "IN_PROGRESS" | "AWAITING_APPROVAL" | "COMPLETED";

export type Job = {
  id: string;
  title: string;
  description: string;
  address: string;
  status: JobStatus;
  category: string;
  customerName: string;
  createdAt: string;
  agreedAmount: number | null;
};

export type BannerConfig = {
  label: string;
  cls: string;
};
