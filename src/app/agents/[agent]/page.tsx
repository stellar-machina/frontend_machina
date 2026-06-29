"use client";

import { useEffect, useState, use } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { apiGet } from "@/lib/apiClient";

type Usage = { agent: string; items: { serviceId: string; total: number }[] };

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const { agent } = use(params);
  const [items, setItems] = useState<Usage["items"] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Usage>(`/api/v1/agents/${encodeURIComponent(agent)}/usage`)
      .then((b) => setItems(b.items))
      .catch((e) => setError(e.message));
    apiGet<{ total: number }>(
      `/api/v1/agents/${encodeURIComponent(agent)}/total`
    )
      .then((b) => setTotal(b.total))
      .catch(() => {
        /* total is optional */
      });
  }, [agent]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-[60vh] max-w-3xl flex-col gap-6 p-8 focus:outline-none"
    >
      <Breadcrumb items={[{ label: "Agents", href: "/agents" }, { label: agent }]} />
      <h1 className="text-3xl font-semibold tracking-tight font-mono">{agent}</h1>
      {error && (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}
      {total !== null && (
        <p className="text-sm">
          Lifetime total: <strong>{total}</strong> requests
        </p>
      )}
      {items && items.length === 0 && (
        <p className="text-sm text-zinc-500">No services consumed yet.</p>
      )}
      {items && items.length > 0 && (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.map((s) => (
            <li key={s.serviceId} className="flex items-center justify-between py-3 text-sm">
              <span className="font-mono">{s.serviceId}</span>
              <span>{s.total} requests</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
