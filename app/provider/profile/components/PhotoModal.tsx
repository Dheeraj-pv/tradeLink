import Image from "next/image";
interface Props {
  preview: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PhotoModal({ preview, onConfirm, onCancel }: Props) {
  if (!preview) return null;

  return (
    <div className="photo-modal" onClick={onCancel}>
      <div className="photo-content" onClick={(e) => e.stopPropagation()}>
        <Image src="" alt="Preview" width={100} height={100} />
        <p>Use this photo as your profile picture?</p>
        <div className="photo-actions">
          <button className="btn-confirm" onClick={onConfirm}>
            Yes
          </button>
          <button className="btn-cancel-photo" onClick={onCancel}>
            No
          </button>
        </div>
      </div>
    </div>
  );
}
