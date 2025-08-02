# Scripts de migration ESLM

## Scripts package.json importants à conserver

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Configuration Vercel (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": null,
  "outputDirectory": "dist"
}
```

## Variables d'environnement requises

### Production (.env)
```
DATABASE_URL=postgresql://username:password@hostname:port/database
NODE_ENV=production
```

### Development (.env.local)
```
DATABASE_URL=postgresql://localhost:5432/eslm_dev
NODE_ENV=development
```