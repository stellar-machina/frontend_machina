"use client";

import { type InputHTMLAttributes, useId, useRef } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
  value: string;
  onChange: (next: string) => void;
  label?: string;
  clearable?: boolean;
};

/**
 * Controlled search input with an accessible programmatic name.
 *
 * `label` sets the visually hidden text associated with the search input and
 * defaults to "Search" for existing callers. Set `clearable` to show a
 * keyboard-operable clear button whenever `value` is non-empty; activating it
 * calls `onChange("")` and returns focus to the input.
 */
export function SearchBar({
  value,
  onChange,
  label = "Search",
  clearable = false,
  placeholder = "Search…",
  id,
  className,
  ...rest
}: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const showClear = clearable && value.length > 0;
  const inputClassName = [
    "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-zinc-700 dark:bg-zinc-900",
    showClear ? "pr-10" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  function clearSearch() {
    onChange("");
    inputRef.current?.focus();
  }

  return (
    <div className="relative inline-flex w-full max-w-md items-center">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
        {...rest}
      />
      {showClear && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={clearSearch}
          className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
}
