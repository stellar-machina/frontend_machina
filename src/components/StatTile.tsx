import { type ReactNode } from "react";

type Props = {
  label: ReactNode;
  value: ReactNode;
  /**
   * Optional trend information to display alongside the stat.
   * `delta` specifies the numeric change. A positive delta renders an 'up' cue (▲); a negative delta renders a 'down' cue (▼).
   * `positiveIsGood` determines the semantic color (default: true). If true, a positive delta is emerald and negative is rose. If false, the colors are flipped.
   */
  trend?: { delta: number; positiveIsGood?: boolean };
};

/**
 * Displays a metric tile with an optional trend indicator.
 *
 * Trend colour semantics (`positiveIsGood` defaults to `true`):
 *   - delta > 0 + positive is good  → green (emerald)
 *   - delta > 0 + positive is bad   → red (rose)
 *   - delta ≤ 0 + positive is bad   → green (emerald)
 *   - delta ≤ 0 + positive is good  → red (rose)
 */
export function StatTile({ label, value, trend }: Props) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 text-center dark:border-zinc-800">
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold">{value}</dd>
      {trend && (
        <p
          className={`mt-1 text-xs ${
            (trend.delta > 0 ? trend.positiveIsGood !== false : trend.positiveIsGood === false)
              ? "text-emerald-700"
              : "text-rose-700"
          }`}
        >
          <span className="sr-only">
            {trend.delta > 0 ? "up " : trend.delta < 0 ? "down " : "unchanged "}
            {Math.abs(trend.delta)}
          </span>
          <span aria-hidden="true">
            {trend.delta > 0 ? "▲ " : trend.delta < 0 ? "▼ " : "— "}
            {trend.delta > 0 ? "+" : ""}
            {trend.delta}
          </span>
        </p>
      )}
    </div>
  );
}
