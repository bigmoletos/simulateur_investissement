# Configuration DNS pour GitHub Pages

## Problème actuel

Votre domaine personnalisé `simulateur-placement.iaproject.fr` est configuré avec un **enregistrement A** alors que GitHub Pages nécessite un **enregistrement CNAME**.

## Solution : Configurer un CNAME

### Option 1 : Utiliser le domaine GitHub Pages par défaut (Recommandé)

Si vous n'avez pas besoin d'un domaine personnalisé, utilisez simplement :
**https://bigmoletos.github.io/simulateur_investissement/**

Dans ce cas, ignorez la configuration DNS personnalisée dans GitHub Pages.

### Option 2 : Configurer le domaine personnalisé correctement

Si vous voulez utiliser `simulateur-placement.iaproject.fr`, suivez ces étapes :

#### 1. Configurer le DNS chez votre hébergeur de domaine

Allez dans les paramètres DNS de votre domaine `iaproject.fr` et :

1. **Supprimez** l'enregistrement A existant pour `simulateur-placement`
2. **Ajoutez** un enregistrement CNAME :
   - **Type** : CNAME
   - **Nom/Host** : `simulateur-placement` (ou `simulateur-placement.iaproject.fr`)
   - **Valeur/Point vers** : `bigmoletos.github.io`
   - **TTL** : 3600 (ou valeur par défaut)

#### 2. Configurer le domaine dans GitHub Pages

1. Allez sur : https://github.com/bigmoletos/simulateur_investissement/settings/pages
2. Dans la section **Custom domain**, entrez : `simulateur-placement.iaproject.fr`
3. Cochez **Enforce HTTPS** (recommandé)
4. Cliquez sur **Save**

#### 3. Attendre la propagation DNS

- La propagation DNS peut prendre de quelques minutes à 48 heures
- Vous pouvez vérifier avec : `nslookup simulateur-placement.iaproject.fr`
- GitHub vérifiera automatiquement la configuration et activera HTTPS une fois le DNS correctement configuré

## Vérification DNS

Pour vérifier que votre DNS est correctement configuré :

### Windows (PowerShell)
```powershell
nslookup simulateur-placement.iaproject.fr
```

### Linux/Mac
```bash
dig simulateur-placement.iaproject.fr CNAME
```

Vous devriez voir que le CNAME pointe vers `bigmoletos.github.io`.

## Notes importantes

1. **CNAME uniquement** : GitHub Pages ne supporte que les CNAME pour les sous-domaines personnalisés
2. **Pas d'enregistrement A** : Les enregistrements A ne fonctionnent pas avec GitHub Pages pour les sous-domaines
3. **HTTPS automatique** : Une fois le DNS configuré, GitHub activera automatiquement HTTPS avec un certificat Let's Encrypt
4. **Base path** : Le base path `/simulateur_investissement` reste nécessaire dans la configuration

## Dépannage

### Le domaine ne fonctionne toujours pas après 48h
- Vérifiez que le CNAME est correctement configuré
- Vérifiez que vous avez bien enregistré le domaine dans GitHub Pages
- Attendez la propagation complète du DNS

### Erreur "DNS check failed"
- Assurez-vous que le CNAME pointe vers `bigmoletos.github.io` (pas vers `github.io` seul)
- Vérifiez qu'il n'y a pas d'enregistrement A en conflit
- Attendez quelques heures pour la propagation

### HTTPS ne s'active pas
- GitHub active HTTPS automatiquement une fois le DNS vérifié
- Cela peut prendre jusqu'à 24 heures après la configuration du DNS

