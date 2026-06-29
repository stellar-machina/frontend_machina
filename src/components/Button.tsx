import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200",
  secondary:
    "border border-zinc-300 hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-500",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700",
};

const ring =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      aria-busy={loading || undefined}
      className={`rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${ring} ${className}`}
    />
  );
}
