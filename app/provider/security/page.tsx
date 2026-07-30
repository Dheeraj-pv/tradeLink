// app/provider/settings/security/page.tsx

import SecurityClient from "./security-client";
import { getInitialTwoFactorEnabled } from "@/lib/server/get-two-factor-state";

export default async function ProviderSecurityPage() {
  const initialTwoFactorEnabled = await getInitialTwoFactorEnabled();

  return <SecurityClient initialTwoFactorEnabled={initialTwoFactorEnabled} />;
}
