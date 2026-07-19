"use client";

import {
  HandCoins,
  HeartHandshake,
  LayoutDashboard,
  ListOrdered,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Anasayfa", href: "/", icon: LayoutDashboard },
  { label: "Aidat", href: "/aidat", icon: HandCoins },
  { label: "Bağış", href: "/bagis", icon: HeartHandshake },
  { label: "İşlemler", href: "/islemler", icon: ListOrdered },
];

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Vakıf Takip
        </span>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 md:hidden"
          aria-label="Menüyü aç"
        >
          <Menu size={24} />
        </button>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-2xl dark:bg-zinc-900">
            <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-4 dark:border-zinc-800">
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Menü
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-12 w-12 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                aria-label="Menüyü kapat"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-3">
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                    isActive(href)
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
