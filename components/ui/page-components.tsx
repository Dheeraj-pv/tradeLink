"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/ui/icons";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1 className="dash-page-title">{title}</h1>
        {subtitle ? <p className="dash-page-sub">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
      <style jsx>{`
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .page-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}

type BackLinkProps = {
  href: string;
  label: string;
};

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link href={href} className="back-link">
      <ArrowLeftIcon width={16} height={16} />
      {label}
      <style jsx>{`
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--sub);
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          margin-bottom: 20px;
          transition: color 0.15s;
        }
        .back-link:hover {
          color: var(--text);
        }
      `}</style>
    </Link>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h2 className="empty-state-title">{title}</h2>
      {description ? <p className="empty-state-description">{description}</p> : null}
      {children ? <div className="empty-state-actions">{children}</div> : null}
      <style jsx>{`
        .empty-state {
          background: var(--white);
          border-radius: 12px;
          padding: 24px;
          border: 1px dashed var(--border);
          text-align: center;
          color: var(--sub);
        }
        .empty-state-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
        }
        .empty-state-description {
          font-size: 0.9rem;
          line-height: 1.6;
        }
        .empty-state-actions {
          margin-top: 16px;
          display: flex;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

type SettingsCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export function SettingsCard({
  title,
  subtitle,
  children,
  className,
  titleClassName,
  subtitleClassName,
}: SettingsCardProps) {
  return (
    <section className={`settings-card ${className ?? ""}`.trim()}>
      <h2 className={`settings-card-title ${titleClassName ?? ""}`.trim()}>{title}</h2>
      {subtitle ? (
        <p className={`settings-card-subtitle ${subtitleClassName ?? ""}`.trim()}>
          {subtitle}
        </p>
      ) : null}
      {children}
      <style jsx>{`
        .settings-card {
          background: var(--white);
          border-radius: 14px;
          padding: 32px;
          max-width: 600px;
          margin-bottom: 20px;
        }
        .settings-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 18px;
        }
        .settings-card-subtitle {
          color: var(--sub);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .settings-card :global(.form-field) {
          margin-bottom: 20px;
        }
        .settings-card :global(.form-field label) {
          display: block;
          margin-bottom: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text);
        }
        .settings-card :global(.form-field input) {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--border);
          border-radius: 9px;
          font-size: 0.875rem;
          font-family: inherit;
          background: var(--white);
          color: var(--text);
          outline: none;
          transition: border-color 0.15s;
        }
        .settings-card :global(.form-field input:focus) {
          border-color: var(--navy);
        }
        .settings-card :global(.btn-save),
        .settings-card :global(.btn-update) {
          padding: 12px 24px;
          border: none;
          border-radius: 9px;
          background: var(--navy);
          color: #fff;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
        }
        .settings-card :global(.btn-save:hover:not(:disabled)),
        .settings-card :global(.btn-update:hover:not(:disabled)) {
          background: #253460;
        }
        .settings-card :global(.btn-save:disabled),
        .settings-card :global(.btn-update:disabled) {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .settings-card :global(.field-help) {
          margin-top: 8px;
          font-size: 0.8rem;
          color: var(--sub);
          line-height: 1.4;
        }
        .settings-card.danger-card {
          border: 1.5px solid #f3c7c7;
        }
        .settings-card.danger-card .settings-card-title {
          color: #c92e2e;
        }
        .settings-card.danger-card .settings-card-subtitle {
          color: var(--sub);
        }
        .settings-card :global(.danger-title) {
          color: #c92e2e;
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .settings-card :global(.danger-text) {
          color: var(--sub);
          font-size: 0.85rem;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .settings-card :global(.btn-delete) {
          padding: 11px 22px;
          border: none;
          border-radius: 9px;
          background: #d33;
          color: #fff;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
        }
        .settings-card :global(.btn-delete:hover) {
          background: #b82424;
        }
        @media (max-width: 600px) {
          .settings-card {
            padding: 22px;
          }
        }
      `}</style>
    </section>
  );
}

type StatisticItem = {
  value: ReactNode;
  label: string;
  className: string;
  filter?: string;
};

type StatsGridProps = {
  items: StatisticItem[];
  selectedFilter?: string;
  onSelect?: (filter: string) => void;
};

export function StatsGrid({ items, selectedFilter, onSelect }: StatsGridProps) {
  return (
    <div className="stat-grid">
      {items.map((item) => {
        const isSelected = selectedFilter ? selectedFilter === item.filter : false;

        return (
          <button
            key={item.label}
            type="button"
            className={`stat-card ${item.className} ${isSelected ? "selected" : ""}`.trim()}
            onClick={() => item.filter && onSelect?.(item.filter)}
          >
            <div className="sc-num">{item.value}</div>
            <div className="sc-label">{item.label}</div>
          </button>
        );
      })}
      <style jsx>{`
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 36px;
        }
        .stat-card {
          border: none;
          text-align: left;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          border-radius: 12px;
          padding: 22px 24px;
          background: var(--white);
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        }
        .stat-card.selected {
          outline: 2px solid var(--navy);
          transform: translateY(-4px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
        }
        .sc-num {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .sc-label {
          font-size: 0.8rem;
          color: var(--sub);
          font-weight: 500;
        }
        .sc-blue {
          background: #eef3fd;
        }
        .sc-blue .sc-num {
          color: #3b6fd4;
        }
        .sc-amber {
          background: #fff8ee;
        }
        .sc-amber .sc-num {
          color: #b85c00;
        }
        .sc-green {
          background: #edf7f2;
        }
        .sc-green .sc-num {
          color: #287a52;
        }
        .sc-purple {
          background: #f3effe;
        }
        .sc-purple .sc-num {
          color: #6b3fbd;
        }
        .sc-navy {
          background: #eef2ff;
        }
        .sc-navy .sc-num {
          color: var(--navy);
        }
        @media (max-width: 900px) {
          .stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}

type SettingsTabItem = {
  href: string;
  label: string;
};

type SettingsTabsProps = {
  items: SettingsTabItem[];
};

export function SettingsTabs({ items }: SettingsTabsProps) {
  const pathname = usePathname();

  return (
    <div className="settings-tabs">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`settings-tab ${isActive ? "active" : ""}`.trim()}
          >
            {item.label}
          </Link>
        );
      })}
      <style jsx>{`
        .settings-tabs {
          display: inline-flex;
          gap: 4px;
          padding: 4px;
          background: #e8e3dc;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .settings-tab {
          padding: 9px 20px;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
          color: var(--sub);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .settings-tab.active {
          background: var(--white);
          color: var(--navy);
        }
        .settings-tab:hover:not(.active) {
          color: var(--navy);
        }
      `}</style>
    </div>
  );
}
