import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.objectifprime.app",
  appName: "Objectif Prime",
  // Placeholder local : l'app charge en réalité le site distant ci-dessous.
  webDir: "mobile/www",
  server: {
    // Site Next.js déployé sur Vercel. L'app native est une coquille
    // qui affiche ce site dans une WebView et y ajoute l'accès natif
    // (Apple Santé, notifications…).
    url: "https://objectif-prime-web.vercel.app",
    // Pour tester contre ton serveur de dev local sur un iPhone réel,
    // remplace temporairement par "http://<ip-de-ton-mac>:3000" et
    // ajoute cleartext: true.
    allowNavigation: ["objectif-prime-web.vercel.app", "*.supabase.co"],
  },
  ios: {
    contentInset: "always",
  },
};

export default config;
