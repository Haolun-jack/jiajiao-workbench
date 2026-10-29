import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty" style={{ paddingTop: 80 }}>
      <div className="empty-icon" style={{ fontSize: 22 }}>
        404
      </div>
      <div style={{ fontWeight: 600, color: "#4b5563" }}>页面不存在</div>
      <div style={{ marginTop: 4 }}>你访问的地址可能已失效。</div>
      <Link className="btn btn-primary" href="/" style={{ marginTop: 18 }}>
        返回工作台
      </Link>
    </div>
  );
}
