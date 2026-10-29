"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconAlert,
  IconBook,
  IconCalendar,
  IconChart,
  IconHome,
  IconUsers,
} from "@/components/icons";

const nav = [
  { href: "/", label: "工作台", icon: IconHome },
  { href: "/students", label: "学生档案", icon: IconUsers },
  { href: "/lesson-plans", label: "教案", icon: IconBook },
  { href: "/class-records", label: "上课记录", icon: IconCalendar },
  { href: "/mistakes", label: "错题记录", icon: IconAlert },
  { href: "/evaluations", label: "学习诊断", icon: IconChart },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">物</span>
          <span>
            <div className="brand-name">家教工作台</div>
            <div className="brand-sub">高中物理 · 学情诊断</div>
            <div className="brand-author">作者：lunnofunny</div>
          </span>
        </Link>

        <nav className="nav">
          <div className="nav-label">工作区</div>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${isActive(item.href) ? " active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <div>
            <span className="dot" />
            本地版运行中
          </div>
          数据保存在本机数据库，无需联网。
        </div>
      </aside>

      <main className="main">
        <div className="main-inner">{children}</div>
      </main>
    </div>
  );
}
