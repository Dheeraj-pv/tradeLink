import Image from "next/image";
import { RatingStars } from "@/components/ui/review-components";
import type { Provider } from "../types";

interface Props {
  provider: Provider;
}

export function ProviderHeader({ provider }: Props) {
  const initial = provider.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="profile-header">
      <div className="avatar">
        {provider.profileImage ? (
          <Image src="" alt="" width={100} height={100} />
        ) : (
          initial
        )}
      </div>

      <div>
        <h1>{provider.name}</h1>
        {provider.specialty && <p>{provider.specialty}</p>}

        <div className="rating">
          <RatingStars rating={provider.rating} gap={2} />
          <span>
            {provider.rating.toFixed(1)} · {provider.reviewCount} review
            {provider.reviewCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
