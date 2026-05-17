"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const TABS = [
  { href: "/groups", label: "Groupe", icon: "👥" },
  { href: "/dashboard", label: "Tableau", icon: "📊" },
  { href: "/food", label: "Repas", icon: "🍽️" },
  { href: "/activity", label: "Sport", icon: "🏃" },
  { href: "/weight", label: "Poids", icon: "⚖️" },
  { href: "/steps", label: "Pas", icon: "👟" },
  { href: "/profile", label: "Profil", icon: "👤" },
] as const;

const MOBILE_TABS = [
  { href: "/groups", label: "Groupe", icon: "👥" },
  { href: "/dashboard", label: "Tableau", icon: "📊" },
  { href: "/food", label: "Repas", icon: "🍽️" },
  { href: "/activity", label: "Sport", icon: "🏃" },
  { href: "/profile", label: "Profil", icon: "👤" },
] as const;

export function Nav({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop header */}
      <header className="sticky top-0 z-10 hidden border-b border-border bg-card/80 backdrop-blur sm:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Logo size="sm" href="/groups" />
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
        <div className="flex items-center justify-between px-4 py-2.5">
          <Logo size="sm" href="/groups" />
          <div className="flex items-center gap-2">
            <Link
              href="/weight"
              className={classNames(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                pathname.startsWith("/weight") ? "bg-primary text-white" : "bg-zinc-100 text-foreground",
              )}
            >
              ⚖️ Poids
            </Link>
            <Link
              href="/steps"
              className={classNames(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                pathname.startsWith("/steps") ? "bg-primary text-white" : "bg-zinc-100 text-foreground",
              )}
            >
              👟 Pas
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar — 5 tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur sm:hidden">
        <div className="flex justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
          {MOBILE_TABS.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={classNames(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted",
                )}
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
