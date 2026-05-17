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

export function Nav({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        <Logo size="sm" href="/groups" />
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
                "flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium sm:text-sm",
                active
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-zinc-100",
              )}
            >
              <span className="sm:hidden">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
