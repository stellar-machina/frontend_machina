"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/apiClient";
import { useDebounce } from "@/lib/useDebounce";
import { SearchBar } from "@/components/SearchBar";

type Service = { serviceId: string; priceStroops: number };

export default function SearchPage() {
  const [q, setQ] = useState("");
  const debounced = useDebounce(q, 250);
  const [items, setItems] = useState<Service[] | null>(null);
  const visibleItems = debounced ? items : null;

  // Derive live region text from items and debounced query
  const liveRegionText = useMemo(() => {
    if (!debounced) return "";
    if (!items) return "";
    const count = items.length;
    return count === 0
      ? `No matches for "${debounced}"`
      : `${count} result${count === 1 ? "" : "s"} for "${debounced}"`;
  }, [debounced, items]);

  useEffect(() => {
    if (!debounced) return;
    apiGet<{ services: Service[] }>(
      `/api/v1/services?q=${encodeURIComponent(debounced)}&limit=50`
    )
      .then((b) => setItems(b.services))
      .catch(() => setItems([]));
  }, [debounced]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-[60vh] max-w-3xl flex-col gap-6 p-8 focus:outline-none"
    >
      <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
      <SearchBar value={q} onChange={setQ} placeholder="Search services…" />
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveRegionText}
      </div>
      {visibleItems && visibleItems.length === 0 && (
        <p className="text-sm text-zinc-500">No matches.</p>
      )}
      {visibleItems && visibleItems.length > 0 && (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {visibleItems.map((s) => (
            <li key={s.serviceId} className="py-3 font-mono text-sm">
              <a href={`/services/${encodeURIComponent(s.serviceId)}`} className="hover:underline">
                {s.serviceId}
              </a>{" "}
              <span className="text-zinc-500">— {s.priceStroops} stroops</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
