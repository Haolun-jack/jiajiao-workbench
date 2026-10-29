"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({
  endpoint,
  label,
  confirmText,
  redirectTo,
}: {
  endpoint: string;
  label: string;
  confirmText: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handle() {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    const res = await fetch(endpoint, { method: "DELETE" });
    if (res.ok) {
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        router.refresh();
      }
    } else {
      const data = await res.json().catch(() => null);
      window.alert(data?.error ?? "删除失败，请重试");
      setBusy(false);
    }
  }

  return (
    <button
      className="btn btn-ghost"
      style={{ color: "#b91c1c" }}
      onClick={handle}
      disabled={busy}
    >
      {busy ? "删除中…" : label}
    </button>
  );
}
