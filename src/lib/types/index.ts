/**
 * Types de base pour le simulateur de placement
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

export type AssetType = 'action' | 'fonds' | 'etf';
export type Platform = 'xtb' | 'etoro';
export type ReinvestFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Investissement avec tous ses paramètres
 */
export interface Investment {
	id: string;
	amount: number;
	assetType: AssetType;
	platform: Platform;
	leverage: number;
	stopLoss: number;
	expectedReturn: number;
	reinvestFrequency: ReinvestFrequency;
	monthlyCapitalAddition?: number; // Capital ajouté chaque mois
	createdAt: Date;
	updatedAt: Date;
	name?: string;
}

/**
 * Configuration d'une plateforme
 */
export interface PlatformConfig {
	platform: Platform;
	assetType: AssetType;
	spreadRate: number;
	commissionRate: number;
	commissionFixed?: number;
	swapRate: number;
	managementFee?: number;
	withdrawalFee?: number;
	minimumAmount?: number;
	lastUpdated: Date;
	source: string;
}

/**
 * Détails des frais avec informations détaillées
 */
export interface FeeBreakdown {
	entry: number;
	exit?: number; // Frais de sortie (spread à la vente)
	swap: number;
	total: number;
	// Détails additionnels
	spread?: number;
	spreadRate?: number;
	commission?: number;
	commissionRate?: number;
	swapRate?: number;
	withdrawalFee?: number;
}

/**
 * Détails d'une tranche d'imposition
 */
export interface TaxBracketDetail {
	min: number;
	max: number;
	rate: number;
	taxableAmount: number;
	taxAmount: number;
}

/**
 * Détails des impôts avec informations détaillées
 */
export interface TaxBreakdown {
	socialCharges: number;
	incomeTax: number;
	total: number;
	// Détails additionnels pour le barème progressif
	taxBrackets?: TaxBracketDetail[];
	taxRegime?: 'PFU' | 'PROGRESSIVE'; // PFU ou barème progressif
}

/**
 * Informations sur le stop loss
 */
export interface StopLossInfo {
	percentage: number;
	amount: number;
	potentialLoss: number;
}

/**
 * Résultat de simulation pour une période
 */
export interface SimulationResult {
	investmentId: string;
	period: Period;
	daysInPeriod: number;
	initialAmount: number;
	leveragedAmount: number;
	grossGain: number;
	fees: FeeBreakdown;
	taxes: TaxBreakdown;
	netGain: number;
	netReturn: number;
	newCapital: number;
	reinvestment: number;
	stopLoss: StopLossInfo;
	calculatedAt: Date;
}

/**
 * Paramètres utilisateur
 */
export interface UserSettings {
	annualIncome: number;
	taxBracket?: number;
	defaultPlatform: Platform;
	defaultAssetType: AssetType;
	defaultLeverage: number;
	defaultStopLoss: number;
	theme: 'light' | 'dark' | 'auto';
	currency: string;
	updatedAt: Date;
}

/**
 * Historique de simulation
 */
export interface SimulationHistory {
	id: string;
	investment: Investment;
	results: Record<Period, SimulationResult>;
	savedAt: Date;
	name?: string;
}

/**
 * Résultat de validation
 */
export interface ValidationResult {
	valid: boolean;
	errors: string[];
}

/**
 * Contraintes d'optimisation
 */
export interface OptimizationConstraints {
	maxAmount?: number;
	maxRisk?: number;
	minReturn?: number;
	preferredFrequency?: ReinvestFrequency;
}

/**
 * Résultat d'optimisation
 */
export interface OptimizationResult {
	amount: number;
	leverage: number;
	reinvestFrequency: ReinvestFrequency;
	stopLoss: number;
}

