interface Props {
  isOpen: boolean;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteMediaModal({
  isOpen,
  deleting,
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Delete Media</h3>
        <p>Are you sure you want to permanently remove this media?</p>
        <div className="modal-actions">
          <button
            className="btn-cancel modal-btn"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            className="btn-delete"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
