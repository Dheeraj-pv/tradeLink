"use client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  BellIcon,
  CheckCircleIcon,
  DollarIcon,
  HomeIcon,
  StarIcon,
} from "@/components/ui/icons";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/provider/dashboard", label: "Dashboard", icon: HomeIcon },
    { href: "/provider/bids", label: "My Bids", icon: DollarIcon },
    {
      href: "/provider/assigned-jobs",
      label: "Assigned Jobs",
      icon: CheckCircleIcon,
    },
    { href: "/provider/reviews", label: "Reviews", icon: StarIcon },
    {
      href: "/provider/notifications",
      label: "Notifications",
      icon: BellIcon,
    },
  ];

  return (
    <DashboardShell
      role="provider"
      portalTitle="Provider Portal"
      navItems={navItems}
      extraSettings={[
        { href: "/provider/profile", label: "Profile" },
        { href: "/provider/security", label: "Security" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
