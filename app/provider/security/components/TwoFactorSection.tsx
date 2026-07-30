import TwoFactorSetup from "@/components/two-factor-setup";

interface Props {
  initialEnabled: boolean;
}

export function TwoFactorSection({ initialEnabled }: Props) {
  return (
    <div className="ps-card">
      <h2 className="ps-card-title">Two-Factor Authentication</h2>
      <p className="ps-card-desc">
        Add an extra layer of protection by requiring a code from your
        authenticator app when signing in or resetting your password.
      </p>
      <TwoFactorSetup initialEnabled={initialEnabled} />
    </div>
  );
}
