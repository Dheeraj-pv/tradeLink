import type { ServerMediaItem } from "@/components/ui/media-components";

export type Category = {
  id: number;
  name: string;
};

export type ExistingMedia = ServerMediaItem & {
  type: "image" | "video";
};

export type PreviewRef =
  { kind: "existing"; index: number } | { kind: "new"; index: number };

export type JobFormData = {
  title: string;
  description: string;
  address: string;
  categoryId: number;
};
