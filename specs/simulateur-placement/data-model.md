# Data Model: Simulateur de Placement

**Date**: 2025-11-15 | **Feature**: simulateur-placement

## Vue d'Ensemble

Modèles de données pour représenter les investissements, plateformes, résultats de simulation et paramètres utilisateur.

## Entités Principales

### 1. Investment (Investissement)

Représente un investissement avec tous ses paramètres.

```typescript
interface Investment {
  // Identifiant unique
  id: string;

  // Paramètres de base
  amount: number;              // Montant investi initial (€)
  assetType: AssetType;        // Type d'actif
  platform: Platform;          // Plateforme de trading
  leverage: number;            // Bras de levier (1-10)

  // Gestion des risques
  stopLoss: number;            // Stop loss en % (minimum 5%)

  // Paramètres de simulation
  expectedReturn: number;       // Rendement attendu annuel (%)
  reinvestFrequency: ReinvestFrequency; // Fréquence de réinvestissement

  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  name?: string;               // Nom optionnel pour la simulation
}
```

**Types associés**:
```typescript
type AssetType = 'action' | 'fonds' | 'etf';
type Platform = 'xtb' | 'etoro';
type ReinvestFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
```

**Validation Zod**:
```typescript
const InvestmentSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  assetType: z.enum(['action', 'fonds', 'etf']),
  platform: z.enum(['xtb', 'etoro']),
  leverage: z.number().int().min(1).max(10),
  stopLoss: z.number().min(5).max(50),
  expectedReturn: z.number().min(-100).max(100),
  reinvestFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string().optional()
});
```

### 2. PlatformConfig (Configuration Plateforme)

Paramètres de frais et règles spécifiques à chaque plateforme.

```typescript
interface PlatformConfig {
  platform: Platform;
  assetType: AssetType;

  // Frais de transaction
  spreadRate: number;          // Taux de spread (%)
  commissionRate: number;       // Taux de commission (%)
  commissionFixed?: number;     // Commission fixe (€)

  // Frais récurrents
  swapRate: number;            // Taux de swap overnight (% par jour)
  managementFee?: number;       // Frais de gestion annuels (%)

  // Frais spécifiques
  withdrawalFee?: number;       // Frais de retrait (€) - eToro
  minimumAmount?: number;      // Montant minimum (€)

  // Métadonnées
  lastUpdated: Date;            // Date de dernière mise à jour
  source: string;               // Source des données
}
```

### 3. SimulationResult (Résultat de Simulation)

Résultat d'une simulation pour une période donnée.

```typescript
interface SimulationResult {
  // Identifiants
  investmentId: string;
  period: Period;

  // Période
  daysInPeriod: number;

  // Montants
  initialAmount: number;
  leveragedAmount: number;

  // Gains et pertes
  grossGain: number;
  fees: FeeBreakdown;
  taxes: TaxBreakdown;
  netGain: number;
  netReturn: number;            // Rentabilité nette (%)

  // Nouveau capital
  newCapital: number;
  reinvestment: number;         // Montant à réinvestir (si applicable)

  // Stop loss
  stopLoss: StopLossInfo;

  // Métadonnées
  calculatedAt: Date;
}

interface FeeBreakdown {
  entry: number;                // Frais d'entrée
  swap: number;                 // Frais de swap (si levier)
  total: number;
}

interface TaxBreakdown {
  socialCharges: number;        // Prélèvements sociaux (17.2%)
  incomeTax: number;            // Impôt sur le revenu
  total: number;
}

interface StopLossInfo {
  percentage: number;
  amount: number;
  potentialLoss: number;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';
```

### 4. UserSettings (Paramètres Utilisateur)

Paramètres globaux de l'utilisateur.

```typescript
interface UserSettings {
  // Fiscalité
  annualIncome: number;         // Revenu annuel pour calcul IR (€)
  taxBracket?: number;          // Tranche d'imposition (optionnel)

  // Préférences
  defaultPlatform: Platform;
  defaultAssetType: AssetType;
  defaultLeverage: number;
  defaultStopLoss: number;

  // Interface
  theme: 'light' | 'dark' | 'auto';
  currency: string;              // Devise d'affichage (EUR par défaut)

  // Métadonnées
  updatedAt: Date;
}
```

### 5. SimulationHistory (Historique)

Historique des simulations sauvegardées.

```typescript
interface SimulationHistory {
  id: string;
  investment: Investment;
  results: {
    [period in Period]: SimulationResult;
  };
  savedAt: Date;
  name?: string;
}
```

## Relations

```
Investment (1) ──→ (N) SimulationResult
Investment (1) ──→ (1) PlatformConfig (via platform + assetType)
UserSettings (1) ──→ (N) Investment (via defaults)
SimulationHistory (N) ──→ (1) Investment
```

## Contraintes de Validation

### Investment
- `amount` > 0
- `leverage` entre 1 et 10
- `stopLoss` >= 5%
- `expectedReturn` entre -100% et 100%

### SimulationResult
- `netGain = grossGain - fees.total - taxes.total`
- `netReturn = (netGain / initialAmount) * 100`
- `newCapital = initialAmount + netGain`
- `stopLoss.amount = leveragedAmount * (stopLoss.percentage / 100)`

## Stockage

### IndexedDB Schema

```typescript
// Stores IndexedDB
interface Database {
  investments: Investment[];
  platformConfigs: PlatformConfig[];
  simulationHistory: SimulationHistory[];
  userSettings: UserSettings;
}

// Indexes
investments: {
  index: ['platform', 'assetType', 'createdAt']
}

simulationHistory: {
  index: ['savedAt', 'investmentId']
}
```

## Évolutivité

### Extensions Futures Possibles

1. **Portfolio**: Regroupement de plusieurs investissements
2. **Scenarios**: Comparaison de plusieurs simulations
3. **Export**: Formats Excel, PDF, CSV
4. **Synchronisation**: Cloud sync (optionnel)

