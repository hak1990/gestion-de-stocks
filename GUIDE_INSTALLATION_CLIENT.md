# 📦 Guide d'Installation - Gestion de Stocks

Ce guide explique comment installer et utiliser l'application de gestion de stocks sur l'ordinateur de votre client.

---

## 🎯 Deux Options Disponibles

Vous avez **2 façons** d'installer l'application selon les besoins du client :

### ✅ Option A : Application de Bureau (RECOMMANDÉ)
**Avantages :**
- ✨ Installation comme un logiciel normal (Word, Excel, etc.)
- 🖱️ Double-clic pour démarrer
- 📱 Icône sur le bureau
- 🚀 Plus professionnel
- 💼 Parfait pour vendre à des clients

**Inconvénients :**
- 📦 Fichier d'installation plus gros (~200 MB)
- ⏱️ Première installation plus longue

### ✅ Option B : Script de Démarrage Simple
**Avantages :**
- ⚡ Rapide à mettre en place
- 📁 Pas d'installation lourde
- 🔧 Facile à modifier/débugger

**Inconvénients :**
- 🖥️ Nécessite Node.js installé
- 👨‍💻 Un peu moins "professionnel"
- 📝 Client voit une fenêtre de terminal

---

## 🔷 OPTION A : Installation Application de Bureau

### 📋 Prérequis pour VOUS (développeur)

Avant de créer l'installateur pour votre client :

1. **Node.js** installé sur votre ordinateur
2. Les fichiers du projet

### 🏗️ Étape 1 : Créer l'installateur

Dans le dossier du projet, exécutez :

#### Pour Windows :
```bash
npm run dist-win
```
Cela créera un fichier : `dist/Gestion de Stocks Setup 1.0.0.exe`

#### Pour macOS :
```bash
npm run dist-mac
```
Cela créera un fichier : `dist/Gestion de Stocks-1.0.0.dmg`

#### Pour Linux :
```bash
npm run dist-linux
```
Cela créera un fichier : `dist/Gestion de Stocks-1.0.0.AppImage`

⏱️ **Temps d'attente** : 5-10 minutes selon votre ordinateur

### 📦 Étape 2 : Donner l'installateur au client

1. Allez dans le dossier `dist/`
2. Copiez le fichier d'installation sur une clé USB ou envoyez-le par email/WeTransfer
3. Le client doit juste **double-cliquer** sur le fichier pour installer

### 🖥️ Étape 3 : Installation chez le client (Windows)

1. Double-clic sur `Gestion de Stocks Setup 1.0.0.exe`
2. Cliquer sur "Suivant"
3. Choisir le dossier d'installation (ou laisser par défaut)
4. Cliquer sur "Installer"
5. Une fois terminé, une icône "Gestion de Stocks" apparaît sur le bureau
6. **Double-cliquer sur l'icône** pour lancer l'application

✨ **C'est tout !** Le client peut maintenant utiliser l'application comme n'importe quel logiciel.

### 🍎 Étape 3 : Installation chez le client (macOS)

1. Double-clic sur `Gestion de Stocks-1.0.0.dmg`
2. Glisser l'icône "Gestion de Stocks" dans le dossier "Applications"
3. Ouvrir le dossier Applications
4. Double-clic sur "Gestion de Stocks"
5. Si macOS bloque l'ouverture :
   - Aller dans **Préférences Système** → **Sécurité et confidentialité**
   - Cliquer sur "Ouvrir quand même"

---

## 🔷 OPTION B : Script de Démarrage Simple

### 📋 Prérequis

Le client doit installer **Node.js** sur son ordinateur :
1. Aller sur https://nodejs.org
2. Télécharger la version "LTS" (recommandée)
3. Installer en suivant les instructions

### 📦 Étape 1 : Copier le projet

1. Copiez tout le dossier du projet sur l'ordinateur du client
2. Placez-le dans un endroit facile d'accès (ex: `C:\GestionDeStocks` sur Windows)

### 🚀 Étape 2 : Première utilisation

#### Sur Windows :
1. Double-clic sur le fichier **`Demarrer-Windows.bat`**
2. La première fois, il va installer les dépendances (5-10 minutes)
3. L'application s'ouvrira automatiquement dans le navigateur

#### Sur macOS :
1. Double-clic sur le fichier **`Demarrer-Mac.command`**
2. Si macOS bloque, faire clic droit → "Ouvrir"
3. La première fois, il va installer les dépendances (5-10 minutes)
4. L'application s'ouvrira automatiquement dans le navigateur

### 📝 Utilisation quotidienne

Pour utiliser l'application chaque jour :
1. Double-clic sur `Demarrer-Windows.bat` (Windows) ou `Demarrar-Mac.command` (Mac)
2. Attendre 10-20 secondes
3. L'application s'ouvre dans le navigateur
4. **⚠️ NE PAS FERMER** la fenêtre noire (terminal) tant qu'on utilise l'application
5. Pour arrêter : Fermer le navigateur puis fermer la fenêtre noire

---

## 🆘 Problèmes Courants et Solutions

### ❌ "Node.js n'est pas installé" (Option B)
**Solution :** Installer Node.js depuis https://nodejs.org

### ❌ "L'application ne s'ouvre pas" (Option A)
**Solution Windows :**
- Clic droit sur l'application → "Exécuter en tant qu'administrateur"
- Ou désactiver temporairement l'antivirus

**Solution macOS :**
- Préférences Système → Sécurité → "Ouvrir quand même"

### ❌ "Erreur de port déjà utilisé"
**Solution :**
- Redémarrer l'ordinateur
- Ou ouvrir le Gestionnaire des tâches et arrêter les processus Node.js

### ❌ "La base de données ne fonctionne pas"
**Solution :**
- Supprimer le fichier `prisma/dev.db`
- Relancer l'application

---

## 💰 Conseils pour la Vente

### Prix suggéré selon l'option choisie :

**Option A (Application de Bureau) :**
- 🥇 **Licence unique** : 500€ - 1000€
- 🏢 **Support inclus 1 an** : +200€
- 🔄 **Mises à jour** : 50€/an

**Option B (Script Simple) :**
- 🥈 **Licence unique** : 300€ - 600€
- 🏢 **Support inclus 1 an** : +150€
- 🔄 **Mises à jour** : 30€/an

### 📋 Ce que vous fournissez :

1. ✅ L'application complète
2. ✅ Installation et configuration initiale
3. ✅ Formation de 2h pour le personnel
4. ✅ Documentation utilisateur
5. ✅ Support technique (selon formule choisie)

### 🎁 Services additionnels (facturation en plus) :

- 📊 Rapports personnalisés : 100€
- 🎨 Logo et couleurs personnalisées : 150€
- 📱 Version mobile (future) : À définir
- 🌐 Hébergement en ligne : 20€/mois
- 💾 Sauvegardes automatiques cloud : 15€/mois

---

## 📞 Support Technique

Pour toute question ou problème :

**Développeur :** Hakim Bachabi
**Email :** hakim.bachabi@gmail.com

---

## 📝 Checklist de Livraison

Avant de livrer l'application à un client, vérifiez :

- [ ] L'installateur fonctionne sur un ordinateur test
- [ ] La base de données se crée correctement
- [ ] Toutes les fonctionnalités sont testées
- [ ] Le fichier `.env` est configuré (authentification Clerk)
- [ ] Documentation fournie au client
- [ ] Formation planifiée avec le client
- [ ] Contrat de licence signé
- [ ] Premier paiement reçu

---

## 🔄 Mises à Jour Futures

Pour mettre à jour l'application chez un client :

**Option A :**
- Créer un nouvel installateur avec `npm run dist-win` ou `dist-mac`
- L'envoyer au client
- Il installe par-dessus l'ancienne version
- Les données sont conservées

**Option B :**
- Envoyer le nouveau dossier
- Le client remplace l'ancien dossier (en gardant le fichier `prisma/dev.db`)
- Double-clic sur le script de démarrage

---

## ⭐ Personnalisation pour Chaque Client

Avant de vendre, vous pouvez personnaliser :

1. **Logo de l'entreprise** → Remplacer `public/logo.png`
2. **Nom de l'application** → Modifier `package.json` : `"productName"`
3. **Couleurs** → Modifier `tailwind.config.js`
4. **Nom de la base de données** → Modifier `.env` : `DATABASE_URL`

---

**🎉 Félicitations ! Vous êtes prêt à vendre votre application !**
