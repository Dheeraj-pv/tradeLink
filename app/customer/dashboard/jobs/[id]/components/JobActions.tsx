import Link from "next/link";

interface Props {
  jobId: string;
  isOpen: boolean;
  isAwaitingApproval: boolean;
  cancelling: boolean;
  onCancel: () => void;
  onApprove: () => void;
}

export function JobActions({
  jobId,
  isOpen,
  isAwaitingApproval,
  cancelling,
  onCancel,
  onApprove,
}: Props) {
  return (
    <>
      {isOpen && (
        <div className="detail-actions">
          <Link
            href={`/customer/dashboard/jobs/${jobId}/edit`}
            className="btn-edit"
          >
            Edit
          </Link>
          <button
            className="btn-cancel-job"
            onClick={onCancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling…" : "Cancel Job"}
          </button>
        </div>
      )}
    </>
  );
}
