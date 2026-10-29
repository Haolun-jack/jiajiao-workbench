import type { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        {kicker ? <div className="page-kicker">{kicker}</div> : null}
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-desc">{description}</p> : null}
      </div>
      {actions ? <div style={{ flex: "none" }}>{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="empty">
      {icon ? <div className="empty-icon">{icon}</div> : null}
      <div style={{ fontWeight: 600, color: "#4b5563" }}>{title}</div>
      {description ? <div style={{ marginTop: 4 }}>{description}</div> : null}
    </div>
  );
}

export function Badge({
  tone,
  children,
}: {
  tone: "blue" | "green" | "amber" | "red" | "gray" | "violet";
  children: ReactNode;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function SectionHeader({
  title,
  link,
  linkText,
}: {
  title: string;
  link?: string;
  linkText?: string;
}) {
  return (
    <div className="section-head">
      <div className="section-title">{title}</div>
      {link ? (
        <a className="section-link" href={link}>
          {linkText ?? "查看全部"} →
        </a>
      ) : null}
    </div>
  );
}
