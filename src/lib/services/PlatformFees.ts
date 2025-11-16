/**
 * Service de calcul des frais selon la plateforme
 *
 * Sources réelles 2025:
 * - XTB: https://www.xtb.com/fr/frais-et-commissions
 *   Commission: 0% sur actions/ETF jusqu'à 100 000€/mois, puis 0,2% au-delà
 *   Spread: Variable selon l'actif (très serré pour ETF)
 *   Swap: Variable selon l'actif et le levier
 *   Retrait: Gratuit
 * - eToro: https://www.etoro.com/fr/help/91/3600/commissions-et-frais
 *   Commission: 0% sur actions/ETF sans limite
 *   Spread: Variable selon l'actif (généralement plus élevé que XTB)
 *   Swap: Variable selon l'actif et le levier
 *   Retrait: 5$ par retrait
 *
 * Conformité Constitution: Principe I - Précision Financière
 * Toutes les formules doivent être documentées avec sources
 *
 * @author Simulateur de Placement
 * @version 2.0.0
 * @date 2025-11-15
 */

import type { Platform, AssetType, FeeBreakdown } from '../types/index.js';
import { CalculationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class PlatformFees {
	// Volume mensuel maximum pour commission gratuite XTB
	private static readonly XTB_FREE_COMMISSION_LIMIT = 100000; // 100 000€ par mois
	private static readonly XTB_COMMISSION_RATE_ABOVE_LIMIT = 0.002; // 0,2% au-delà

	/**
	 * Calcule les frais de transaction pour XTB
	 * Sources réelles 2025: https://www.xtb.com/fr/frais-et-commissions
	 */
	static calculateXTB(
		amount: number,
		assetType: AssetType,
		leverage: number = 1,
		monthlyVolume: number = 0 // Volume mensuel cumulé pour calculer la commission
	): FeeBreakdown & { swapRate: number; withdrawalFee?: number; commissionRate?: number } {
		let spread = 0;
		let commission = 0;
		let commissionRate = 0;

		// Spread XTB selon le type d'actif (valeurs réelles 2025 - spreads variables)
		// Les spreads sont généralement très serrés, surtout pour les ETF
		const spreadRates: Record<AssetType, number> = {
			action: 0.0005, // 0.05% en moyenne pour actions (spread variable selon l'actif)
			fonds: 0.001, // 0.10% pour fonds
			etf: 0.0002 // 0.02% pour ETF (spread très serré, peut aller jusqu'à 0.01%)
		};

		spread = amount * (spreadRates[assetType] || 0.0005);

		// Commission XTB: 0% sur actions/ETF jusqu'à 100 000€ par mois
		// Au-delà de 100 000€/mois: 0,2% par transaction (minimum 10€)
		if (monthlyVolume > this.XTB_FREE_COMMISSION_LIMIT) {
			commissionRate = this.XTB_COMMISSION_RATE_ABOVE_LIMIT;
			commission = amount * commissionRate;
			// Minimum de 10€ par transaction si commission appliquée
			if (commission > 0 && commission < 10) {
				commission = 10;
			}
		} else {
			commissionRate = 0;
			commission = 0;
		}

		// Swap overnight pour positions avec levier
		// XTB: swap variable selon l'actif et le levier
		// Pour actions/ETF avec levier, généralement entre 0.01% et 0.05% par jour selon le levier
		// Formule approximative: taux de base × (levier - 1)
		const baseSwapRate = assetType === 'etf' ? 0.0001 : assetType === 'action' ? 0.00015 : 0.0002;
		const swapRate = leverage > 1 ? baseSwapRate * (leverage - 1) : 0;

		// Frais de retrait: Gratuit pour virement SEPA et retrait bancaire
		const withdrawalFee = 0;

		logger.debug('Calcul frais XTB', {
			amount,
			assetType,
			leverage,
			monthlyVolume,
			spread,
			commission,
			commissionRate,
			swapRate
		});

		return {
			entry: spread + commission,
			swap: 0, // Calculé séparément selon la période
			total: spread + commission,
			spread,
			spreadRate: spreadRates[assetType] || 0.0005,
			commission,
			commissionRate,
			swapRate,
			withdrawalFee
		};
	}

	/**
	 * Calcule les frais de transaction pour eToro
	 * Sources réelles 2025: https://www.etoro.com/fr/help/91/3600/commissions-et-frais
	 */
	static calculateEToro(
		amount: number,
		assetType: AssetType,
		leverage: number = 1
	): FeeBreakdown & { swapRate: number; withdrawalFee?: number; commissionRate?: number } {
		let spread = 0;
		let commission = 0;
		const commissionRate = 0; // 0% sur actions/ETF sans limite
		const withdrawalFee = 5; // 5$ par retrait (en USD, converti en EUR approximativement)

		// Spread eToro selon le type d'actif (valeurs réelles 2025)
		// Les spreads eToro sont généralement plus élevés que XTB
		const spreadRates: Record<AssetType, number> = {
			action: 0.001, // 0.10% en moyenne pour actions (spread variable selon l'actif)
			fonds: 0.0015, // 0.15% pour fonds
			etf: 0.0008 // 0.08% pour ETF (spread généralement plus élevé que XTB)
		};

		spread = amount * (spreadRates[assetType] || 0.001);

		// Commission eToro: 0% sur les actions/ETF sans limite de volume
		commission = 0;

		// Swap overnight pour positions avec levier
		// eToro: swap variable selon l'actif et le levier
		// Généralement entre 0.01% et 0.04% par jour selon le levier
		const baseSwapRate = assetType === 'etf' ? 0.00012 : assetType === 'action' ? 0.00018 : 0.00025;
		const swapRate = leverage > 1 ? baseSwapRate * (leverage - 1) : 0;

		logger.debug('Calcul frais eToro', {
			amount,
			assetType,
			leverage,
			spread,
			commission,
			swapRate,
			withdrawalFee
		});

		return {
			entry: spread + commission,
			swap: 0, // Calculé séparément selon la période
			total: spread + commission,
			spread,
			spreadRate: spreadRates[assetType] || 0.001,
			commission,
			commissionRate,
			swapRate,
			withdrawalFee
		};
	}

	/**
	 * Calcule les frais selon la plateforme
	 * @param platform Plateforme (xtb ou etoro)
	 * @param amount Montant de la transaction
	 * @param assetType Type d'actif (action, fonds, etf)
	 * @param leverage Bras de levier (1 à 10)
	 * @param monthlyVolume Volume mensuel cumulé (pour XTB, pour calculer la commission au-delà de 100k€)
	 */
	static calculate(
		platform: Platform,
		amount: number,
		assetType: AssetType,
		leverage: number = 1,
		monthlyVolume: number = 0
	): FeeBreakdown & { swapRate: number; withdrawalFee?: number; commissionRate?: number } {
		if (platform === 'xtb') {
			return this.calculateXTB(amount, assetType, leverage, monthlyVolume);
		} else if (platform === 'etoro') {
			return this.calculateEToro(amount, assetType, leverage);
		}
		throw new CalculationError(`Plateforme non supportée: ${platform}`);
	}
}

