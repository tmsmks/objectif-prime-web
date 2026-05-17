"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/utils";

const TABS = [
  { href: "/groups", label: "Groupe", icon: "👥" },
  { href: "/dashboard", label: "Tableau", icon: "📊" },
  { href: "/food", label: "Repas", icon: "🍽️" },
  { href: "/activity", label: "Sport", icon: "🏃" },
  { href: "/weight", label: "Poids", icon: "⚖️" },
  { href: "/steps", label: "Pas", icon: "👟" },
  { href: "/profile", label: "Profil", icon: "👤" },
] as const;

export function Nav({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop header */}
      <header className="sticky top-0 z-10 hidden border-b border-border bg-card/80 backdrop-blur sm:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/groups" className="text-lg font-bold">
            Objectif <span className="text-primary">Prime</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">@{username}</span>
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

      {/* Mobile top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur sm:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/groups" className="text-lg font-bold">
            Objectif <span className="text-primary">Prime</span>
          </Link>
          <form action="/api/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur sm:hidden">
        <div className="flex justify-around px-1 py-1.5">
          {TABS.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={classNames(
                  "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium",
                  active ? "text-primary" : "text-muted",
                )}
              >
                <span className="text-lg leading-none">{tab.icon}</span>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
