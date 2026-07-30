import SecurityClient from "./security-client";
import { getInitialTwoFactorEnabled } from "@/lib/server/get-two-factor-state";

export default async function SecurityPage() {
  const initialTwoFactorEnabled = await getInitialTwoFactorEnabled();

  return <SecurityClient initialTwoFactorEnabled={initialTwoFactorEnabled} />;
}
