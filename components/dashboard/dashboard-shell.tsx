"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFcmToken } from "@/app/hooks/useFcmTokens";
import {
  HomeIcon,
  KeyIcon,
  LogoutIcon,
  SettingsIcon,
} from "@/components/ui/icons";

type DashboardShellProps = {
  children: React.ReactNode;
  role: "customer" | "provider";
  portalTitle: string;
  navItems: Array<{
    href: string;
    label: string;
    icon: typeof HomeIcon;
    badge?: number;
  }>;
  extraSettings?: Array<{ href: string; label: string }>;
};

type Profile = {
  id: string;
  name: string;
  email: string;
};

export function DashboardShell({
  children,
  role,
  portalTitle,
  navItems,
  extraSettings = [],
}: DashboardShellProps) {
  useFcmToken();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith(`/${role}/profile`) ||
      pathname.startsWith(`/${role}/security`),
  );

  useEffect(() => {
    let active = true;

    async function loadCount() {
      try {
        const res = await fetch("/api/notifications/unread-count", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!res.ok) {
          if (active) setUnreadCount(0);
          return;
        }

        const data = await res.json().catch(() => ({ unreadCount: 0 }));
        if (active) {
          setUnreadCount(
            typeof data?.unreadCount === "number" ? data.unreadCount : 0,
          );
        }
      } catch {
        if (active) setUnreadCount(0);
      }
    }

    void loadCount();
    const interval = window.setInterval(() => {
      void loadCount();
    }, 10000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const active = true;

    async function loadUser() {
      try {
        const res = await fetch("/api/user-profile", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!res.ok) {
          if (active) setProfile(null);
          return;
        }

        const data = await res.json().catch(() => null);
        if (active) {
          setProfile(
            data && typeof data === "object" && "id" in data && "name" in data
              ? (data as Profile)
              : null,
          );
        }
      } catch {
        if (active) setProfile(null);
      }
    }

    void loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/auth/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const settingsHrefBase = `/${role}`;
  const navItemsWithBadges = navItems.map((item) =>
    item.label === "Notifications"
      ? { ...item, badge: item.badge ?? unreadCount }
      : item,
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --navy: #1a2540; --navy-2: #1e2d4d; --orange: #d4621a;
          --cream: #f0ece4; --white: #ffffff; --muted: #8fa0b8;
          --border: #e2ddd8; --text: #1a2540; --sub: #7a7060;
        }
        body { font-family: 'Inter', sans-serif; color: var(--text); background: var(--cream); }
        .dash-shell { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
        .sidebar { background: var(--navy); display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .sb-logo-wrap { padding: 24px 20px 8px; }
        .sb-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .sb-logo-name { font-weight: 700; font-size: .95rem; color: #fff; }
        .sb-logo svg { color: var(--orange); }
        .sb-portal { font-size: .72rem; color: var(--muted); padding: 0 20px 20px; }
        .sb-user { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-top: 1px solid rgba(255,255,255,.07); border-bottom: 1px solid rgba(255,255,255,.07); margin-bottom: 8px; }
        .sb-avatar { width: 36px; height: 36px; background: var(--orange); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .9rem; color: #fff; flex-shrink: 0; }
        .sb-user-name { font-size: .85rem; font-weight: 600; color: #fff; }
        .sb-user-email { font-size: .72rem; color: var(--muted); word-break: break-word; }
        .sb-nav { flex: 1; padding: 4px 12px; display: flex; flex-direction: column; gap: 2px; }
        .sb-link { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: var(--muted); font-size: .875rem; font-weight: 500; text-decoration: none; transition: background .15s, color .15s; border: none; background: transparent; cursor: pointer; font-family: inherit; width: 100%; }
        .sb-link:hover { background: rgba(255,255,255,.06); color: #fff; }
        .sb-link.active { background: rgba(255,255,255,.1); color: #fff; }
        .sb-link svg { flex-shrink: 0; opacity: .8; }
        .sb-link.active svg { opacity: 1; }
        .sb-badge { margin-left: auto; background: var(--orange); color: #fff; font-size: .68rem; font-weight: 700; border-radius: 999px; padding: 2px 7px; min-width: 20px; text-align: center; }
        .sb-footer { padding: 12px; border-top: 1px solid rgba(255,255,255,.07); }
        .sb-logout { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; width: 100%; color: var(--muted); font-size: .875rem; font-weight: 500; background: transparent; border: none; cursor: pointer; font-family: inherit; transition: background .15s, color .15s; }
        .sb-logout:hover { background: rgba(255,255,255,.06); color: #fff; }
        .sb-submenu { margin-left: 28px; display: flex; flex-direction: column; gap: 2px; }
        .sb-sublink { padding: 8px 12px; border-radius: 8px; text-decoration: none; color: var(--muted); font-size: .82rem; transition: background .15s, color .15s; }
        .sb-sublink:hover { background: rgba(255,255,255,.06); color: #fff; }
        .sb-sublink.active { color: #fff; background: rgba(255,255,255,.1); }
        .dash-main { background: var(--cream); overflow-y: auto; }
        .dash-page { padding: 40px 40px; }
        .dash-page-title { font-family: 'Playfair Display', serif; font-size: 1.75rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
        .dash-page-sub { font-size: .875rem; color: var(--sub); margin-bottom: 32px; }
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 36px; }
        .stat-card { background: var(--white); border-radius: 12px; padding: 22px 24px; }
        .stat-card .sc-num { font-size: 2rem; font-weight: 800; margin-bottom: 6px; }
        .stat-card .sc-label { font-size: .8rem; color: var(--sub); font-weight: 500; }
        .sc-blue .sc-num { color: #3b6fd4; } .sc-blue { background: #eef3fd; }
        .sc-amber .sc-num { color: #b85c00; } .sc-amber { background: #fff8ee; }
        .sc-green .sc-num { color: #287a52; } .sc-green { background: #edf7f2; }
        .sc-purple .sc-num { color: #6b3fbd; } .sc-purple { background: #f3effe; }
        .dash-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .dash-section-title { font-size: 1.05rem; font-weight: 700; color: var(--text); }
        .job-list { display: flex; flex-direction: column; gap: 10px; }
        .job-card { background: var(--white); border-radius: 12px; padding: 18px 20px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: box-shadow .15s; text-decoration: none; color: inherit; }
        .job-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.08); }
        .job-icon { width: 40px; height: 40px; background: #f5f2ee; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .job-icon svg { width: 20px; height: 20px; color: var(--sub); }
        .job-info { flex: 1; }
        .job-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
        .job-title { font-size: .9rem; font-weight: 600; color: var(--text); }
        .job-badge { font-size: .65rem; font-weight: 700; letter-spacing: .05em; padding: 3px 9px; border-radius: 999px; border: 1.5px solid; }
        .badge-open { color: #3b6fd4; border-color: #3b6fd4; background: #eef3fd; }
        .badge-assigned { color: #b85c00; border-color: #e8891a; background: #fff8ee; }
        .badge-completed { color: #287a52; border-color: #34a868; background: #edf7f2; }
        .job-meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .job-meta-item { display: flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--sub); }
        .job-meta-item svg { width: 13px; height: 13px; }
        .job-chevron { color: #c0b8b0; flex-shrink: 0; }
        @media (max-width: 900px) { .dash-shell { grid-template-columns: 1fr; } .sidebar { position: static; height: auto; flex-direction: row; flex-wrap: wrap; padding: 12px; gap: 8px; } .sb-logo-wrap, .sb-portal, .sb-user, .sb-footer { display: none; } .sb-nav { flex-direction: row; padding: 0; gap: 4px; } .sb-link { padding: 8px 12px; font-size: .8rem; } .stat-grid { grid-template-columns: repeat(2, 1fr); } .dash-page { padding: 24px 20px; } }
      `}</style>

      <div className="dash-shell">
        <aside className="sidebar">
          <div className="sb-logo-wrap">
            <Link href="/" className="sb-logo">
              <KeyIcon />
              <span className="sb-logo-name">TradeLink</span>
            </Link>
          </div>
          <p className="sb-portal">{portalTitle}</p>

          <div className="sb-user">
            <div className="sb-avatar">{profile?.name?.[0] ?? "U"}</div>
            <div>
              <div className="sb-user-name">{profile?.name ?? "User"}</div>
              <div className="sb-user-email">{profile?.email ?? ""}</div>
            </div>
          </div>

          <nav className="sb-nav">
            {navItemsWithBadges.map(
              ({ href, label, icon: Icon, badge = 0 }) => (
                <Link
                  key={href}
                  href={href}
                  className={`sb-link ${isActive(href) ? "active" : ""}`}
                >
                  <Icon />
                  {label}
                  {badge > 0 && <span className="sb-badge">{badge}</span>}
                </Link>
              ),
            )}

            {extraSettings.length > 0 && (
              <>
                <button
                  className={`sb-link ${pathname.startsWith(`${settingsHrefBase}/profile`) || pathname.startsWith(`${settingsHrefBase}/security`) ? "active" : ""}`}
                  onClick={() => setSettingsOpen((v) => !v)}
                >
                  <SettingsIcon />
                  <span>Settings</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      transition: "transform .2s",
                      transform: settingsOpen
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    ▶
                  </span>
                </button>
                {settingsOpen && (
                  <div className="sb-submenu">
                    {extraSettings.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`sb-sublink ${isActive(item.href) ? "active" : ""}`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </nav>

          <div className="sb-footer">
            <button onClick={handleLogout} className="sb-logout">
              <LogoutIcon />
              Logout
            </button>
          </div>
        </aside>

        <main className="dash-main">{children}</main>
      </div>
    </>
  );
}
