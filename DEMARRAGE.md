# 🌟 TwinFlameUnicity — Guide de démarrage

## 1. Installer les dépendances

```bash
npm install
```

## 2. Configurer les variables d'environnement

Le fichier `.env.local` est déjà rempli avec tes clés Supabase :
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓

## 3. Initialiser la base de données Supabase

1. Va dans ton projet Supabase → **SQL Editor**
2. Copie-colle tout le contenu de `supabase/schema.sql`
3. Exécute le script

## 4. Créer le compte Admin

1. Dans Supabase → **Authentication → Users** → "Invite user"
2. Email : `kar.giga@gmail.com`
3. Ou dans le SQL Editor :
   ```sql
   UPDATE public.profiles
   SET role = 'admin', status = 'active'
   WHERE email = 'kar.giga@gmail.com';
   ```

## 5. Lancer en développement

```bash
npm run dev
```

→ Ouvre http://localhost:3000/fr

## 6. Structure des URLs

| Page | FR | AR |
|------|----|----|
| Accueil | /fr | /ar |
| Blog | /fr/blog | /ar/مدونة |
| Article | /fr/blog/[slug] | /ar/مدونة/[slug] |
| Connexion | /fr/connexion | /ar/تسجيل-دخول |
| Admin | /fr/admin | /ar/admin |

## 7. Déploiement Vercel

```bash
vercel --prod
```

Ajouter les variables d'environnement dans le dashboard Vercel.

---

### Stack complète
- **Next.js 15** + App Router + Server Actions
- **React 19** + TypeScript strict
- **Supabase** (Auth + PostgreSQL + Storage + RLS)
- **TailwindCSS** + Shadcn/UI
- **Framer Motion** (animations cinématiques)
- **TipTap** (éditeur WYSIWYG → HTML)
- **next-intl** (i18n FR/AR + RTL)
- **Tanstack Query** (data fetching)
- **Zod** + **React Hook Form** (validation)
