type Variant = "ok" | "warn" | "down";

const variants: Record<Variant, string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  down: "bg-rose-500",
};

const labels: Record<Variant, string> = {
  ok: "Operational",
  warn: "Degraded",
  down: "Down",
};

export function StatusDot({ variant }: { variant: Variant }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 rounded-full ${variants[variant]}`}
      />
      <span>{labels[variant]}</span>
    </span>
  );
}
