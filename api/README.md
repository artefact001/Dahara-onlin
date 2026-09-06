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

## 5. Endpoints disponibles (68 routes)

**Publics**
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/teachers` (filtres `?subject=&city=&level=`), `GET /api/teachers/{slug}`
- `POST /api/contact`, `POST /api/teacher-applications`
- `GET /api/library/books`, `GET /api/library/books/{slug}`
- `GET /api/quran/surahs`, `GET /api/quran/surahs/{number}?translation=&reciter=`
- `GET /api/gamification/leaderboard`

**Authentifiés** (`Authorization: Bearer <token>`)
- Profil, parcours, objectifs, rappels de prière, suivi de sourates — inchangé
- `GET/POST /api/bookings`, `PATCH /api/bookings/{id}`, `GET /api/bookings/{id}/room` (salle Jitsi)
- `GET /api/library/favorites`, `POST /api/library/books/{id}/favorite`, `GET/PUT /api/library/progress`
- `GET/POST /api/quran/bookmarks`, `DELETE /api/quran/bookmarks/{id}`, `GET/PUT /api/quran/last-read`
- **Messagerie** : `GET/POST /api/conversations`, `GET/POST /api/conversations/{id}/messages`
- **Devoirs** : `GET/POST /api/assignments`, `POST /api/assignments/{id}/submit`, `PATCH /api/assignment-submissions/{id}/grade`
- **Espace professeur** : `GET /api/teacher/students`, `/planning`, `/revenue`, `GET/POST/PATCH/DELETE /api/teacher/availability`
- **Gamification** : `GET /api/gamification/me` (points, série, badges)
- **Famille** : `GET/POST /api/family/children`, `POST /api/family/link`, `GET /api/family/children/{id}/progress`
- `POST /api/reports`

**Admin** (`role:admin`)
- `GET /api/admin/stats`
- `GET /api/admin/teacher-applications`, `PATCH /api/admin/teacher-profiles/{id}/verify`
- `GET /api/admin/reports`, `PATCH /api/admin/reports/{id}`
- `PATCH /api/admin/users/{id}/ban`, `PATCH /api/admin/users/{id}/unban`

## 6. Tâche planifiée (relances automatiques)

`php artisan dahara:send-reengagement-reminders` envoie un e-mail aux élèves inactifs
depuis 3 jours (configurable via `--days=`). Elle est déjà planifiée quotidiennement à
18h dans `routes/console.php`, mais **le planificateur Laravel doit être appelé par un
vrai cron** sur ton serveur :

```
* * * * * cd /chemin/vers/api && php artisan schedule:run >> /dev/null 2>&1
```

## 7. Devoirs — stockage des fichiers audio

Les dépôts audio sont stockés sur le disque `local` (`storage/app/private`), pas de
service externe requis pour démarrer. Si le volume grandit, bascule vers un disque S3
(ajoute `league/flysystem-aws-s3-v3` via Composer et un disque `s3` dans
`config/filesystems.php`).

## 8. Ce qui est couvert vs. ce qu'il reste à faire

✅ Parité Supabase (auth, profil, objectifs, parcours, mémorisation, prières).
✅ Annuaire professeurs, réservation avec agenda réel, bibliothèque, lecteur de Coran.
✅ Messagerie élève↔professeur avec notification e-mail, devoirs (dépôt + correction).
✅ Espace professeur complet (élèves, planning, revenus, gestion d'agenda).
✅ Gamification (points, séries, badges, classement, relances automatiques).
✅ Comptes famille (enfant géré ou lien vers un compte existant).
✅ Administration (statistiques, modération, signalements, bannissement).
✅ PWA installable (manifest + service worker côté frontend).

❌ Volontairement pas fait — bloqué par des ressources externes que toi seul peux créer :
- **Visioconférence réelle** : `room_name`/`recording_url` sont prêts dans `bookings`,
  mais il faut déployer un serveur **Jitsi auto-hébergé** et brancher son SDK côté
  frontend (widget `JitsiMeetExternalAPI`). Le domaine se configure via `JITSI_DOMAIN`.
- **Paiements Wave + Orange Money** : les clés `WAVE_API_KEY`/`ORANGE_MONEY_API_KEY`
  sont prévues dans `.env.example` et `config/services.php`, mais aucun appel réel n'est
  fait — il faut créer les comptes marchands, obtenir les clés, puis écrire les
  contrôleurs de paiement (webhooks d'encaissement, génération de factures PDF).

⚠️ Icônes PWA : seul `favicon.ico` est référencé dans `manifest.json`. Pour une
installabilité optimale sur tous les appareils, ajoute de vraies icônes 192×192 et
512×512 (PNG) et mets à jour `public/manifest.json`.

## 9. Hébergement

Laravel a besoin d'un environnement PHP (pas de Cloudflare Workers) : un VPS, Laravel
Forge, Laravel Cloud, ou un hébergement mutualisé PHP 8.2+/MySQL. Le frontend, lui, peut
rester sur Cloudflare Workers et simplement appeler cette API en HTTPS (CORS déjà
configuré dans `config/cors.php`).
