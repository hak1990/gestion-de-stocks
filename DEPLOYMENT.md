# 🚀 Guide de Déploiement - Gestion de Stocks

## Prérequis

Avant de commencer, assurez-vous d'avoir :
- Un compte GitHub (https://github.com)
- Un compte Vercel (https://vercel.com) - connectez-vous avec GitHub
- Un compte Clerk (https://clerk.com) - pour l'authentication

---

## Étape 1 : Initialiser Git et Pousser sur GitHub

### 1.1 Initialiser Git localement

```bash
cd /Users/bachabihakim/Documents/Dossier_Dev/gestion_de_stocks
git init
git add .
git commit -m "Initial commit - Application de gestion de stocks"
```

### 1.2 Créer un dépôt GitHub

1. Allez sur https://github.com/new
2. Nom du repository : `gestion-de-stocks`
3. Description : "Application web de gestion de stocks d'inventaire"
4. **NE PAS** initialiser avec README, .gitignore ou license
5. Cliquez sur "Create repository"

### 1.3 Pousser le code sur GitHub

```bash
git remote add origin https://github.com/VOTRE_USERNAME/gestion-de-stocks.git
git branch -M main
git push -u origin main
```

---

## Étape 2 : Configurer Clerk pour la Production

### 2.1 Créer un nouveau projet Clerk

1. Allez sur https://dashboard.clerk.com
2. Cliquez sur "+ Create application"
3. Nom : "Gestion de Stocks - Production"
4. Sélectionnez : Email + Password
5. Cliquez sur "Create application"

### 2.2 Récupérer les clés API

Dans le dashboard Clerk :
1. Allez dans "API Keys"
2. Copiez :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

⚠️ **Gardez ces clés en sécurité - vous en aurez besoin pour Vercel**

---

## Étape 3 : Déployer sur Vercel

### 3.1 Importer le projet

1. Allez sur https://vercel.com
2. Cliquez sur "Add New" → "Project"
3. Importez votre repository GitHub `gestion-de-stocks`
4. Cliquez sur "Import"

### 3.2 Configurer le projet

**Framework Preset:** Next.js (détecté automatiquement)
**Root Directory:** `./`
**Build Command:** `npm run build` ou `next build`
**Output Directory:** `.next`

### 3.3 Ajouter la base de données PostgreSQL

**AVANT de cliquer sur Deploy :**

1. Dans Vercel, cliquez sur l'onglet "Storage"
2. Cliquez sur "Create Database"
3. Sélectionnez "Postgres" (Vercel Postgres)
4. Nommez-la : `gestion-stocks-db`
5. Région : Choisissez la plus proche (ex: Frankfurt)
6. Cliquez sur "Create"

Vercel ajoutera automatiquement la variable `DATABASE_URL` à votre projet.

### 3.4 Configurer les Variables d'Environnement

Dans Vercel, allez dans "Settings" → "Environment Variables" et ajoutez :

| Nom de la Variable | Valeur | Environnement |
|-------------------|---------|---------------|
| `DATABASE_URL` | *(Déjà ajouté automatiquement par Vercel Postgres)* | Production |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_xxxxx` (depuis Clerk) | Production |
| `CLERK_SECRET_KEY` | `sk_live_xxxxx` (depuis Clerk) | Production |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | Production |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | Production |

**Important :** Utilisez les clés **LIVE** (production) de Clerk, pas les clés **TEST**.

### 3.5 Déployer

1. Cliquez sur "Deploy"
2. Attendez que le build se termine (~2-3 minutes)
3. Une fois terminé, vous verrez : "🎉 Your project has been deployed"

---

## Étape 4 : Configurer Clerk avec votre domaine Vercel

### 4.1 Récupérer l'URL de production

Après le déploiement, Vercel vous donnera une URL comme :
```
https://gestion-de-stocks-xyz123.vercel.app
```

### 4.2 Ajouter l'URL à Clerk

1. Retournez sur le dashboard Clerk
2. Allez dans "Settings" → "Domains"
3. Dans "Authorized domains", ajoutez :
   - Votre URL Vercel : `gestion-de-stocks-xyz123.vercel.app`
4. Cliquez sur "Save"

### 4.3 Configurer les URLs de redirection Clerk

Dans Clerk, allez dans "Paths" et configurez :
- Sign-in URL : `https://gestion-de-stocks-xyz123.vercel.app/sign-in`
- Sign-up URL : `https://gestion-de-stocks-xyz123.vercel.app/sign-up`
- After sign-in URL : `https://gestion-de-stocks-xyz123.vercel.app/`
- After sign-up URL : `https://gestion-de-stocks-xyz123.vercel.app/`

---

## Étape 5 : Migrer la Base de Données

### 5.1 Exécuter les migrations Prisma

Vercel exécute automatiquement `prisma generate` pendant le build.

Pour créer les tables en production, ajoutez un script de build personnalisé :

**Option A : Via la Console Vercel (Recommandé)**

1. Dans Vercel, allez dans votre projet
2. Settings → General → Build & Development Settings
3. Build Command : changez en `npx prisma migrate deploy && next build`
4. Redéployez le projet

**Option B : Localement avec l'URL de production**

```bash
# Récupérez DATABASE_URL depuis Vercel (Settings → Environment Variables)
export DATABASE_URL="postgresql://..."
npx prisma migrate dev --name init
```

---

## Étape 6 : Tester l'Application

1. Ouvrez votre URL Vercel dans un navigateur
2. Créez un compte avec Sign Up
3. Testez les fonctionnalités :
   - ✅ Créer une catégorie
   - ✅ Ajouter un produit
   - ✅ Alimenter le stock
   - ✅ Retirer du stock
   - ✅ Voir les transactions

---

## 🎉 Félicitations !

Votre application est maintenant en ligne sur :
```
https://gestion-de-stocks-xyz123.vercel.app
```

---

## 📝 Notes Importantes

### Upload d'Images
⚠️ **Important :** Les images téléchargées dans `/public/uploads` ne persisteront pas sur Vercel (filesystem éphémère).

**Solutions :**
1. **Cloudinary (Gratuit)** - Service d'hébergement d'images
2. **Vercel Blob Storage** - Stockage de fichiers Vercel
3. **AWS S3** - Solution professionnelle

### Domaine Personnalisé

Pour utiliser votre propre domaine (ex: `gestion-stocks.com`) :
1. Dans Vercel → Settings → Domains
2. Ajoutez votre domaine
3. Configurez les DNS selon les instructions

### Monitoring

Vercel offre :
- 📊 Analytics (usage, performance)
- 🐛 Error tracking
- 📈 Web Vitals monitoring

Activez-les dans Settings → Analytics

---

## 🔄 Mises à Jour Futures

Pour déployer de nouvelles modifications :

```bash
git add .
git commit -m "Description des changements"
git push
```

Vercel redéploiera automatiquement ! 🚀

---

## 🆘 Dépannage

### Erreur "Module not found"
→ Vérifiez que toutes les dépendances sont dans `package.json`
→ Relancez le build : Vercel → Deployments → cliquez sur ⋯ → Redeploy

### Erreur de connexion à la base de données
→ Vérifiez que `DATABASE_URL` est bien défini
→ Vérifiez que les migrations ont été exécutées

### Erreur Clerk "Invalid API Key"
→ Utilisez les clés **LIVE** (pk_live_ et sk_live_)
→ Vérifiez que le domaine Vercel est autorisé dans Clerk

---

## 📞 Support

- Vercel Docs : https://vercel.com/docs
- Clerk Docs : https://clerk.com/docs
- Next.js Docs : https://nextjs.org/docs
- Prisma Docs : https://www.prisma.io/docs
