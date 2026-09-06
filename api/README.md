# Dahara Online — API Laravel

Backend Laravel 11 + MySQL destiné à remplacer Supabase pour le projet **Dahara Online**.
Le frontend (TanStack Start, dépôt `my-digital-dahra`) reste inchangé mais devra appeler
cette API à la place de `@supabase/supabase-js`.

> ⚠️ Ce projet a été écrit en dehors d'un environnement avec accès à Packagist/Composer.
> Le code (migrations, modèles, contrôleurs, routes) est complet et vérifié syntaxiquement
> (`php -l`), mais **`composer install` n'a jamais été exécuté** — fais-le en premier chez toi.

## 1. Installation

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Édite `.env` :
- `DB_*` : accès à ta base MySQL
- `CORS_ALLOWED_ORIGINS` : l'URL du frontend déployé (ex: `https://dahara-online.com`)
- `SANCTUM_STATEFUL_DOMAINS` : laisse vide si tu utilises des tokens Bearer (recommandé, voir §4)

## 2. Base de données

```bash
php artisan migrate
php artisan db:seed          # crée les 3 professeurs de démo (Abdou, Aïcha, Moussa)
```

## 3. Lancer en local

```bash
php artisan serve            # http://localhost:8000
```

## 4. Authentification (Sanctum, tokens Bearer)

Le frontend et l'API vivant probablement sur deux domaines différents (frontend sur
Cloudflare Workers, API sur un hébergeur PHP), on utilise des **tokens Bearer** plutôt
que l'auth par cookie SPA de Sanctum (qui exige un domaine parent commun).

```
POST /api/auth/register  { full_name, email, password, password_confirmation, city, role }
POST /api/auth/login     { email, password }
  → { user, token }

Puis pour chaque requête authentifiée :
Authorization: Bearer <token>
```

Côté frontend, remplacer `src/integrations/supabase/client.ts` par un petit client HTTP
qui stocke le token (ex: dans un cookie httpOnly via une route serveur TanStack Start,
plus sûr qu'un simple localStorage) et l'attache à chaque appel `fetch`.

## 5. Endpoints disponibles

**Publics**
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/teachers` (filtres `?subject=&city=&level=`), `GET /api/teachers/{slug}`
- `POST /api/contact`
- `POST /api/teacher-applications`

**Authentifiés** (`Authorization: Bearer <token>`)
- `GET /api/auth/me`, `POST /api/auth/logout`
- `GET/PUT /api/profile`
- `GET /api/learning-paths`, `PATCH /api/path-steps/{id}`
- `GET/POST /api/goals`, `PATCH/DELETE /api/goals/{id}`
- `GET /api/prayer-reminders`, `PATCH /api/prayer-reminders/{id}`
- `GET /api/surah-progress`, `PATCH /api/surah-progress/{id}`, `POST /api/memorization-sessions`
- `GET/POST /api/bookings`, `PATCH /api/bookings/{id}` (confirmer/annuler)

**Admin** (`role:admin`)
- `GET /api/admin/teacher-applications`
- `PATCH /api/admin/teacher-profiles/{id}/verify`

## 6. Ce qui est couvert vs. ce qu'il reste à faire

✅ Parité complète avec l'existant Supabase (auth, profil, objectifs, parcours,
mémorisation, rappels de prière, suivi de sourates).
✅ Nouveau : annuaire de professeurs en base (fini le codage en dur), réservation de
séances avec créneaux, formulaire de contact et candidature enseignant qui persistent
réellement.

❌ Pas encore fait (volontairement, pour rester réaliste) : paiement (Wave/Orange Money),
visioconférence, envoi d'e-mails réel (le `TODO` est indiqué dans `ContactController`),
espace admin complet, gamification.

## 7. Hébergement

Laravel a besoin d'un environnement PHP (pas de Cloudflare Workers) : un VPS, Laravel
Forge, Laravel Cloud, ou un hébergement mutualisé PHP 8.2+/MySQL. Le frontend, lui, peut
rester sur Cloudflare Workers et simplement appeler cette API en HTTPS (CORS déjà
configuré dans `config/cors.php`).
