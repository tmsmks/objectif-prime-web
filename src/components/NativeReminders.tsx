"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

const DAILY_REMINDER_ID = 1;

/**
 * Composant invisible : dans l'app native iOS, programme un rappel quotidien
 * (notification locale) encourageant à bouger / saisir sa journée. Aucune
 * infrastructure serveur requise — la notification est planifiée sur l'appareil.
 * Ne fait rien sur le web.
 */
export function NativeReminders() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    (async () => {
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications");

        const perm = await LocalNotifications.requestPermissions();
        if (perm.display !== "granted") return;

        // Rappel quotidien à 19h00 (idempotent : même id => remplacé).
        await LocalNotifications.schedule({
          notifications: [
            {
              id: DAILY_REMINDER_ID,
              title: "Objectif Prime",
              body: "Pense à bouger aujourd'hui 💪 Vérifie tes pas et ta journée.",
              schedule: { on: { hour: 19, minute: 0 }, allowWhileIdle: true },
            },
          ],
        });
      } catch (e) {
        console.warn("[NativeReminders]", e);
      }
    })();
  }, []);

  return null;
}
