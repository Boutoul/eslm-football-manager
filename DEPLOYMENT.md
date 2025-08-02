# Guide de Déploiement ESLM

## Télécharger le code depuis Replit

### Option 1 : Téléchargement direct
1. Cliquez sur les 3 points (...) dans le panneau de fichiers
2. Sélectionnez "Download as zip"
3. Extrayez le fichier ZIP sur votre ordinateur

### Option 2 : Git (recommandé)
```bash
# Cloner le repository
git clone <votre-replit-url>.git
cd votre-projet-eslm
```

## Migration vers GitHub/Vercel

### 1. Créer un repository GitHub
1. Allez sur github.com
2. Créez un nouveau repository "eslm-football-manager"
3. Uploadez votre code ou utilisez git push

### 2. Configuration de la base de données

#### Option A : Neon (PostgreSQL gratuit - recommandé)
1. Allez sur neon.tech
2. Créez un compte gratuit
3. Créez une nouvelle base de données
4. Copiez la DATABASE_URL fournie

#### Option B : Supabase (PostgreSQL + authentification)
1. Allez sur supabase.com
2. Créez un projet gratuit
3. Récupérez l'URL de connexion PostgreSQL

#### Option C : PlanetScale (MySQL gratuit)
1. Allez sur planetscale.com
2. Créez une base de données gratuite
3. Adaptez le code pour MySQL (changement mineur)

### 3. Déploiement sur Vercel

#### Variables d'environnement à configurer :
```
DATABASE_URL=votre_url_de_base_de_donnees
NODE_ENV=production
```

#### Étapes :
1. Allez sur vercel.com
2. Connectez votre repository GitHub
3. Configurez les variables d'environnement
4. Déployez !

### 4. Configuration post-déploiement

#### Initialiser la base de données :
```bash
# En local ou dans un terminal Vercel
npm run db:push
```

#### Structure des fichiers à conserver :
- Tous les fichiers du projet
- package.json avec toutes les dépendances
- drizzle.config.ts pour la base de données
- Variables d'environnement DATABASE_URL

## Coûts estimés

### Gratuit permanent :
- **Vercel** : Plan Hobby gratuit (projets personnels)
- **GitHub** : Repositories publics gratuits
- **Neon** : 0.5GB PostgreSQL gratuit
- **Supabase** : 500MB + 50k requêtes/mois
- **PlanetScale** : 5GB MySQL gratuit

### Limites des plans gratuits :
- Vercel : 100GB de bande passante/mois
- Neon : 0.5GB de stockage
- Supabase : 500MB de stockage

## Migration des données

Si vous avez des données de test dans Replit :
1. Exportez via l'interface admin de la base
2. Importez dans votre nouvelle base
3. Ou recréez manuellement (quelques joueurs seulement)

## Support technique

En cas de problème :
- Vérifiez les logs Vercel
- Testez la connexion base de données
- Consultez la documentation officielle des services