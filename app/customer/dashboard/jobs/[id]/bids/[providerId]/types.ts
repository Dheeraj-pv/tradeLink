import type { ServerMediaItem } from "@/components/ui/media-components";

export type Review = {
  id?: string;
  name: string;
  rating: number;
  comment: string;
  media: ServerMediaItem[];
};

export type Certification = {
  id: string;
  title: string;
  url: string;
};

export type Provider = {
  id: string;
  name: string;
  profileImage: string | null;
  specialty: string | null;
  bio: string | null;
  phone: string | null;
  certifications: Certification[];
  rating: number;
  reviewCount: number;
};
