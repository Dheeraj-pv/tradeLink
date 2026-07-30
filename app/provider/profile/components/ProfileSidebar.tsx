import { UploadIcon, StarIcon } from "./icons";
import type { Profile, Category } from "../types";

interface Props {
  profile: Profile | null;
  categories: Category[];
  profilePhoto: string | null;
  onPhotoChange: (file: File) => void;
}

export function ProfileSidebar({ profile, categories, profilePhoto, onPhotoChange }: Props) {
  return (
    <div className="ps-left">
      <div className="ps-side-card">
        <div className="ps-avatar">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" className="ps-avatar-image" />
          ) : (
            (profile?.name.charAt(0) ?? "M")
          )}
        </div>
        <p className="ps-avatar-name">{profile?.name}</p>
        <p className="ps-avatar-trade">
          {categories
            .filter((c) => profile?.categoryIds.includes(c.id))
            .map((c) => c.name)
            .join(", ")}
        </p>
        {(profile?.avgRating ?? 0) > 0 && (
          <div className="ps-avatar-rating">
            <StarIcon />
            <span>{profile!.avgRating.toFixed(1)}</span>
            <span className="ps-avatar-reviews">· {profile!.reviewCount} reviews</span>
          </div>
        )}
        <button type="button" className="btn-change-photo">
          <UploadIcon />
          Change Photo
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPhotoChange(file);
            }}
          />
        </button>
      </div>

      <div className="ps-side-card ps-account-card">
        <p className="ps-account-label">ACCOUNT</p>
        <div className="ps-account-row">
          <span className="ps-account-key">Role</span>
          <span className="ps-account-val">Provider</span>
        </div>
        <div className="ps-account-row">
          <span className="ps-account-key">Member since</span>
          <span className="ps-account-val">{profile?.memberSince}</span>
        </div>
      </div>
    </div>
  );
}