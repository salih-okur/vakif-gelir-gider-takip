"use client";

import type { TimeFilter } from "../_lib/types";

const ALL_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: "1ay", label: "1 Ay" },
  { value: "6ay", label: "6 Ay" },
  { value: "1yil", label: "1 Yıl" },
];

interface TimeFilterTabsProps {
  value: TimeFilter;
  onChange: (value: TimeFilter) => void;
  options?: TimeFilter[];
  size?: "default" | "compact";
}

export default function TimeFilterTabs({
  value,
  onChange,
  options,
  size = "default",
}: TimeFilterTabsProps) {
  const visibleOptions = options
    ? ALL_OPTIONS.filter((opt) => options.includes(opt.value))
    : ALL_OPTIONS;
  const isCompact = size === "compact";

  return (
    <div
      className={`grid w-full gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${
        isCompact ? "" : "sm:inline-grid sm:w-auto"
      }`}
      style={{ gridTemplateColumns: `repeat(${visibleOptions.length}, minmax(0, 1fr))` }}
    >
      {visibleOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg text-sm font-medium transition-colors ${
            isCompact ? "min-h-8 px-2 py-1 text-xs" : "min-h-11 px-3 sm:px-4 sm:py-1.5"
          } ${
            value === opt.value
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
