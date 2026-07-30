import type { CSSProperties, ReactNode } from "react";

type IconProps = {
  className?: string;
  style?: CSSProperties;
  width?: number;
  height?: number;
};

function IconShell({
  children,
  className,
  style,
  width = 20,
  height = 20,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      style={style}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function KeyIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="M21 8.5l-5 5" />
      <path d="M15 8.5l2 2" />
      <path d="M11.5 12l-4 4" />
    </IconShell>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconShell {...props} width={20} height={20}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </IconShell>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="12" />
      <path d="M2 12h20" />
    </IconShell>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </IconShell>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </IconShell>
  );
}

export function DollarIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </IconShell>
  );
}

export function DropletIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </IconShell>
  );
}

export function ZapIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </IconShell>
  );
}

export function WrenchIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </IconShell>
  );
}

export function PaintIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M2 13.5V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6.5" />
      <path d="M2 13.5C2 8.806 5.806 5 10.5 5H14" />
      <path d="M14 5h4a2 2 0 0 1 2 2v1" />
      <line x1="6" y1="20" x2="6" y2="13" />
    </IconShell>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </IconShell>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </IconShell>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </IconShell>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </IconShell>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </IconShell>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <polyline points="9 18 15 12 9 6" />
    </IconShell>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </IconShell>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </IconShell>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </IconShell>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </IconShell>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </IconShell>
  );
}

export function XCircleIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </IconShell>
  );
}

export function XIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconShell>
  );
}
