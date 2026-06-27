"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/apiClient";
import { PageShell } from "@/components/PageShell";
import { TextField } from "@/components/TextField";
import { parseNonNegativeInt } from "@/lib/validateNumber";

export default function NewServicePage() {
  const router = useRouter();
  const [serviceId, setServiceId] = useState("");
  const [priceStroops, setPriceStroops] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseNonNegativeInt(priceStroops);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }

    setLoading(true);
    try {
      await apiPost("/api/v1/services", {
        serviceId,
        priceStroops: parsed.value,
      });
      router.push("/services");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell maxWidth="xl" gap="6">
      <h1 className="text-3xl font-semibold tracking-tight">New service</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span>Service ID</span>
          <input
            required
            maxLength={128}
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <TextField
          label="Price (stroops / request)"
          inputMode="numeric"
          required
          value={priceStroops}
          onChange={(e) => setPriceStroops(e.target.value)}
          error={error}
        />

        <button
          type="submit"
          disabled={loading}
          className="self-start rounded-full bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {loading ? "Saving…" : "Register service"}
        </button>

        {error && (
          <p role="alert" className="text-sm text-rose-600">
            {error}
          </p>
        )}
      </form>
    </PageShell>
  );
}

