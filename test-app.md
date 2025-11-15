# Tests de l'application Simulateur de Placement

## Tests à effectuer

### 1. Interface utilisateur
- [ ] L'application se charge correctement
- [ ] Le header avec le titre s'affiche
- [ ] La section "Paramètres d'investissement" est visible
- [ ] Tous les champs de saisie sont présents et fonctionnels

### 2. Paramètres d'investissement
- [ ] Montant investi : peut être modifié
- [ ] Type d'actif : sélection fonctionne (action, fonds, etf)
- [ ] Plateforme : sélection fonctionne (xtb, etoro)
- [ ] Bras de levier : slider fonctionne (1-10)
- [ ] Stop Loss : peut être modifié (minimum 5%)
- [ ] Rendement attendu : peut être modifié
- [ ] Fréquence de réinvestissement : sélection fonctionne
- [ ] Revenu annuel : peut être modifié

### 3. Calculs et résultats
- [ ] Les résultats s'affichent après modification des paramètres
- [ ] Les 4 périodes sont affichées (quotidien, hebdomadaire, mensuel, annuel)
- [ ] Les montants sont formatés en euros (€)
- [ ] Les pourcentages sont formatés correctement (%)
- [ ] Les gains positifs sont en vert
- [ ] Les gains négatifs sont en rouge
- [ ] Les frais et impôts sont affichés
- [ ] Le gain net est mis en évidence

### 4. Validation
- [ ] Les erreurs de validation s'affichent si les valeurs sont invalides
- [ ] Le stop loss ne peut pas être inférieur à 5%
- [ ] Les champs numériques acceptent uniquement des nombres

### 5. Optimisation
- [ ] Les recommandations s'affichent
- [ ] L'avertissement pour levier >5x s'affiche si applicable

## Résultats attendus

Pour un investissement de 1000€ avec :
- Type: action
- Plateforme: xtb
- Levier: 1x
- Stop Loss: 5%
- Rendement attendu: 10% annuel
- Réinvestissement: mensuel
- Revenu annuel: 30000€

Les résultats devraient montrer :
- Gain brut positif pour toutes les périodes
- Frais calculés selon XTB
- Impôts calculés selon la tranche d'imposition
- Gain net après frais et impôts
- Rentabilité nette en pourcentage

