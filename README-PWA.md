# Installation de l'application PWA

Cette application peut être installée comme une Progressive Web App (PWA) sur votre PC ou smartphone.

## 📱 Installation sur Smartphone

### Android (Chrome/Edge)
1. Ouvrez l'application dans Chrome ou Edge
2. Appuyez sur le menu (3 points) en haut à droite
3. Sélectionnez **"Ajouter à l'écran d'accueil"** ou **"Installer l'application"**
4. Confirmez l'installation
5. L'application apparaîtra sur votre écran d'accueil comme une application native

### iOS (Safari)
1. Ouvrez l'application dans Safari
2. Appuyez sur le bouton **Partager** (icône carrée avec flèche)
3. Faites défiler et sélectionnez **"Sur l'écran d'accueil"**
4. Personnalisez le nom si nécessaire
5. Appuyez sur **"Ajouter"**
6. L'application apparaîtra sur votre écran d'accueil

## 💻 Installation sur PC

### Windows (Chrome/Edge)
1. Ouvrez l'application dans Chrome ou Edge
2. Cliquez sur l'icône **"Installer"** dans la barre d'adresse (ou menu > Installer l'application)
3. Confirmez l'installation
4. L'application s'ouvrira dans une fenêtre séparée, comme une application native

### macOS (Safari)
1. Ouvrez l'application dans Safari
2. Cliquez sur **"Partager"** > **"Ajouter à l'écran d'accueil"**
3. L'application sera ajoutée à votre Launchpad

### Linux (Chrome/Edge/Firefox)
1. Ouvrez l'application dans votre navigateur
2. Utilisez l'option d'installation PWA de votre navigateur
3. L'application sera accessible depuis votre menu d'applications

## 🚀 Fonctionnalités PWA

- ✅ **Installation** : Installez l'application sur votre appareil
- ✅ **Mode hors ligne** : Fonctionne même sans connexion internet (avec cache)
- ✅ **Icône sur l'écran d'accueil** : Accès rapide à l'application
- ✅ **Fenêtre dédiée** : S'ouvre dans sa propre fenêtre (sur desktop)
- ✅ **Mises à jour automatiques** : Se met à jour automatiquement en arrière-plan

## 🔧 Développement

### Générer les icônes PWA

Si vous avez une image source (512x512px minimum), vous pouvez générer toutes les icônes nécessaires :

```bash
npm install --save-dev sharp
node scripts/generate-icons.js chemin/vers/votre/image.png
```

Ou créez manuellement les icônes dans `static/icons/` avec les tailles suivantes :
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### Build pour production

```bash
npm run build
```

Les fichiers seront générés dans le dossier `build/`. Vous pouvez ensuite déployer ce dossier sur un serveur web (GitHub Pages, Netlify, Vercel, etc.).

### Tester localement

```bash
npm run build
npm run preview
```

Puis ouvrez `http://localhost:4173` dans votre navigateur pour tester l'installation PWA.

## 📝 Notes importantes

- L'application doit être servie en HTTPS (ou localhost) pour que la PWA fonctionne
- Les fonctionnalités hors ligne sont limitées aux données déjà mises en cache
- Les mises à jour sont vérifiées automatiquement toutes les heures

## 🌐 Déploiement

Pour déployer votre PWA :

1. **Netlify** : Connectez votre repo GitHub, Netlify détectera automatiquement SvelteKit
2. **Vercel** : `vercel --prod`
3. **GitHub Pages** : Utilisez GitHub Actions pour builder et déployer
4. **Serveur personnel** : Uploadez le dossier `build/` sur votre serveur web

Une fois déployée en HTTPS, les utilisateurs pourront installer votre application !

