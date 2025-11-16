# Déploiement sur GitHub Pages

## Configuration effectuée

✅ Workflow GitHub Actions créé (`.github/workflows/deploy.yml`)
✅ Configuration du base path pour GitHub Pages (`/simulateur_investissement`)
✅ Configuration SvelteKit et Vite pour la production

## Étapes pour activer GitHub Pages

### 1. Activer GitHub Pages dans les paramètres du repo

1. Allez sur https://github.com/bigmoletos/simulateur_investissement
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu de gauche, cliquez sur **Pages**
4. Sous **Source**, sélectionnez :
   - **Source** : `GitHub Actions`
5. Cliquez sur **Save**

### 2. Pousser les changements

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### 3. Vérifier le déploiement

1. Allez dans l'onglet **Actions** de votre repo GitHub
2. Vous devriez voir le workflow "Deploy to GitHub Pages" en cours d'exécution
3. Une fois terminé (environ 2-3 minutes), votre site sera disponible à :
   **https://bigmoletos.github.io/simulateur_investissement/**

## Mises à jour automatiques

Chaque fois que vous poussez sur la branche `main`, le site sera automatiquement reconstruit et déployé.

## Dépannage

### Le workflow échoue
- Vérifiez les logs dans l'onglet **Actions**
- Assurez-vous que GitHub Pages est activé avec **GitHub Actions** comme source

### Les assets ne se chargent pas
- Vérifiez que le base path est correct dans `svelte.config.js` et `vite.config.ts`
- Le base path doit correspondre au nom de votre repo : `/simulateur_investissement`

### Le service worker ne fonctionne pas
- GitHub Pages nécessite HTTPS, ce qui est automatique
- Vérifiez que `static/service-worker.js` est bien présent dans le repo

## URL de l'application

Une fois déployé, votre application sera accessible à :
**https://bigmoletos.github.io/simulateur_investissement/**

Les utilisateurs pourront installer l'application PWA depuis cette URL !

