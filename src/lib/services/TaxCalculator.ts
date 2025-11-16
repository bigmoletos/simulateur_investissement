/**
 * Service de calcul des impôts selon la réglementation française
 *
 * Sources réelles 2025:
 * - Prélèvement Forfaitaire Unique (PFU): 30% (12,8% IR + 17,2% prélèvements sociaux)
 *   C'est le régime par défaut pour les plus-values mobilières
 * - Option barème progressif: possible en cochant la case 2OP sur la déclaration
 *   Tranches 2025: 0%, 11%, 30%, 41%, 45%
 *
 * Conformité Constitution: Principe I - Précision Financière
 * Formules documentées avec sources réglementaires
 *
 * @author Simulateur de Placement
 * @version 2.0.0
 * @date 2025-11-15
 */

import type { TaxBreakdown } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class TaxCalculator {
	// Prélèvement Forfaitaire Unique (PFU) - régime par défaut
	static readonly PFU_RATE = 0.30; // 30% (12,8% IR + 17,2% prélèvements sociaux)
	static readonly PFU_INCOME_TAX_RATE = 0.128; // 12,8% impôt sur le revenu
	static readonly SOCIAL_CHARGES_RATE = 0.172; // 17,2% prélèvements sociaux

	// Tranches d'imposition 2025 pour le barème progressif (option 2OP)
	// Source: https://www.service-public.fr/particuliers/vosdroits/F1352
	static readonly TAX_BRACKETS_2025 = [
		{ min: 0, max: 11294, rate: 0 }, // 0%
		{ min: 11294, max: 28797, rate: 0.11 }, // 11%
		{ min: 28797, max: 82341, rate: 0.30 }, // 30%
		{ min: 82341, max: 177106, rate: 0.41 }, // 41%
		{ min: 177106, max: Infinity, rate: 0.45 } // 45%
	];

	/**
	 * Calcule les impôts sur les plus-values mobilières
	 *
	 * Par défaut, utilise le PFU (Prélèvement Forfaitaire Unique) de 30%
	 * Si useProgressiveTax est true, utilise le barème progressif (option 2OP)
	 *
	 * @param gain Gain réalisé (plus-value)
	 * @param annualIncome Revenu annuel (pour calcul barème progressif)
	 * @param useProgressiveTax Si true, utilise le barème progressif au lieu du PFU
	 */
	static calculate(
		gain: number,
		annualIncome: number = 0,
		useProgressiveTax: boolean = false
	): TaxBreakdown {
		if (gain < 0) {
			logger.warn('Gain négatif, pas d\'impôt à calculer', { gain });
			return {
				socialCharges: 0,
				incomeTax: 0,
				total: 0
			};
		}

		if (useProgressiveTax) {
			// Option barème progressif (case 2OP)
			// Les prélèvements sociaux sont toujours appliqués
			const socialCharges = gain * this.SOCIAL_CHARGES_RATE;

			// Impôt sur le revenu selon le barème progressif avec détails des tranches
			const incomeTaxResult = this.calculateIncomeTax(gain, annualIncome);

			const total = socialCharges + incomeTaxResult.tax;

			logger.debug('Calcul impôts (barème progressif)', {
				gain,
				annualIncome,
				socialCharges,
				incomeTax: incomeTaxResult.tax,
				total,
				brackets: incomeTaxResult.brackets
			});

			return {
				socialCharges,
				incomeTax: incomeTaxResult.tax,
				total,
				taxBrackets: incomeTaxResult.brackets,
				taxRegime: 'PROGRESSIVE'
			};
		} else {
			// PFU (Prélèvement Forfaitaire Unique) - régime par défaut
			// 30% = 12,8% IR + 17,2% prélèvements sociaux
			const total = gain * this.PFU_RATE;
			const incomeTax = gain * this.PFU_INCOME_TAX_RATE;
			const socialCharges = gain * this.SOCIAL_CHARGES_RATE;

			logger.debug('Calcul impôts (PFU)', {
				gain,
				total,
				incomeTax,
				socialCharges
			});

			return {
				socialCharges,
				incomeTax,
				total,
				taxRegime: 'PFU'
			};
		}
	}

	/**
	 * Calcule l'impôt sur le revenu selon le barème progressif (option 2OP)
	 * Retourne également les détails des tranches
	 *
	 * @param gain Gain réalisé (plus-value)
	 * @param annualIncome Revenu annuel
	 * @returns Impôt supplémentaire dû sur le gain et détails des tranches
	 */
	private static calculateIncomeTax(
		gain: number,
		annualIncome: number
	): { tax: number; brackets: import('../types/index.js').TaxBracketDetail[] } {
		const totalIncome = annualIncome + gain;
		let tax = 0;
		const bracketDetails: import('../types/index.js').TaxBracketDetail[] = [];

		// Calcul de l'impôt sur le revenu total
		for (const bracket of this.TAX_BRACKETS_2025) {
			if (totalIncome > bracket.min) {
				const taxableAmount = Math.min(totalIncome, bracket.max) - bracket.min;
				const taxAmount = taxableAmount * bracket.rate;
				tax += taxAmount;

				if (taxableAmount > 0) {
					bracketDetails.push({
						min: bracket.min,
						max: bracket.max === Infinity ? 999999999 : bracket.max,
						rate: bracket.rate,
						taxableAmount,
						taxAmount
					});
				}
			}
			if (totalIncome <= bracket.max) break;
		}

		// On soustrait l'impôt déjà payé sur le revenu annuel
		let existingTax = 0;
		for (const bracket of this.TAX_BRACKETS_2025) {
			if (annualIncome > bracket.min) {
				const taxableAmount = Math.min(annualIncome, bracket.max) - bracket.min;
				existingTax += taxableAmount * bracket.rate;
			}
			if (annualIncome <= bracket.max) break;
		}

		const finalTax = Math.max(0, tax - existingTax);

		return {
			tax: finalTax,
			brackets: bracketDetails
		};
	}

	/**
	 * Calcule le gain net après impôts
	 */
	static calculateNetGain(grossGain: number, annualIncome: number = 0): number {
		const taxes = this.calculate(grossGain, annualIncome);
		return grossGain - taxes.total;
	}
}

