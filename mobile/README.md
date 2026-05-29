# Objectif Prime — App iOS (Capacitor)

L'app iOS est une **coquille native** qui affiche le site Next.js déployé sur
Vercel dans une WebView, et y ajoute l'accès natif à **Apple Santé** (lecture
automatique des pas).

```
App iOS (Capacitor)
 └─ WebView → https://objectif-prime-web.vercel.app   (ton code Next.js, inchangé)
 └─ Plugin HealthKit → lit les pas → POST /api/steps/sync → Supabase
```

## Architecture du comptage de pas

L'iPhone compte les pas en continu via son coprocesseur de mouvement. On ne lit
**pas** l'accéléromètre brut : on lit le total déjà calculé dans Apple Santé.

1. À l'ouverture d'une page authentifiée, [`HealthSync`](../src/components/HealthSync.tsx)
   détecte qu'on tourne dans l'app native (`Capacitor.isNativePlatform()`).
2. Il demande la permission `READ_STEPS`, lit les pas du jour via HealthKit.
3. Il envoie le total à [`/api/steps/sync`](../src/app/api/steps/sync/route.ts).
4. La route réutilise [`recordSteps`](../src/lib/steps.ts) — la même logique que
   la saisie manuelle — pour écrire dans `health_snapshots`.

Sur le web classique (navigateur), `HealthSync` ne fait rien : la saisie
manuelle reste disponible.

> ⚠️ La route `/api/steps/sync` et `HealthSync` doivent être **déployées en
> production** (Vercel sert l'URL chargée par l'app). Tant que cette branche
> n'est pas mergée sur `main`, la synchro auto ne fonctionnera pas sur l'app.

## Pré-requis (à faire une seule fois)

- **Xcode** installé (App Store) — pas seulement les Command Line Tools.
- Un **compte Apple Developer** (99 $/an) — obligatoire pour HealthKit et la
  publication App Store.
- HealthKit ne fonctionne **pas sur simulateur** : tester sur un iPhone réel.

## Workflow de dev

```bash
# 1. Pousser/synchroniser la config et les plugins vers le projet iOS
npm run cap:sync

# 2. Ouvrir le projet dans Xcode
npm run cap:open
```

Dans Xcode :

1. **Signing & Capabilities** → choisir ton *Team* (compte Apple Developer).
2. Vérifier que la capability **HealthKit** est présente (le fichier
   `App/App.entitlements` est déjà câblé). Si Xcode demande d'enregistrer la
   capability sur le portail développeur, accepter — ça active HealthKit pour
   l'App ID côté Apple.
3. Brancher l'iPhone, le sélectionner comme cible, puis **Run** (▶).
4. À la première synchro, iOS demandera l'accès à Santé → autoriser les pas.

## Pointer vers le serveur de dev local (optionnel)

Par défaut l'app charge la prod. Pour tester tes changements locaux sur
l'iPhone avant déploiement, édite [`capacitor.config.ts`](../capacitor.config.ts) :

```ts
server: {
  url: "http://192.168.x.x:3000", // IP de ton Mac sur le réseau
  cleartext: true,
}
```

Puis `npm run dev` sur le Mac, `npm run cap:sync`, et relance depuis Xcode.
(L'iPhone et le Mac doivent être sur le même Wi-Fi.)

## Publication App Store

- Soigner icône + écran de lancement (la valeur native HealthKit justifie la
  review face à la règle 4.2 « Minimum Functionality »).
- Archiver via Xcode → **Product → Archive** → distribuer vers App Store Connect.
- La review Apple demandera de décrire l'usage des données Santé.
