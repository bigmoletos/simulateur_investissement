# Configuration CNAME dans OVH pour GitHub Pages

## Valeurs exactes à entrer dans OVH

### Dans l'interface DNS OVH :

1. **Type d'enregistrement** : `CNAME`
2. **Sous-domaine** : `simulateur-etoro` (OVH ajoute automatiquement `.iaproject.fr`)
3. **Cible** : `bigmoletos.github.io`
4. **TTL** : `3600` (ou laissez la valeur par défaut)

## Étapes détaillées dans OVH

### 1. Accéder à la zone DNS

1. Connectez-vous à votre espace client OVH : https://www.ovh.com/manager/
2. Allez dans **Web Cloud** → **Domaines**
3. Cliquez sur votre domaine `iaproject.fr`
4. Cliquez sur l'onglet **Zone DNS**

### 2. Supprimer l'enregistrement A existant (si présent)

1. Cherchez l'enregistrement de type **A** pour `simulateur-placement`
2. Cliquez sur les **3 points** à droite de l'enregistrement
3. Cliquez sur **Supprimer**
4. Confirmez la suppression

### 3. Ajouter l'enregistrement CNAME

1. Cliquez sur **Ajouter une entrée**
2. Sélectionnez **CNAME**
3. Remplissez les champs :
   - **Sous-domaine** : `simulateur-etoro`
     - ⚠️ **Important** : Entrez seulement `simulateur-etoro` (OVH ajoute automatiquement `.iaproject.fr`)
   - **Cible** : `bigmoletos.github.io`
     - ⚠️ **Important** : Entrez exactement `bigmoletos.github.io` (avec le point)
   - **TTL** : `3600` (ou laissez la valeur par défaut)
4. Cliquez sur **Valider**

### 4. Résultat attendu

Après ajout, vous devriez voir dans votre zone DNS :

```
Type    Sous-domaine              Cible                    TTL
CNAME   simulateur-etoro          bigmoletos.github.io     3600
```

**Note** : OVH ajoute automatiquement `.iaproject.fr` au sous-domaine, donc le domaine complet sera `simulateur-etoro.iaproject.fr`

## Vérification

### Vérifier dans OVH

Après quelques minutes, vous pouvez vérifier que l'enregistrement est correct :

1. Dans la zone DNS, vous devriez voir l'enregistrement CNAME
2. Le sous-domaine doit être `simulateur-etoro` (OVH affichera `simulateur-etoro.iaproject.fr`)
3. La cible doit être `bigmoletos.github.io`

### Vérifier avec une commande

```powershell
# Windows PowerShell
nslookup simulateur-etoro.iaproject.fr
```

Vous devriez voir quelque chose comme :
```
simulateur-etoro.iaproject.fr
    canonical name = bigmoletos.github.io
```

## Configuration dans GitHub Pages

Une fois le CNAME configuré dans OVH :

1. Allez sur : https://github.com/bigmoletos/simulateur_investissement/settings/pages
2. Dans la section **Custom domain**, entrez : `simulateur-etoro.iaproject.fr`
3. Cochez **Enforce HTTPS** ✅ (déjà activé selon vos informations)
4. Cliquez sur **Save**

## ✅ Statut actuel

- **Domaine** : `simulateur-etoro.iaproject.fr`
- **DNS Check** : ✅ OK
- **HTTPS** : ✅ Activé (Enforce HTTPS)
- **Configuration** : Complète et fonctionnelle

## Délais

- **Propagation DNS OVH** : Généralement 5-15 minutes
- **Vérification GitHub** : Peut prendre jusqu'à 24 heures
- **Activation HTTPS** : Automatique une fois le DNS vérifié (jusqu'à 24h)

## Dépannage

### Le CNAME n'apparaît pas dans OVH
- Vérifiez que vous avez bien sélectionné le type **CNAME** (pas A ou autre)
- Assurez-vous d'être dans la bonne zone DNS (`iaproject.fr`)

### GitHub affiche toujours une erreur après 24h
- Vérifiez que le CNAME pointe bien vers `bigmoletos.github.io` (pas `github.io` seul)
- Vérifiez qu'il n'y a pas d'enregistrement A en conflit
- Attendez la propagation complète (peut prendre jusqu'à 48h)

### Le domaine ne fonctionne pas
- Vérifiez que le sous-domaine est bien `simulateur-etoro` (OVH ajoute automatiquement `.iaproject.fr`)
- Vérifiez que la cible est exactement `bigmoletos.github.io` (avec le point)
- Attendez la propagation DNS complète

## 🌐 URL de l'application

Votre application est maintenant accessible à :
**https://simulateur-etoro.iaproject.fr/**

Les utilisateurs peuvent installer l'application PWA depuis cette URL !

