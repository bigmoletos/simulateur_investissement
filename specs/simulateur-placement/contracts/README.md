# Contracts: Simulateur de Placement

**Date**: 2025-11-15 | **Feature**: simulateur-placement

## Vue d'Ensemble

Contrats d'interface pour les services de calcul financier. Ces contrats définissent les interfaces TypeScript que doivent respecter les implémentations.

## Contrats Principaux

### 1. SimulationEngine Contract

```typescript
interface ISimulationEngine {
  /**
   * Calcule la rentabilité pour une période donnée
   * @param investment - Investissement à simuler
   * @param period - Période de calcul
   * @param annualIncome - Revenu annuel pour calcul IR
   * @returns Résultat de simulation
   */
  simulate(
    investment: Investment,
    period: Period,
    annualIncome?: number
  ): SimulationResult;

  /**
   * Calcule les résultats pour toutes les périodes
   * @param investment - Investissement à simuler
   * @param annualIncome - Revenu annuel
   * @returns Résultats pour toutes les périodes
   */
  simulateAllPeriods(
    investment: Investment,
    annualIncome?: number
  ): Record<Period, SimulationResult>;

  /**
   * Optimise les paramètres d'investissement
   * @param constraints - Contraintes d'optimisation
   * @returns Paramètres optimaux suggérés
   */
  optimize(constraints: OptimizationConstraints): OptimizationResult;
}
```

**Tests de contrat**:
- Doit calculer correctement avec investissement valide
- Doit rejeter investissement invalide
- Doit retourner résultats cohérents entre périodes

### 2. PlatformFees Contract

```typescript
interface IPlatformFees {
  /**
   * Calcule les frais selon la plateforme
   * @param platform - Plateforme (xtb, etoro)
   * @param amount - Montant de la transaction
   * @param assetType - Type d'actif
   * @param leverage - Bras de levier
   * @returns Détails des frais
   */
  calculate(
    platform: Platform,
    amount: number,
    assetType: AssetType,
    leverage?: number
  ): FeeDetails;
}

interface FeeDetails {
  spread: number;
  commission: number;
  swapRate: number;
  withdrawalFee?: number;
  total: number;
}
```

**Tests de contrat**:
- Doit calculer frais XTB correctement
- Doit calculer frais eToro correctement
- Doit inclure swap si levier > 1
- Doit rejeter plateforme invalide

### 3. TaxCalculator Contract

```typescript
interface ITaxCalculator {
  /**
   * Calcule les impôts sur les plus-values
   * @param gain - Gain réalisé
   * @param annualIncome - Revenu annuel
   * @returns Détails des impôts
   */
  calculate(gain: number, annualIncome?: number): TaxDetails;

  /**
   * Calcule le gain net après impôts
   * @param grossGain - Gain brut
   * @param annualIncome - Revenu annuel
   * @returns Gain net
   */
  calculateNetGain(grossGain: number, annualIncome?: number): number;
}

interface TaxDetails {
  socialCharges: number;
  incomeTax: number;
  total: number;
  netGain: number;
}
```

**Tests de contrat**:
- Doit calculer prélèvements sociaux (17.2%)
- Doit calculer IR selon tranche
- Doit retourner gain net correct

### 4. Investment Validator Contract

```typescript
interface IInvestmentValidator {
  /**
   * Valide un investissement
   * @param investment - Investissement à valider
   * @returns Résultat de validation
   */
  validate(investment: Investment): ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

**Tests de contrat**:
- Doit valider investissement correct
- Doit rejeter montant <= 0
- Doit rejeter levier hors limites
- Doit rejeter stop loss < 5%

## Tests de Contrat

Tous les contrats doivent avoir des tests dans `tests/contract/` qui vérifient:
1. Comportement attendu avec entrées valides
2. Gestion d'erreurs avec entrées invalides
3. Cohérence des résultats
4. Performance acceptable

## Évolutivité

Ces contrats permettent:
- Implémentations alternatives (ex: backend Rust)
- Tests de non-régression
- Documentation claire des interfaces
- Évolution contrôlée de l'API

