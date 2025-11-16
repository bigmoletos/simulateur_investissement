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
export type SellFrequency = ReinvestFrequency | 'never'; // Fréquence de sortie/réachat, avec option "jamais"
export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type SellStrategy = 'reinvest' | 'withdraw'; // Stratégie de vente : réinvestir ou retirer

// Types pour sélection multiple de fréquences
export type FrequencySelection = ReinvestFrequency[] | 'none'; // Tableau de fréquences (peut être vide), ou 'none' pour aucun réinvestissement
export type SellFrequencySelection = ReinvestFrequency[] | 'none'; // Tableau de fréquences (peut être vide), ou 'none' pour aucune sortie/réachat

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
	takeProfit?: number; // Prise de profit en % (optionnel)
	expectedReturn: number;
	reinvestFrequency: ReinvestFrequency | FrequencySelection; // Fréquence(s) de réinvestissement (peut être un tableau ou 'none')
	sellFrequency?: ReinvestFrequency | SellFrequencySelection; // Fréquence(s) de sortie/réachat pour stabiliser les gains (défaut: même que reinvestFrequency)
	sellStrategy?: SellStrategy; // Stratégie de vente : réinvestir ou retirer (défaut: reinvest)
	// Capital additionnel avec fréquence configurable
	capitalAdditionAmount?: number; // Montant d'ajout de capital
	capitalAdditionFrequency?: ReinvestFrequency; // Fréquence d'ajout (daily, weekly, monthly, yearly)
	// Rétrocompatibilité
	monthlyCapitalAddition?: number; // Capital ajouté chaque mois (déprécié, utiliser capitalAdditionAmount + capitalAdditionFrequency)
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
	withdrawal?: number; // Frais de retrait (si stratégie = retirer)
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
	initialAmount: number; // Capital initial uniquement
	leveragedAmount: number;
	grossGain: number; // Gain brut total (capital initial + capital additionnel)
	// Gains séparés pour calcul de rentabilité précise
	initialCapitalGain: number; // Gain brut sur le capital initial uniquement
	additionalCapitalGain?: number; // Gain brut sur le capital additionnel (si applicable)
	additionalCapitalAmount?: number; // Montant de capital additionnel investi
	fees: FeeBreakdown;
	taxes: TaxBreakdown;
	netGain: number; // Gain net total (capital initial + capital additionnel)
	initialCapitalNetGain: number; // Gain net sur le capital initial uniquement (pour calcul ROI)
	netReturn: number; // Rentabilité nette calculée UNIQUEMENT sur le capital initial
	newCapital: number;
	reinvestment: number;
	withdrawal?: number; // Montant retiré si sellStrategy = 'withdraw'
	stopLoss: StopLossInfo;
	takeProfit?: {
		percentage: number;
		amount: number;
		potentialGain: number;
	};
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

