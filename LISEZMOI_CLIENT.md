# 🏪 Gestion de Stocks - Mode d'Emploi

## 🚀 Démarrage Rapide

### Sur Windows :
Double-cliquez sur **`Demarrer-Windows.bat`**

### Sur Mac :
Double-cliquez sur **`Demarrer-Mac.command`**

---

## ⚠️ IMPORTANT

**Ne fermez JAMAIS la fenêtre noire (terminal) tant que vous utilisez l'application !**

Cette fenêtre doit rester ouverte en arrière-plan.

---

## 📖 Comment utiliser l'application

### 1️⃣ Première connexion
- L'application s'ouvre automatiquement dans votre navigateur
- Créez un compte avec votre email
- Vous êtes prêt !

### 2️⃣ Ajouter des catégories
1. Cliquez sur "Catégories" dans le menu
2. Cliquez sur "Nouvelle Catégorie"
3. Remplissez le nom et la description
4. Validez

### 3️⃣ Ajouter des produits
1. Cliquez sur "Produits" dans le menu
2. Cliquez sur "Nouveau Produit"
3. Remplissez toutes les informations :
   - Nom du produit
   - Description
   - Prix
   - Quantité en stock
   - Unité (ex: pièce, kg, litre)
   - Catégorie
   - Photo (optionnelle)
4. Validez

### 4️⃣ Gérer le stock
**Entrée de stock (réception de marchandise) :**
1. Trouvez le produit
2. Cliquez sur le bouton vert "Entrée"
3. Indiquez la quantité reçue
4. Validez

**Sortie de stock (vente) :**
1. Trouvez le produit
2. Cliquez sur le bouton rouge "Sortie"
3. Indiquez la quantité vendue
4. Validez

### 5️⃣ Voir les statistiques
Retournez sur le tableau de bord pour voir :
- 📊 Nombre total de produits
- 📈 Valeur totale du stock
- ⚠️ Produits en rupture de stock
- 📉 Graphiques

---

## 🛑 Arrêter l'application

1. Fermez la fenêtre du navigateur
2. Fermez la fenêtre noire (terminal) en cliquant sur la croix
   - Ou appuyez sur `Ctrl+C` dans la fenêtre noire

---

## ❓ Problèmes Courants

### ❌ L'application ne démarre pas
**Solution :**
1. Vérifiez que Node.js est installé : https://nodejs.org
2. Redémarrez votre ordinateur
3. Réessayez

### ❌ "Port déjà utilisé"
**Solution :**
1. Fermez toutes les fenêtres noires (terminal)
2. Redémarrez votre ordinateur
3. Relancez l'application

### ❌ "Erreur de base de données"
**Solution :**
1. Fermez l'application
2. Trouvez le dossier `prisma` dans le dossier de l'application
3. Supprimez le fichier `dev.db`
4. Relancez l'application (attention : cela efface toutes vos données !)

### ❌ Je ne vois pas mes produits
**Solution :**
1. Vérifiez que vous êtes connecté avec le bon compte
2. Actualisez la page (F5)
3. Si le problème persiste, contactez le support

---

## 💾 Sauvegarde des Données

**Où sont mes données ?**
Toutes vos données sont stockées dans le fichier :
```
prisma/dev.db
```

**Comment sauvegarder ?**
1. Fermez l'application
2. Copiez le fichier `prisma/dev.db`
3. Collez-le dans un endroit sûr (clé USB, cloud, etc.)
4. Notez la date de la sauvegarde

**Comment restaurer une sauvegarde ?**
1. Fermez l'application
2. Remplacez le fichier `prisma/dev.db` par votre sauvegarde
3. Relancez l'application

**⚠️ Conseil :** Faites une sauvegarde **chaque semaine** !

---

## 📞 Support et Assistance

**Problème technique ?**
Contactez votre développeur :
- **Nom :** Hakim Bachabi
- **Email :** hakim.bachabi@gmail.com

**Avant de contacter le support, notez :**
- Le message d'erreur exact (si vous en voyez un)
- Ce que vous faisiez quand le problème est apparu
- Votre système d'exploitation (Windows 10, macOS, etc.)

---

## ✨ Astuces

### 🔍 Recherche rapide
Utilisez la barre de recherche en haut pour trouver rapidement un produit

### 📋 Export des données
(Fonctionnalité à venir)

### 🎨 Mode sombre/clair
Cliquez sur l'icône de soleil/lune en haut à droite

### ⌨️ Raccourcis clavier
- `Ctrl + F` : Rechercher
- `F5` : Actualiser la page
- `Ctrl + P` : Imprimer (depuis le navigateur)

---

## 📱 Accès depuis un autre ordinateur du magasin

Si vous voulez accéder à l'application depuis un autre ordinateur **du même réseau local** :

1. Sur l'ordinateur où l'application tourne, trouvez votre adresse IP locale
   - Windows : Ouvrir CMD et taper `ipconfig`
   - Mac : Ouvrir Terminal et taper `ifconfig`
   - Cherchez quelque chose comme `192.168.1.XXX`

2. Sur l'autre ordinateur, ouvrez un navigateur et allez à :
   ```
   http://192.168.1.XXX:3000
   ```
   (Remplacez XXX par votre adresse IP)

**⚠️ Attention :** L'ordinateur principal doit rester allumé avec l'application lancée !

---

## 🎓 Formation

Une formation de 2h est incluse avec votre licence.

**Au programme :**
- ✅ Prise en main de l'interface
- ✅ Création de catégories et produits
- ✅ Gestion des entrées/sorties
- ✅ Lecture des statistiques
- ✅ Sauvegardes
- ✅ Questions/Réponses

---

**Version :** 1.0.0
**Dernière mise à jour :** Novembre 2024

**🌟 Merci d'utiliser Gestion de Stocks !**
