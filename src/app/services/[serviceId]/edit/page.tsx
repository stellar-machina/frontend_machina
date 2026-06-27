"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { TextField } from "@/components/TextField";
import { parseNonNegativeInt } from "@/lib/validateNumber";

type Service = { serviceId: string; priceStroops: number };

export default function EditServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = use(params);
  const router = useRouter();
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet<Service>(`/api/v1/services/${encodeURIComponent(serviceId)}`)
      .then((s) => setPrice(String(s.priceStroops)))
      .catch((e) => setError(e.message));
  }, [serviceId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = parseNonNegativeInt(price);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }

    setLoading(true);
    try {
      await apiPatch(
        `/api/v1/services/${encodeURIComponent(serviceId)}/price`,
        { priceStroops: parsed.value }
      );
      router.push(`/services/${encodeURIComponent(serviceId)}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-[60vh] max-w-xl flex-col gap-6 p-8 focus:outline-none"
    >
      <h1 className="text-3xl font-semibold tracking-tight">Edit price</h1>
      <p className="font-mono text-sm text-zinc-500">{serviceId}</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <TextField
          label="Price (stroops / request)"
          inputMode="numeric"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          error={error}
        />
        <button
          type="submit"
          disabled={loading}
          className="self-start rounded-full bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {loading ? "Saving…" : "Save"}
        </button>

      </form>
    </main>
  );
}
