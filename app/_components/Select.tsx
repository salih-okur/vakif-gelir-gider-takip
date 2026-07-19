"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  className?: string;
  accentColor?: "emerald" | "rose";
}

export default function Select<T extends string>({
  value,
  onChange,
  options,
  className = "",
  accentColor = "emerald",
}: SelectProps<T>) {
  const selected = options.find((opt) => opt.value === value);

  return (
    <RadixSelect.Root value={value} onValueChange={(v) => onChange(v as T)}>
      <RadixSelect.Trigger
        className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none data-[placeholder]:text-zinc-400 data-[state=open]:border-emerald-500 data-[state=open]:ring-1 data-[state=open]:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 ${className}`}
      >
        <RadixSelect.Value>{selected?.label}</RadixSelect.Value>
        <RadixSelect.Icon>
          <ChevronDown size={16} className="text-zinc-400" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-50 max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className={`relative flex min-h-10 cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-zinc-700 outline-none data-[highlighted]:bg-zinc-100 data-[state=checked]:font-medium dark:text-zinc-200 dark:data-[highlighted]:bg-zinc-800 ${
                  accentColor === "emerald"
                    ? "data-[state=checked]:text-emerald-700 dark:data-[state=checked]:text-emerald-400"
                    : "data-[state=checked]:text-rose-700 dark:data-[state=checked]:text-rose-400"
                }`}
              >
                <RadixSelect.ItemIndicator className="absolute left-2.5 inline-flex items-center">
                  <Check size={14} />
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
