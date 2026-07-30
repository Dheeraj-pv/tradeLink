interface Props {
  onDelete: () => void;
}

export function DangerZone({ onDelete }: Props) {
  return (
    <div className="danger-card">
      <p className="danger-text">
        Permanently delete your account and all associated data. This action
        cannot be undone.
      </p>
      <button className="btn-delete" onClick={onDelete}>
        Delete Account
      </button>
    </div>
  );
}
