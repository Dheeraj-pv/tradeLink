import Link from "next/link";

interface Props {
  isValid: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function FormActions({ isValid, isSubmitting, onSubmit }: Props) {
  return (
    <div className="form-actions">
      <button
        className="btn-post"
        disabled={!isValid || isSubmitting}
        onClick={onSubmit}
      >
        {isSubmitting ? "Posting…" : "Post Job"}
      </button>
      <Link href="/customer/dashboard" className="btn-cancel">
        Cancel
      </Link>
    </div>
  );
}
