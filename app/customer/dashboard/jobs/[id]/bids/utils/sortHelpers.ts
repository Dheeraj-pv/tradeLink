import type { Bid, SortOption } from "../types";

export const sortBids = (bids: Bid[], sortBy: SortOption): Bid[] => {
  const copy = [...bids];

  switch (sortBy) {
    case "Lowest Price":
      return copy.sort((a, b) => a.amount - b.amount);
    case "Highest Price":
      return copy.sort((a, b) => b.amount - a.amount);
    case "Highest Rating":
      return copy.sort((a, b) => b.provider.avgRating - a.provider.avgRating);
    default:
      return copy;
  }
};

export const getProviderInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};
