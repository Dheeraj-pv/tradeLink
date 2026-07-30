// app/provider/settings/profile/types.ts
export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  avgRating: number;
  reviewCount: number;
  categoryIds: number[];
  profileImage?: string | null;
};

export type Certification = { 
  id: string; 
  title: string; 
  url: string 
};

export type Category = { 
  id: number; 
  name: string 
};