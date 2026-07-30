export type Job = {
  id: string;
  title: string;
  description: string;
  address: string;
  status: string;
  category: string;
  customerName: string;
  agreedAmount: number | null;
};

export type Summary = {
  activeCount: number;
  totalEarnings: number;
};