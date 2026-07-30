export type Job = {
  id: string;
  title: string;
  description: string;
  address: string;
  status: string;
  category: string;
  bidCount: number;
  createdAt: string;
};

export type BidData = {
  amount: number;
  message: string;
};

export type MediaItem = {
  id: string;
  url: string;
  mediaType: "IMAGE" | "VIDEO";
};
