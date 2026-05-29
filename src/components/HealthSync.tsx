"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

// Date locale (timezone de l'appareil) au format YYYY-MM-DD.
function localDateISO(d = new Date()): string {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

/**
 * Composant invisible monté dans le layout authentifié. Quand l'app tourne
 * dans la coquille native iOS (Capacitor), il lit le total de pas du jour
 * depuis Apple Santé et l'envoie à /api/steps/sync. Sur le web classique
 * (navigateur), il ne fait rien.
 */
export function HealthSync() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;

    (async () => {
      try {
        const { Health } = await import("capacitor-health");

        const { available } = await Health.isHealthAvailable();
        if (!available) return;

        await Health.requestHealthPermissions({ permissions: ["READ_STEPS"] });

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();

        const res = await Health.queryAggregated({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          dataType: "steps",
          bucket: "day",
        });

        const steps = Math.round(
          (res.aggregatedData ?? []).reduce((sum, s) => sum + (s.value ?? 0), 0),
        );

        if (cancelled || steps <= 0) return;

        const r = await fetch("/api/steps/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ steps, date: localDateISO() }),
        });

        if (!cancelled && r.ok) router.refresh();
      } catch (e) {
        // Silencieux : la saisie manuelle reste disponible en secours.
        console.warn("[HealthSync]", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
