interface CommonBadgeProps {
  name: string;
  bgColor?: string;
  textColor?: string;
}

export function CommonBadge({
  name,
  bgColor = '#1e293b',
  textColor = '#e2e8f0',
}: CommonBadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-heading uppercase tracking-wide whitespace-nowrap"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {name}
    </span>
  );
}
