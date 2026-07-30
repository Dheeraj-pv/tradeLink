import { useRouter } from "next/navigation";

interface Props {
  requiresTwoFactor: boolean;
}

export function SuccessState({ requiresTwoFactor }: Props) {
  const router = useRouter();

  return (
    <>
      <h2>Password Updated</h2>

      <p className="auth-subtitle">
        Your password has been successfully updated.
        {requiresTwoFactor
          ? " You've been signed out everywhere for your security."
          : ""}
      </p>

      <div
        style={{
          background: "#ecfdf5",
          border: "1px solid #86efac",
          color: "#166534",
          padding: "14px",
          borderRadius: "10px",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        ✔ Password reset successful.
      </div>

      <button
        className="btn-auth-primary"
        onClick={() => router.push("/auth/login")}
      >
        Back to Login
      </button>
    </>
  );
}
