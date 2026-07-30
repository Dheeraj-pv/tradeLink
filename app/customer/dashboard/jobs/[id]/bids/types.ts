export type Bid = {
  id: string;
  amount: number;
  message: string | null;
  status: string;
  provider: {
    id: string;
    name: string;
    avgRating: number;
    reviewCount: number;
    category: string;
  };
};

export type SortOption = "Lowest Price" | "Highest Price" | "Highest Rating";
