# Quickstart: Simulateur de Placement

**Date**: 2025-11-15 | **Feature**: simulateur-placement

## Scénarios de Test Rapides

### Scénario 1: Simulation Basique

**Objectif**: Vérifier le calcul de base d'une simulation annuelle sans levier.

**Données d'entrée**:
```typescript
{
  amount: 1000,
  assetType: 'action',
  platform: 'xtb',
  leverage: 1,
  stopLoss: 5,
  expectedReturn: 10,
  reinvestFrequency: 'monthly',
  annualIncome: 30000
}
```

**Résultats attendus**:
- Gain brut annuel: ~100€ (10% de 1000€)
- Frais: Spread XTB (~1€)
- Impôts: Prélèvements sociaux (~17.2€) + IR selon tranche
- Gain net: ~80-85€ selon tranche d'imposition
- Rentabilité nette: ~8-8.5%

### Scénario 2: Simulation avec Levier

**Objectif**: Vérifier l'impact du levier sur les gains et frais.

**Données d'entrée**:
```typescript
{
  amount: 1000,
  assetType: 'action',
  platform: 'xtb',
  leverage: 3,
  stopLoss: 5,
  expectedReturn: 10,
  reinvestFrequency: 'monthly',
  annualIncome: 30000
}
```

**Résultats attendus**:
- Montant avec levier: 3000€
- Gain brut annuel: ~300€ (10% de 3000€)
- Frais: Spread + Swap overnight (plus élevé avec levier)
- Gain net: Proportionnellement plus élevé mais avec frais supplémentaires
- Stop loss: 150€ (5% de 3000€)

### Scénario 3: Comparaison Plateformes

**Objectif**: Comparer XTB vs eToro pour le même investissement.

**Données d'entrée**:
- Même investissement sur XTB puis eToro
- Comparer les frais et rentabilité nette

**Résultats attendus**:
- Différences dans les spreads
- eToro: Frais de retrait supplémentaires
- Rentabilité nette différente selon la plateforme

### Scénario 4: Multi-Périodes

**Objectif**: Vérifier la cohérence des calculs entre périodes.

**Données d'entrée**:
```typescript
{
  amount: 1000,
  expectedReturn: 10, // 10% annuel
  // ... autres paramètres
}
```

**Résultats attendus**:
- Quotidien: ~0.027% net (10% / 365)
- Hebdomadaire: ~0.19% net (10% / 52)
- Mensuel: ~0.83% net (10% / 12)
- Annuel: ~10% net
- Cohérence: Les périodes s'emboîtent correctement

### Scénario 5: Stop Loss

**Objectif**: Vérifier le calcul et l'affichage du stop loss.

**Données d'entrée**:
```typescript
{
  amount: 1000,
  leverage: 5,
  stopLoss: 5,
  // ...
}
```

**Résultats attendus**:
- Montant avec levier: 5000€
- Stop loss: 250€ (5% de 5000€)
- Perte potentielle maximale: 1000€ (capital initial)
- Alerte visuelle si risque élevé

### Scénario 6: Réinvestissement

**Objectif**: Vérifier le calcul du réinvestissement selon la fréquence.

**Données d'entrée**:
```typescript
{
  amount: 1000,
  reinvestFrequency: 'monthly',
  // ...
}
```

**Résultats attendus**:
- Simulation mensuelle: `reinvestment > 0`
- Simulations autres périodes: `reinvestment = 0` (sauf si fréquence correspond)
- Nouveau capital calculé correctement

## Tests de Validation

### Test 1: Validation des Entrées

**Action**: Saisir des valeurs invalides
- Montant négatif
- Levier > 10
- Stop loss < 5%

**Résultat attendu**: Messages d'erreur clairs, validation en temps réel

### Test 2: Performance

**Action**: Modifier rapidement plusieurs paramètres

**Résultat attendu**:
- Mise à jour < 16ms (60 FPS)
- Calculs < 50ms
- Pas de lag visible

### Test 3: Persistance

**Action**:
1. Créer une simulation
2. Fermer l'application
3. Rouvrir l'application

**Résultat attendu**: Simulation sauvegardée et restaurée

## Commandes de Démarrage

```bash
# Installation
npm install

# Développement
npm run dev              # Frontend seulement
npm run tauri dev        # Application complète Tauri

# Tests
npm test                 # Tests unitaires
npm run test:e2e        # Tests E2E

# Build
npm run build           # Build frontend
npm run tauri build     # Build application desktop
```

## Checklist de Vérification

- [ ] Simulation basique fonctionne
- [ ] Calculs avec levier corrects
- [ ] Comparaison plateformes fonctionne
- [ ] Multi-périodes cohérentes
- [ ] Stop loss calculé et affiché
- [ ] Réinvestissement selon fréquence
- [ ] Validation des entrées
- [ ] Performance acceptable
- [ ] Persistance fonctionne

