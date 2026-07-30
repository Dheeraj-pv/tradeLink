interface Props {
  onDelete: () => void;
}

export function DangerZone({ onDelete }: Props) {
  return (
    <div className="ps-card danger-card">
      <h2 className="danger-title">Danger Zone</h2>
      <p className="danger-text">
        Permanently delete your account and all data. This cannot be undone.
      </p>
      <button className="btn-delete" onClick={onDelete}>
        Delete Account
      </button>
    </div>
  );
}
