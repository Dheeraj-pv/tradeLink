import { DropletIcon, ZapIcon, WrenchIcon } from "./icons";

interface Props {
  category?: string;
}

export function CategoryIcon({ category }: Props) {
  if (!category) return <WrenchIcon />;

  const lower = category.toLowerCase();
  if (
    lower.includes("plumb") ||
    lower.includes("pipe") ||
    lower.includes("water")
  )
    return <DropletIcon />;
  if (lower.includes("elect") || lower.includes("wir")) return <ZapIcon />;

  return <WrenchIcon />;
}
