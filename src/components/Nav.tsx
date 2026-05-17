"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/utils";

const TABS = [
  { href: "/groups", label: "Mon groupe" },
  { href: "/dashboard", label: "Tableau" },
  { href: "/weight", label: "Poids" },
  { href: "/food", label: "Repas" },
  { href: "/activity", label: "Sport" },
  { href: "/steps", label: "Pas" },
  { href: "/profile", label: "Profil" },
] as const;

export function Nav({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/groups" className="text-lg font-bold">
          Objectif <span className="text-primary">Prime</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted sm:inline">@{username}</span>
          <form action="/api/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </div>
      <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 pb-2">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={classNames(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium",
                active
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-zinc-100",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
