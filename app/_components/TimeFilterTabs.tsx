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
}

export default function TimeFilterTabs({ value, onChange, options }: TimeFilterTabsProps) {
  const visibleOptions = options
    ? ALL_OPTIONS.filter((opt) => options.includes(opt.value))
    : ALL_OPTIONS;

  return (
    <div
      className="grid w-full gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm sm:inline-grid sm:w-auto dark:border-zinc-800 dark:bg-zinc-900"
      style={{ gridTemplateColumns: `repeat(${visibleOptions.length}, minmax(0, 1fr))` }}
    >
      {visibleOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`min-h-11 rounded-lg px-3 text-sm font-medium transition-colors sm:px-4 sm:py-1.5 ${
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
