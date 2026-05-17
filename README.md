# Objectif Prime — Web

Application web de suivi de perte de poids avec groupes privés entre amis.

**Stack** : Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Auth) · Open Food Facts.

## Fonctionnalités MVP

- Inscription / connexion par email + mot de passe
- Profil onboarding (taille, poids, âge, objectif, date cible, objectif pas)
- Tableau de bord quotidien : poids, calories ingérées, dépensées, bilan, pas
- Suivi du poids avec graphique d'évolution
- Journal alimentaire avec recherche Open Food Facts
- Activités sportives avec estimation calories
- Saisie manuelle des pas (à reporter depuis l'app Santé du téléphone)
- Groupes privés avec code d'invitation et classement entre amis

## Setup

### 1. Créer le projet Supabase

1. Va sur https://supabase.com et crée un nouveau projet (région Europe recommandée).
2. Dans **SQL Editor** → New query → colle le contenu de [`supabase/schema.sql`](supabase/schema.sql) → Run.
3. Dans **Authentication → Providers → Email** : active le provider. Pour le développement, désactive « Confirm email » sinon les tests demanderont une confirmation par mail.
4. Dans **Settings → API** : copie `URL` et `anon public key`.

### 2. Variables d'environnement

```bash
cp .env.local.example .env.local
```

Édite `.env.local` avec les valeurs récupérées :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Lancer en local

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000.

## Déploiement sur Vercel

1. Pousse le code sur GitHub :
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin git@github.com:<ton-pseudo>/objectif-prime.git
   git push -u origin main
   ```

2. Va sur https://vercel.com, **Add New… → Project**, importe le repo.

3. Dans les paramètres du projet Vercel, ajoute les deux variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Clique **Deploy**. Tu obtiens une URL `https://objectif-prime-xxx.vercel.app` que tu peux partager.

5. Dans Supabase → **Authentication → URL Configuration** : ajoute ton URL Vercel à `Site URL` et `Redirect URLs` pour que les emails (reset mot de passe, etc.) pointent au bon endroit.

## Architecture

```
src/
  app/
    layout.tsx, page.tsx          # racine + landing
    login/, signup/               # auth (Server Actions)
    onboarding/                   # 1er parcours
    (app)/                        # routes protégées (nav + check profile)
      layout.tsx                  # vérifie session + onboarding
      dashboard/                  # résumé du jour
      weight/                     # pesées + graphique recharts
      food/                       # recherche OFF + journal
      activity/                   # sport + estimation calories
      steps/                      # saisie pas manuelle
      groups/                     # liste + création + jointure
      groups/[id]/                # leaderboard du groupe
      profile/                    # édition objectifs
    api/logout/                   # signOut
  components/
    Nav.tsx, WeightChart.tsx
  lib/
    types.ts                      # types DB
    openfoodfacts.ts              # client OFF (search + barcode)
    utils.ts                      # formats, BMR, MET sport
    supabase/
      client.ts                   # browser
      server.ts                   # RSC + Server Actions
      proxy.ts                    # auth middleware
  proxy.ts                        # racine Next.js 16 (ex-middleware.ts)
supabase/
  schema.sql                      # tables, RLS, trigger profile
```

## Notes

- **Pas / activité depuis Santé iPhone** : pas d'accès direct depuis une web app (HealthKit nécessite une app iOS native). Saisie manuelle uniquement. Pour intégrer plus tard : créer un companion iOS qui pushe vers `health_snapshots`.
- **Sécurité** : RLS activé sur toutes les tables. Un user ne lit ses logs que pour lui-même et les membres de ses groupes. L'`anon key` est publique et sans danger.
- **Coût** : Supabase free tier (~50k MAU) + Vercel hobby = 0 €.

## Évolutions possibles

- Page rejoindre par URL (`/?code=ABC123` qui pré-remplit le code après signup)
- Notifications email quotidiennes (« tu as oublié ta pesée »)
- Vue historique des bilans énergétiques (graphique kcal in vs out)
- Photos de progression
- App mobile native (existe déjà en Expo dans `/Users/thomaks/DEV/ObjectifPrime`)
