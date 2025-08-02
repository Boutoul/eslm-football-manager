# ESLM - Football Team Management App

Application complète de gestion d'équipe de football pour le club ESLM.

## Fonctionnalités

- ✅ Gestion des joueurs avec système de notation détaillé
- ✅ Composition d'équipes intelligente avec priorités par poste
- ✅ Génération automatique de 2 équipes équilibrées (A & B)
- ✅ Interface responsive pour mobile et desktop
- ✅ Système de pénalités pour joueurs hors poste
- ✅ Suivi des présences et organisation par colonnes de poste
- ✅ Formations tactiques (4-4-2, 4-3-3, 3-5-2, 4-5-1)

## Stack Technique

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Base de données**: PostgreSQL + Drizzle ORM
- **Validation**: Zod schemas
- **Build**: Vite

## Installation locale

```bash
npm install
npm run db:push  # Configure la base de données
npm run dev      # Lance l'application
```

## Déploiement

Voir `DEPLOYMENT.md` pour les instructions complètes de migration vers GitHub/Vercel.

## Structure du projet

```
├── client/src/          # Frontend React
├── server/             # Backend Express
├── shared/             # Types et schémas partagés
└── package.json        # Dépendances
```

Développé avec ❤️ pour ESLM