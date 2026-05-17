"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

const TABS = [
  { href: "/groups", label: "Groupe" },
  { href: "/dashboard", label: "Tableau" },
  { href: "/food", label: "Repas" },
  { href: "/activity", label: "Sport" },
  { href: "/weight", label: "Poids" },
  { href: "/steps", label: "Pas" },
  { href: "/profile", label: "Profil" },
];

export function Nav({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-zinc-200">
      {/* Row 1: logo + logout */}
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-12">
        <Logo size="sm" href="/groups" />
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-zinc-500">@{username}</span>
          <form action="/api/logout" method="post">
            <button
              type="submit"
              className="text-xs text-zinc-500 hover:text-zinc-800"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </div>

      {/* Row 2: tabs */}
      <div className="mx-auto max-w-5xl overflow-x-auto scrollbar-none">
        <div className="flex gap-0 px-4 min-w-max">
          {TABS.map((tab) => {
            const active =
              pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  active ? "text-emerald-600" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-emerald-600" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
