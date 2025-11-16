# 📱 Guide d'Installation - Application PWA

Votre application est maintenant configurée comme **Progressive Web App (PWA)** et peut être installée sur PC et smartphone !

## 🚀 Étapes pour rendre l'application installable

### 1. Créer les icônes PWA

Vous devez créer des icônes pour que l'application soit installable. Deux options :

#### Option A : Génération automatique (recommandé)

1. Créez ou trouvez une image source de **512x512 pixels minimum** (PNG recommandé)
2. Installez `sharp` : `npm install --save-dev sharp`
3. Exécutez : `node scripts/generate-icons.js chemin/vers/votre/image.png`
4. Les icônes seront générées automatiquement dans `static/icons/`

#### Option B : Création manuelle

Créez manuellement les fichiers suivants dans `static/icons/` :
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

**Conseil** : Utilisez un générateur en ligne comme [RealFaviconGenerator](https://realfavicongenerator.net/) ou [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)

### 2. Builder l'application

```bash
npm run build
```

### 3. Tester localement

```bash
npm run preview
```

Ouvrez `http://localhost:4173` dans votre navigateur et testez l'installation.

### 4. Déployer en production

Pour que l'installation fonctionne, l'application doit être servie en **HTTPS** (ou localhost).

**Options de déploiement :**

- **Netlify** : Connectez votre repo GitHub, déploiement automatique
- **Vercel** : `vercel --prod`
- **GitHub Pages** : Configurez GitHub Actions
- **Votre propre serveur** : Uploadez le dossier `build/` sur votre serveur HTTPS

## 📱 Comment installer sur différents appareils

### Android (Chrome/Edge)
1. Ouvrez l'application dans Chrome ou Edge
2. Menu (3 points) → **"Ajouter à l'écran d'accueil"** ou **"Installer l'application"**
3. Confirmez
4. L'application apparaît sur l'écran d'accueil

### iOS (Safari)
1. Ouvrez l'application dans Safari
2. Bouton **Partager** (icône carrée avec flèche)
3. **"Sur l'écran d'accueil"**
4. Personnalisez le nom si besoin
5. **"Ajouter"**

### Windows (Chrome/Edge)
1. Ouvrez l'application dans Chrome ou Edge
2. Cliquez sur l'icône **"Installer"** dans la barre d'adresse
3. Ou Menu → **"Installer l'application"**
4. L'application s'ouvre dans une fenêtre dédiée

### macOS (Safari)
1. Ouvrez l'application dans Safari
2. **Partager** → **"Ajouter à l'écran d'accueil"**
3. L'application apparaît dans le Launchpad

## ✨ Fonctionnalités PWA

- ✅ **Installation** : Installez comme une application native
- ✅ **Mode hors ligne** : Fonctionne sans internet (avec cache)
- ✅ **Icône sur l'écran d'accueil** : Accès rapide
- ✅ **Fenêtre dédiée** : S'ouvre dans sa propre fenêtre (desktop)
- ✅ **Mises à jour automatiques** : Se met à jour en arrière-plan

## 🔧 Dépannage

### L'icône d'installation n'apparaît pas
- Vérifiez que les icônes existent dans `static/icons/`
- Vérifiez que l'application est servie en HTTPS (ou localhost)
- Vérifiez la console du navigateur pour les erreurs

### Le service worker ne s'enregistre pas
- Vérifiez que `static/service-worker.js` existe
- Vérifiez la console du navigateur pour les erreurs
- Assurez-vous que l'application est servie depuis la racine (`/`)

### L'application ne fonctionne pas hors ligne
- Le cache est limité aux pages déjà visitées
- Les données dynamiques nécessitent une connexion internet

## 📝 Notes importantes

- L'application doit être en **HTTPS** pour fonctionner (sauf localhost)
- Les fonctionnalités hors ligne sont limitées aux données mises en cache
- Les mises à jour sont vérifiées automatiquement toutes les heures
- Sur iOS, Safari est requis (Chrome/Firefox ne supportent pas l'installation PWA)

