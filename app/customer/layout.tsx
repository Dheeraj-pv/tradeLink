"use client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BellIcon, HomeIcon, PlusIcon } from "@/components/ui/icons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/customer/dashboard", label: "Dashboard", icon: HomeIcon },
    { href: "/customer/post-job", label: "Post a Job", icon: PlusIcon },
    {
      href: "/customer/notifications",
      label: "Notifications",
      icon: BellIcon,
    },
  ];

  return (
    <DashboardShell
      role="customer"
      portalTitle="Customer Portal"
      navItems={navItems}
      extraSettings={[
        { href: "/customer/profile", label: "Profile" },
        { href: "/customer/security", label: "Security" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
