/**
 * Schémas de validation Zod pour le simulateur de placement
 *
 * Conformité Constitution: Principe I - Précision Financière
 * Toutes les données financières doivent être validées avant traitement
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

import { z } from 'zod';
import type {
	Investment,
	PlatformConfig,
	UserSettings,
	SimulationHistory,
	OptimizationConstraints
} from '../types/index.js';

/**
 * Schéma de validation pour Investment
 */
export const InvestmentSchema: z.ZodType<Investment> = z.object({
	id: z.string().uuid(),
	amount: z.number().positive('Le montant doit être positif'),
	assetType: z.enum(['action', 'fonds', 'etf'], {
		errorMap: () => ({ message: 'Type d\'actif invalide' })
	}),
	platform: z.enum(['xtb', 'etoro'], {
		errorMap: () => ({ message: 'Plateforme invalide' })
	}),
	leverage: z.number().min(1, 'Le levier doit être au minimum 1').max(10, 'Le levier doit être au maximum 10'),
	stopLoss: z.number().min(5, 'Le stop loss doit être au minimum 5%').max(50, 'Le stop loss doit être au maximum 50%'),
	takeProfit: z.number().min(0, 'Le take profit doit être positif').max(1000, 'Le take profit peut aller jusqu\'à 1000%').optional(),
	expectedReturn: z.number().min(-100, 'Le rendement ne peut pas être inférieur à -100%').max(1000, 'Le rendement peut aller jusqu\'à 1000%'),
	reinvestFrequency: z.union([
		z.enum(['daily', 'weekly', 'monthly', 'yearly']),
		z.array(z.enum(['daily', 'weekly', 'monthly', 'yearly'])).min(0), // Tableau peut être vide
		z.literal('none')
	], {
		errorMap: () => ({ message: 'Fréquence de réinvestissement invalide' })
	}),
	sellFrequency: z.union([
		z.enum(['daily', 'weekly', 'monthly', 'yearly']),
		z.array(z.enum(['daily', 'weekly', 'monthly', 'yearly'])).min(0), // Tableau peut être vide
		z.literal('none')
	], {
		errorMap: () => ({ message: 'Fréquence de sortie/réachat invalide' })
	}).optional(),
	sellStrategy: z.enum(['reinvest', 'withdraw'], {
		errorMap: () => ({ message: 'Stratégie de vente invalide' })
	}).optional(),
	capitalAdditionAmount: z.number().min(0, 'Le montant d\'ajout de capital doit être positif').optional(),
	capitalAdditionFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
		errorMap: () => ({ message: 'Fréquence d\'ajout de capital invalide' })
	}).optional(),
	monthlyCapitalAddition: z.number().min(0, 'Le capital mensuel doit être positif').optional(), // Rétrocompatibilité
	createdAt: z.date(),
	updatedAt: z.date(),
	name: z.string().optional()
});

/**
 * Schéma de validation pour PlatformConfig
 */
export const PlatformConfigSchema: z.ZodType<PlatformConfig> = z.object({
	platform: z.enum(['xtb', 'etoro']),
	assetType: z.enum(['action', 'fonds', 'etf']),
	spreadRate: z.number().min(0).max(1),
	commissionRate: z.number().min(0).max(1),
	commissionFixed: z.number().positive().optional(),
	swapRate: z.number().min(0),
	managementFee: z.number().min(0).max(1).optional(),
	withdrawalFee: z.number().min(0).optional(),
	minimumAmount: z.number().positive().optional(),
	lastUpdated: z.date(),
	source: z.string().min(1)
});

/**
 * Schéma de validation pour UserSettings
 */
export const UserSettingsSchema: z.ZodType<UserSettings> = z.object({
	annualIncome: z.number().min(0, 'Le revenu annuel doit être positif ou nul'),
	taxBracket: z.number().min(0).max(1).optional(),
	defaultPlatform: z.enum(['xtb', 'etoro']),
	defaultAssetType: z.enum(['action', 'fonds', 'etf']),
	defaultLeverage: z.number().int().min(1).max(10),
	defaultStopLoss: z.number().min(5).max(50),
	theme: z.enum(['light', 'dark', 'auto']),
	currency: z.string().length(3, 'La devise doit être au format ISO 3 lettres'),
	updatedAt: z.date()
});

/**
 * Schéma de validation pour OptimizationConstraints
 */
export const OptimizationConstraintsSchema: z.ZodType<OptimizationConstraints> = z.object({
	maxAmount: z.number().positive().optional(),
	maxRisk: z.number().int().min(1).max(10).optional(),
	minReturn: z.number().optional(),
	preferredFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional()
});

/**
 * Fonction helper pour valider un Investment
 */
export function validateInvestment(investment: unknown): { valid: boolean; errors: string[] } {
	try {
		InvestmentSchema.parse(investment);
		return { valid: true, errors: [] };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				valid: false,
				errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
			};
		}
		return { valid: false, errors: ['Erreur de validation inconnue'] };
	}
}

/**
 * Fonction helper pour valider UserSettings
 */
export function validateUserSettings(settings: unknown): { valid: boolean; errors: string[] } {
	try {
		UserSettingsSchema.parse(settings);
		return { valid: true, errors: [] };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				valid: false,
				errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
			};
		}
		return { valid: false, errors: ['Erreur de validation inconnue'] };
	}
}

