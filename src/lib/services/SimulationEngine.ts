/**
 * Moteur de simulation d'investissement
 *
 * Calcule la rentabilité nette selon différentes périodes en prenant en compte
 * tous les frais et impôts.
 *
 * Conformité Constitution: Principe I - Précision Financière, Principe III - Multi-Périodes
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

import type {
	SimulationResult,
	Period,
	OptimizationConstraints,
	OptimizationResult
} from '../types/index.js';
import { Investment } from '../models/Investment.js';
import { PlatformFees } from './PlatformFees.js';
import { TaxCalculator } from './TaxCalculator.js';
import { ValidationError, CalculationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class SimulationEngine {
	/**
	 * Calcule la rentabilité pour une période donnée
	 */
	static simulate(
		investment: Investment,
		period: Period = 'yearly',
		annualIncome: number = 0
	): SimulationResult {
		const validation = investment.validate();
		if (!validation.valid) {
			throw new ValidationError('Investissement invalide', validation.errors);
		}

		// Conversion de la période en nombre de jours
		const daysInPeriod = this.getDaysInPeriod(period);
		const daysInYear = 365;

		// Calcul du rendement pour la période
		const periodReturn = (investment.expectedReturn / 100) * (daysInPeriod / daysInYear);

		// IMPORTANT: Le bras de levier multiplie uniquement le gain/perte, pas le montant investi
		// Montant investi réel = investment.amount (sans levier)
		// Montant exposé au marché (pour info) = investment.amount * investment.leverage
		const leveragedAmount = investment.amount * investment.leverage; // Montant exposé au marché (pour info)

		// ============================================
		// CALCUL DES GAINS SUR LE CAPITAL INITIAL UNIQUEMENT
		// ============================================
		// IMPORTANT: La rentabilité (ROI) est calculée UNIQUEMENT sur le capital initial
		// Le capital additionnel génère des gains mais n'affecte PAS le calcul de rentabilité

		// Gain brut sur le capital initial uniquement (sans capital additionnel)
		const initialGrossGain = investment.amount * periodReturn * investment.leverage;

		// ============================================
		// CALCUL DU CAPITAL ADDITIONNEL (si applicable)
		// ============================================
		// Support de l'ancien système (monthlyCapitalAddition) et du nouveau (capitalAdditionAmount + capitalAdditionFrequency)
		const capitalAdditionAmount = investment.capitalAdditionAmount || investment.monthlyCapitalAddition || 0;
		const capitalAdditionFrequency = investment.capitalAdditionFrequency || (investment.monthlyCapitalAddition ? 'monthly' : undefined);

		let additionalCapitalAmount = 0;
		let additionalCapitalGain = 0;

		// Calculer le capital additionnel et ses gains selon la période et la fréquence
		if (capitalAdditionAmount > 0 && capitalAdditionFrequency) {
			if (period === 'yearly') {
				if (capitalAdditionFrequency === 'yearly') {
					// Ajout annuel : tout le capital est investi au début de l'année
					additionalCapitalAmount = capitalAdditionAmount;
					additionalCapitalGain = capitalAdditionAmount * periodReturn * investment.leverage;
				} else if (capitalAdditionFrequency === 'monthly') {
					// Ajout mensuel : 12 ajouts sur l'année
					const totalMonthlyAdditions = capitalAdditionAmount * 12;
					// Capital moyen additionnel investi sur l'année (approximation)
					const averageAdditionalCapital = totalMonthlyAdditions / 2;
					additionalCapitalAmount = totalMonthlyAdditions;
					additionalCapitalGain = averageAdditionalCapital * periodReturn * investment.leverage;
				} else if (capitalAdditionFrequency === 'weekly') {
					// Ajout hebdomadaire : ~52 ajouts sur l'année
					const totalWeeklyAdditions = capitalAdditionAmount * 52;
					const averageAdditionalCapital = totalWeeklyAdditions / 2;
					additionalCapitalAmount = totalWeeklyAdditions;
					additionalCapitalGain = averageAdditionalCapital * periodReturn * investment.leverage;
				} else if (capitalAdditionFrequency === 'daily') {
					// Ajout quotidien : 365 ajouts sur l'année
					const totalDailyAdditions = capitalAdditionAmount * 365;
					const averageAdditionalCapital = totalDailyAdditions / 2;
					additionalCapitalAmount = totalDailyAdditions;
					additionalCapitalGain = averageAdditionalCapital * periodReturn * investment.leverage;
				}
			} else if (period === 'monthly') {
				if (capitalAdditionFrequency === 'monthly') {
					additionalCapitalAmount = capitalAdditionAmount;
					additionalCapitalGain = capitalAdditionAmount * periodReturn * investment.leverage;
				} else if (capitalAdditionFrequency === 'weekly') {
					// ~4 ajouts hebdomadaires par mois
					additionalCapitalAmount = capitalAdditionAmount * 4;
					additionalCapitalGain = additionalCapitalAmount * periodReturn * investment.leverage;
				} else if (capitalAdditionFrequency === 'daily') {
					// ~30 ajouts quotidiens par mois
					additionalCapitalAmount = capitalAdditionAmount * 30;
					additionalCapitalGain = additionalCapitalAmount * periodReturn * investment.leverage;
				}
			} else if (period === 'weekly') {
				if (capitalAdditionFrequency === 'weekly') {
					additionalCapitalAmount = capitalAdditionAmount;
					additionalCapitalGain = capitalAdditionAmount * periodReturn * investment.leverage;
				} else if (capitalAdditionFrequency === 'daily') {
					// ~7 ajouts quotidiens par semaine
					additionalCapitalAmount = capitalAdditionAmount * 7;
					additionalCapitalGain = additionalCapitalAmount * periodReturn * investment.leverage;
				}
			} else if (period === 'daily') {
				if (capitalAdditionFrequency === 'daily') {
					additionalCapitalAmount = capitalAdditionAmount;
					additionalCapitalGain = capitalAdditionAmount * periodReturn * investment.leverage;
				}
			}
		}

		// Gain brut total (capital initial + capital additionnel) - pour information uniquement
		const grossGain = initialGrossGain + additionalCapitalGain;

		// ============================================
		// CALCUL DES FRAIS SUR LE CAPITAL INITIAL
		// ============================================
		// Calcul des frais de transaction (entrée) sur le capital initial uniquement
		const initialEntryFees = PlatformFees.calculate(
			investment.platform,
			investment.amount,
			investment.assetType,
			investment.leverage,
			0 // monthlyVolume - à implémenter si nécessaire
		);

		// Calcul des frais récurrents (swap overnight si levier > 1) sur le capital initial
		const initialSwapFees = this.calculateSwapFees(
			investment.amount, // Montant investi réel
			investment.leverage,
			daysInPeriod,
			investment.platform,
			investment.assetType
		);

		// ============================================
		// CALCUL DES FRAIS DE SORTIE/RÉACHAT (stabilisation)
		// ============================================
		// Vérifier si on doit vendre/réacheter selon sellFrequency (pour stabiliser les gains)
		const shouldSellForStabilization = this.shouldSellForStabilization(investment, period);
		const sellStrategy = investment.sellStrategy || 'reinvest'; // Par défaut: réinvestir
		let initialExitFees = 0;
		let initialReentryFees = 0;

		if (shouldSellForStabilization) {
			// Frais de sortie = spread à la vente sur le capital initial + gain initial
			const sellAmount = investment.amount + initialGrossGain;
			const exitFeeBreakdown = PlatformFees.calculate(
				investment.platform,
				sellAmount,
				investment.assetType,
				investment.leverage,
				0
			);
			initialExitFees = exitFeeBreakdown.spread || exitFeeBreakdown.entry;

			// Frais d'entrée supplémentaires pour le rachat après vente (si stratégie = réinvestir)
			if (sellStrategy === 'reinvest') {
				// Capital disponible après vente = capital initial + gain brut - frais d'entrée initiaux - frais de swap - frais de sortie
				// Note: Les frais d'entrée initiaux sont déjà payés au début, donc on les déduit du capital disponible
				const newCapitalAfterSale = investment.amount + initialGrossGain - initialEntryFees.total - initialSwapFees - initialExitFees;
				const reentryFeeBreakdown = PlatformFees.calculate(
					investment.platform,
					newCapitalAfterSale,
					investment.assetType,
					investment.leverage,
					0
				);
				initialReentryFees = reentryFeeBreakdown.entry;
			}
		}

		// ============================================
		// CALCUL DES FRAIS DE RÉINVESTISSEMENT
		// ============================================
		// Vérifier si on doit réinvestir les gains selon reinvestFrequency
		const shouldReinvest = this.shouldReinvestGains(investment, period);
		// Note: Le réinvestissement simple (garder les gains dans la position) ne génère pas de frais supplémentaires
		// Les frais de réinvestissement ne s'appliquent que si on vend/réachète (déjà géré par shouldSellForStabilization)
		let reinvestmentEntryFees = 0;

		// ============================================
		// CALCUL DES FRAIS DE RETRAIT (précalcul pour déterminer le gain net)
		// ============================================
		// Précalculer les frais de retrait si on retire (sera recalculé après impôts)
		// sellStrategy et shouldSellForStabilization sont déjà déclarés plus haut
		let preliminaryWithdrawalFees = 0;

		if (shouldSellForStabilization && sellStrategy === 'withdraw') {
			// Estimation des frais de retrait sur le gain net estimé (sera ajusté après impôts)
			const estimatedNetGain = initialGrossGain - initialEntryFees.total - initialExitFees - initialReentryFees - initialSwapFees;
			const estimatedTaxes = TaxCalculator.calculate(estimatedNetGain, annualIncome);
			const estimatedWithdrawalAmount = estimatedNetGain - estimatedTaxes.total;
			if (estimatedWithdrawalAmount > 0) {
				const platformFees = PlatformFees.calculate(
					investment.platform,
					estimatedWithdrawalAmount,
					investment.assetType,
					investment.leverage,
					0
				);
				preliminaryWithdrawalFees = platformFees.withdrawalFee || 0;
			}
		}

		// ============================================
		// CALCUL DES GAINS NETS SUR LE CAPITAL INITIAL
		// ============================================
		// Gain après frais sur le capital initial uniquement
		// Inclure tous les frais : entrée, sortie/réachat, réinvestissement, swap, retrait
		const initialGainAfterFees = initialGrossGain - initialEntryFees.total - initialExitFees - initialReentryFees - reinvestmentEntryFees - initialSwapFees - preliminaryWithdrawalFees;

		// Impôts sur les gains du capital initial uniquement
		const initialTaxes = TaxCalculator.calculate(initialGainAfterFees, annualIncome);

		// Gain net sur le capital initial uniquement (pour calcul ROI)
		const initialCapitalNetGain = initialGainAfterFees - initialTaxes.total;

		// ============================================
		// CALCUL DES FRAIS ET GAINS SUR LE CAPITAL ADDITIONNEL
		// ============================================
		let additionalCapitalFees = 0;
		let additionalCapitalSwapFees = 0;
		let additionalCapitalTaxes = { total: 0 } as import('../types/index.js').TaxBreakdown;
		let additionalCapitalNetGain = 0;

		if (additionalCapitalAmount > 0) {
			// Frais d'entrée sur le capital additionnel
			const additionEntryFees = PlatformFees.calculate(
				investment.platform,
				additionalCapitalAmount,
				investment.assetType,
				investment.leverage,
				0
			);
			additionalCapitalFees = additionEntryFees.total;

			// Frais de swap sur le capital additionnel
			additionalCapitalSwapFees = this.calculateSwapFees(
				additionalCapitalAmount,
				investment.leverage,
				daysInPeriod,
				investment.platform,
				investment.assetType
			);

			// Gain après frais sur le capital additionnel
			const additionGainAfterFees = additionalCapitalGain - additionalCapitalFees - additionalCapitalSwapFees;

			// Impôts sur les gains du capital additionnel
			additionalCapitalTaxes = TaxCalculator.calculate(additionGainAfterFees, annualIncome);

			// Gain net sur le capital additionnel
			additionalCapitalNetGain = additionGainAfterFees - additionalCapitalTaxes.total;
		}

		// ============================================
		// CALCUL DU STOP LOSS ET TAKE PROFIT
		// ============================================
		const stopLossPercentage = investment.stopLoss / 100;
		const stopLossAmount = investment.amount * stopLossPercentage;
		const potentialLoss = stopLossAmount * investment.leverage;

		let takeProfitInfo: { percentage: number; amount: number; potentialGain: number } | undefined;
		if (investment.takeProfit && investment.takeProfit > 0) {
			const takeProfitPercentage = investment.takeProfit / 100;
			const takeProfitAmount = investment.amount * takeProfitPercentage;
			const potentialGain = takeProfitAmount * investment.leverage;
			takeProfitInfo = {
				percentage: investment.takeProfit,
				amount: takeProfitAmount,
				potentialGain
			};
		}

		// ============================================
		// CALCUL DES TOTAUX (pour information)
		// ============================================
		// Totaux combinés (capital initial + capital additionnel)
		const totalFees = {
			entry: initialEntryFees.total + initialReentryFees + reinvestmentEntryFees + additionalCapitalFees,
			exit: initialExitFees,
			swap: initialSwapFees + additionalCapitalSwapFees,
			withdrawal: preliminaryWithdrawalFees,
			total: initialEntryFees.total + initialExitFees + initialReentryFees + reinvestmentEntryFees + initialSwapFees + additionalCapitalFees + additionalCapitalSwapFees + preliminaryWithdrawalFees
		};

		const totalTaxes = {
			socialCharges: initialTaxes.socialCharges + additionalCapitalTaxes.socialCharges,
			incomeTax: initialTaxes.incomeTax + additionalCapitalTaxes.incomeTax,
			total: initialTaxes.total + additionalCapitalTaxes.total,
			taxRegime: initialTaxes.taxRegime || 'PFU'
		};

		const totalNetGain = initialCapitalNetGain + additionalCapitalNetGain;

		// Nouveau capital total après réinvestissement et ajout de capital
		// Si on vend/réachète, le nouveau capital = capital après vente - frais de réentrée
		// Sinon, le nouveau capital = capital initial + gains nets
		let newCapital: number;
		if (shouldSellForStabilization && sellStrategy === 'reinvest') {
			// Après vente/réachat : capital initial + gain brut - tous les frais (entrée, swap, sortie, réentrée) - impôts
			newCapital = investment.amount + initialGrossGain - initialEntryFees.total - initialSwapFees - initialExitFees - initialReentryFees - initialTaxes.total + additionalCapitalAmount;
		} else if (shouldSellForStabilization && sellStrategy === 'withdraw') {
			// Si on retire, le capital reste au montant initial (les gains sont retirés moins les frais de retrait)
			// Les frais de retrait sont déduits du montant retiré
			newCapital = investment.amount + additionalCapitalAmount;
		} else {
			// Réinvestissement simple : capital initial + gains nets
			newCapital = investment.amount + totalNetGain + additionalCapitalAmount;
		}

		// Réinvestissement ou retrait selon la stratégie
		// Le réinvestissement = gain net conservé dans la position (pas de frais supplémentaires)
		// Si on vend/réachète, les frais sont déjà déduits dans initialCapitalNetGain
		// Les frais de retrait sont déjà déduits dans initialCapitalNetGain via preliminaryWithdrawalFees
		const reinvestment = (shouldSellForStabilization && sellStrategy === 'reinvest') || (shouldReinvest && !shouldSellForStabilization)
			? initialCapitalNetGain
			: 0;
		const withdrawal = shouldSellForStabilization && sellStrategy === 'withdraw'
			? initialCapitalNetGain // Les frais de retrait sont déjà déduits dans initialCapitalNetGain
			: 0;

		// ============================================
		// CALCUL DE LA RENTABILITÉ (ROI) - UNIQUEMENT SUR CAPITAL INITIAL
		// ============================================
		// IMPORTANT: La rentabilité est calculée UNIQUEMENT sur le capital initial
		// Le capital additionnel génère des gains mais n'affecte PAS le ROI
		const netReturn = investment.amount > 0 ? (initialCapitalNetGain / investment.amount) * 100 : 0;

		const result: SimulationResult = {
			investmentId: investment.id,
			period,
			daysInPeriod,
			initialAmount: investment.amount, // Capital initial uniquement
			leveragedAmount,
			grossGain: grossGain, // Gain brut total (capital initial + capital additionnel) - pour information
			// Gains séparés pour calcul de rentabilité précise
			initialCapitalGain: initialGrossGain, // Gain brut sur capital initial uniquement
			additionalCapitalGain: additionalCapitalAmount > 0 ? additionalCapitalGain : undefined,
			additionalCapitalAmount: additionalCapitalAmount > 0 ? additionalCapitalAmount : undefined,
			fees: totalFees,
			taxes: totalTaxes,
			netGain: totalNetGain, // Gain net total (capital initial + capital additionnel) - pour information
			initialCapitalNetGain: initialCapitalNetGain, // Gain net sur capital initial uniquement (pour calcul ROI)
			netReturn: netReturn, // Rentabilité nette calculée UNIQUEMENT sur le capital initial
			newCapital,
			reinvestment,
			withdrawal: withdrawal > 0 ? withdrawal : undefined,
			stopLoss: {
				percentage: investment.stopLoss,
				amount: stopLossAmount,
				potentialLoss
			},
			takeProfit: takeProfitInfo,
			calculatedAt: new Date()
		};

		logger.info('Simulation calculée', {
			investmentId: investment.id,
			period,
			netGain: totalNetGain,
			initialCapitalNetGain: initialCapitalNetGain,
			netReturn: result.netReturn,
			additionalCapitalAmount,
			additionalCapitalGain
		});

		return result;
	}

	/**
	 * Calcule les résultats pour toutes les périodes
	 */
	static simulateAllPeriods(
		investment: Investment,
		annualIncome: number = 0
	): Record<Period, SimulationResult> {
		const periods: Period[] = ['daily', 'weekly', 'monthly', 'yearly'];
		const results: Partial<Record<Period, SimulationResult>> = {};

		for (const period of periods) {
			results[period] = this.simulate(investment, period, annualIncome);
		}

		return results as Record<Period, SimulationResult>;
	}

	/**
	 * Simule plusieurs périodes consécutives pour afficher l'évolution temporelle
	 * @param investment Investissement initial
	 * @param period Période à simuler (daily, weekly, monthly, yearly)
	 * @param numberOfPeriods Nombre de périodes à simuler
	 * @param annualIncome Revenu annuel pour le calcul des impôts
	 * @returns Tableau de résultats pour chaque période
	 */
	static simulateConsecutivePeriods(
		investment: Investment,
		period: Period,
		numberOfPeriods: number,
		annualIncome: number = 0
	): SimulationResult[] {
		const results: SimulationResult[] = [];
		let currentInvestment = investment.clone();
		let cumulativeCapital = investment.amount;

		for (let i = 0; i < numberOfPeriods; i++) {
			// Simuler la période avec le capital actuel
			const result = this.simulate(currentInvestment, period, annualIncome);
			results.push(result);

			// Mettre à jour le capital pour la prochaine période
			// Le nouveau capital inclut les gains nets et le capital additionnel
			cumulativeCapital = result.newCapital;

			// Créer un nouvel investissement avec le capital mis à jour pour la période suivante
			// On garde les mêmes paramètres mais on met à jour le montant initial
			currentInvestment = new Investment({
				...currentInvestment.toJSON(),
				amount: cumulativeCapital
			});
		}

		return results;
	}

	/**
	 * Calcule les frais de swap overnight
	 */
	private static calculateSwapFees(
		leveragedAmount: number,
		leverage: number,
		days: number,
		platform: 'xtb' | 'etoro',
		assetType: 'action' | 'fonds' | 'etf'
	): number {
		if (leverage <= 1) return 0;

		const fees = PlatformFees.calculate(platform, leveragedAmount, assetType, leverage, 0);
		const dailySwapRate = fees.swapRate || 0;

		return leveragedAmount * dailySwapRate * days;
	}

	/**
	 * Convertit une période en nombre de jours
	 */
	static getDaysInPeriod(period: Period): number {
		const mapping: Record<Period, number> = {
			daily: 1,
			weekly: 7,
			monthly: 30,
			yearly: 365
		};
		return mapping[period] || 365;
	}

	/**
	 * Détermine si on doit vendre/réacheter selon la fréquence de sortie pour stabiliser les gains
	 * Utilise sellFrequency si défini, sinon utilise reinvestFrequency
	 */
	static shouldSellAndReinvest(investment: Investment, period: Period): boolean {
		// Pour compatibilité avec l'ancien code
		return this.shouldSellForStabilization(investment, period);
	}

	/**
	 * Détermine si on doit vendre/réacheter pour stabiliser les gains selon sellFrequency
	 */
	static shouldSellForStabilization(investment: Investment, period: Period): boolean {
		// Utiliser sellFrequency si défini, sinon utiliser reinvestFrequency comme fallback
		const sellFreq = investment.sellFrequency !== undefined
			? investment.sellFrequency
			: investment.reinvestFrequency;

		// Si 'none', ne pas vendre/réacheter
		if (sellFreq === 'none') {
			return false;
		}

		// Si c'est un tableau, vérifier si la période est dans le tableau
		if (Array.isArray(sellFreq)) {
			return sellFreq.length > 0 && sellFreq.includes(period);
		}

		// Si c'est une seule fréquence (string), comparer directement
		return sellFreq === period;
	}

	/**
	 * Détermine si on doit réinvestir les gains selon reinvestFrequency
	 */
	static shouldReinvestGains(investment: Investment, period: Period): boolean {
		const reinvestFreq = investment.reinvestFrequency;

		// Si 'none', ne pas réinvestir
		if (reinvestFreq === 'none') {
			return false;
		}

		// Si c'est un tableau, vérifier si la période est dans le tableau
		if (Array.isArray(reinvestFreq)) {
			return reinvestFreq.length > 0 && reinvestFreq.includes(period);
		}

		// Si c'est une seule fréquence (string), comparer directement
		return reinvestFreq === period;
	}

	/**
	 * Détermine si on doit réinvestir selon la fréquence (pour compatibilité)
	 * @deprecated Utiliser shouldSellAndReinvest à la place
	 */
	static shouldReinvest(investment: Investment, period: Period): boolean {
		const reinvestFreq = investment.reinvestFrequency;

		// Si 'none', ne pas réinvestir
		if (reinvestFreq === 'none') {
			return false;
		}

		// Si c'est un tableau, vérifier si la période est dans le tableau
		if (Array.isArray(reinvestFreq)) {
			return reinvestFreq.includes(period);
		}

		// Si c'est une seule fréquence (string), comparer directement
		return reinvestFreq === period;
	}

	/**
	 * Optimise les paramètres d'investissement
	 *
	 * Compare différents scénarios pour trouver le meilleur compromis entre:
	 * - Rentabilité nette maximale
	 * - Minimisation des frais
	 * - Gestion du risque (stop loss)
	 * - Efficacité fiscale
	 *
	 * @param constraints Contraintes d'optimisation
	 * @param baseInvestment Investissement de base pour comparaison
	 * @param annualIncome Revenu annuel pour calcul des impôts
	 */
	static optimize(
		constraints: OptimizationConstraints = {},
		baseInvestment?: Investment,
		annualIncome: number = 15000
	): OptimizationResult & {
		justifications: {
			amount: string;
			leverage: string;
			reinvestFrequency: string;
			stopLoss: string;
		};
		comparison: {
			currentNetReturn: number;
			optimizedNetReturn: number;
			improvement: number;
		};
	} {
		logger.info('Optimisation des paramètres', { constraints, baseInvestment });

		// Valeurs par défaut basées sur l'investissement actuel ou des valeurs raisonnables
		const baseAmount = baseInvestment?.amount || constraints.maxAmount || 2000;
		const baseLeverage = baseInvestment?.leverage || 1;
		const baseExpectedReturn = baseInvestment?.expectedReturn || 10;
		const basePlatform = baseInvestment?.platform || 'etoro';
		const baseAssetType = baseInvestment?.assetType || 'etf';

		// Test de différents montants (de 50% à 200% du montant de base)
		let bestAmount = baseAmount;
		let bestAmountReturn = 0;
		const amountsToTest = [
			baseAmount * 0.5,
			baseAmount * 0.75,
			baseAmount,
			baseAmount * 1.5,
			constraints.maxAmount ? Math.min(baseAmount * 2, constraints.maxAmount) : baseAmount * 2
		].filter(amt => amt >= 100 && (!constraints.maxAmount || amt <= constraints.maxAmount));

		for (const amount of amountsToTest) {
			const testInvestment = new Investment({
				amount,
				assetType: baseAssetType,
				platform: basePlatform,
				leverage: baseLeverage,
				stopLoss: 5,
				expectedReturn: baseExpectedReturn,
				reinvestFrequency: 'monthly'
			});
			const result = this.simulate(testInvestment, 'yearly', annualIncome);
			if (result.netReturn > bestAmountReturn) {
				bestAmountReturn = result.netReturn;
				bestAmount = amount;
			}
		}

		// Test de différents leviers (de 1x à maxRisk)
		const maxLeverage = Math.min(constraints.maxRisk || 5, 10);
		let bestLeverage = Math.min(baseLeverage, maxLeverage);
		let bestLeverageReturn = 0;
		const leveragesToTest = [1, 2, 3, 4, 5, 7, 10].filter(l => l <= maxLeverage);

		for (const leverage of leveragesToTest) {
			const testInvestment = new Investment({
				amount: bestAmount,
				assetType: baseAssetType,
				platform: basePlatform,
				leverage,
				stopLoss: 5,
				expectedReturn: baseExpectedReturn,
				reinvestFrequency: 'monthly'
			});
			const result = this.simulate(testInvestment, 'yearly', annualIncome);
			// Pénaliser les leviers très élevés pour le risque
			const riskPenalty = leverage > 5 ? 0.9 : leverage > 3 ? 0.95 : 1;
			const adjustedReturn = result.netReturn * riskPenalty;
			if (adjustedReturn > bestLeverageReturn) {
				bestLeverageReturn = adjustedReturn;
				bestLeverage = leverage;
			}
		}

		// Test de différentes fréquences de réinvestissement
		// IMPORTANT: Il faut simuler une année complète pour chaque fréquence
		// car les frais de sortie (spread à chaque vente) peuvent être très élevés
		// pour les fréquences quotidiennes/hebdomadaires
		let bestFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly';
		let bestFrequencyReturn = -Infinity;
		const frequencies: ('daily' | 'weekly' | 'monthly' | 'yearly')[] = ['daily', 'weekly', 'monthly', 'yearly'];

		for (const frequency of frequencies) {
			const testInvestment = new Investment({
				amount: bestAmount,
				assetType: baseAssetType,
				platform: basePlatform,
				leverage: bestLeverage,
				stopLoss: 5,
				expectedReturn: baseExpectedReturn,
				reinvestFrequency: frequency
			});

			// Simuler une année complète avec réinvestissement selon la fréquence
			// Pour chaque fréquence, on simule les périodes correspondantes sur 1 an
			let currentAmount = bestAmount;
			let totalFees = 0;
			let totalGains = 0;

			if (frequency === 'yearly') {
				// Réinvestissement annuel : une seule simulation annuelle
				const yearlyResult = this.simulate(testInvestment, 'yearly', annualIncome);
				totalGains = yearlyResult.netGain;
				totalFees = yearlyResult.fees.total;
				currentAmount = yearlyResult.newCapital;
			} else if (frequency === 'monthly') {
				// Réinvestissement mensuel : 12 simulations mensuelles
				for (let month = 0; month < 12; month++) {
					const monthInvestment = new Investment({ ...testInvestment, amount: currentAmount });
					const monthlyResult = this.simulate(monthInvestment, 'monthly', annualIncome);
					totalGains += monthlyResult.netGain;
					totalFees += monthlyResult.fees.total;
					currentAmount = monthlyResult.newCapital;
				}
			} else if (frequency === 'weekly') {
				// Réinvestissement hebdomadaire : ~52 simulations hebdomadaires
				const weeksInYear = 52;
				for (let week = 0; week < weeksInYear; week++) {
					const weekInvestment = new Investment({ ...testInvestment, amount: currentAmount });
					const weeklyResult = this.simulate(weekInvestment, 'weekly', annualIncome);
					totalGains += weeklyResult.netGain;
					totalFees += weeklyResult.fees.total;
					currentAmount = weeklyResult.newCapital;
				}
			} else if (frequency === 'daily') {
				// Réinvestissement quotidien : 365 simulations quotidiennes
				// ATTENTION: Cela génère beaucoup de frais de sortie !
				const daysInYear = 365;
				for (let day = 0; day < daysInYear; day++) {
					const dayInvestment = new Investment({ ...testInvestment, amount: currentAmount });
					const dailyResult = this.simulate(dayInvestment, 'daily', annualIncome);
					totalGains += dailyResult.netGain;
					totalFees += dailyResult.fees.total;
					currentAmount = dailyResult.newCapital;
				}
			}

			// Calculer la rentabilité nette annuelle avec tous les frais inclus
			const annualNetReturn = bestAmount > 0 ? (totalGains / bestAmount) * 100 : 0;

			logger.debug('Comparaison fréquence de réinvestissement', {
				frequency,
				annualNetReturn,
				totalFees,
				totalGains,
				finalAmount: currentAmount
			});

			if (annualNetReturn > bestFrequencyReturn) {
				bestFrequencyReturn = annualNetReturn;
				bestFrequency = frequency;
			}
		}

		// Stop loss optimal: équilibre entre protection et flexibilité
		// Pour un levier élevé, un stop loss plus serré est recommandé
		const optimalStopLoss = bestLeverage > 5 ? 5 : bestLeverage > 3 ? 7 : 10;

		// Calcul de la rentabilité optimisée
		const optimizedInvestment = new Investment({
			amount: bestAmount,
			assetType: baseAssetType,
			platform: basePlatform,
			leverage: bestLeverage,
			stopLoss: optimalStopLoss,
			expectedReturn: baseExpectedReturn,
			reinvestFrequency: bestFrequency
		});
		const optimizedResult = this.simulate(optimizedInvestment, 'yearly', annualIncome);

		// Calcul de la rentabilité actuelle pour comparaison
		let currentNetReturn = 0;
		if (baseInvestment) {
			const currentResult = this.simulate(baseInvestment, 'yearly', annualIncome);
			currentNetReturn = currentResult.netReturn;
		}

		// Génération des justifications
		const justifications = {
			amount: this.generateAmountJustification(bestAmount, baseAmount, bestAmountReturn, basePlatform),
			leverage: this.generateLeverageJustification(bestLeverage, baseLeverage, bestLeverageReturn, bestAmount),
			reinvestFrequency: this.generateFrequencyJustification(bestFrequency, bestFrequencyReturn),
			stopLoss: this.generateStopLossJustification(optimalStopLoss, bestLeverage)
		};

		return {
			amount: bestAmount,
			leverage: bestLeverage,
			reinvestFrequency: bestFrequency,
			stopLoss: optimalStopLoss,
			justifications,
			comparison: {
				currentNetReturn,
				optimizedNetReturn: optimizedResult.netReturn,
				improvement: optimizedResult.netReturn - currentNetReturn
			}
		};
	}

	/**
	 * Génère la justification pour le montant optimal
	 */
	private static generateAmountJustification(
		optimalAmount: number,
		currentAmount: number,
		netReturn: number,
		platform: 'xtb' | 'etoro'
	): string {
		const diff = optimalAmount - currentAmount;
		const diffPercent = ((optimalAmount - currentAmount) / currentAmount) * 100;

		if (Math.abs(diffPercent) < 5) {
			return `Le montant actuel (${currentAmount.toFixed(0)}€) est déjà optimal. Il maximise la rentabilité nette tout en restant sous la limite de commission gratuite de ${platform === 'xtb' ? '100 000€/mois' : 'sans limite'} sur ${platform.toUpperCase()}.`;
		}

		if (diff > 0) {
			return `Augmenter le montant à ${optimalAmount.toFixed(0)}€ (+${diffPercent.toFixed(0)}%) permettrait d'optimiser la rentabilité nette à ${netReturn.toFixed(2)}% annuel. Ce montant reste sous la limite de commission gratuite de ${platform === 'xtb' ? '100 000€/mois' : 'sans limite'} sur ${platform.toUpperCase()}, minimisant ainsi les frais.`;
		} else {
			return `Réduire le montant à ${optimalAmount.toFixed(0)}€ (${Math.abs(diffPercent).toFixed(0)}%) optimise le ratio rentabilité/risque. Avec ce montant, vous maximisez la rentabilité nette tout en limitant l'exposition au risque.`;
		}
	}

	/**
	 * Génère la justification pour le levier optimal
	 */
	private static generateLeverageJustification(
		optimalLeverage: number,
		currentLeverage: number,
		netReturn: number,
		amount: number
	): string {
		const exposedAmount = amount * optimalLeverage;

		if (optimalLeverage === 1) {
			return `Un levier de 1x (pas de levier) est recommandé pour minimiser les risques et les frais de swap. Bien que la rentabilité soit plus faible, cela offre une meilleure stabilité et moins de volatilité.`;
		} else if (optimalLeverage <= 3) {
			return `Un levier de ${optimalLeverage}x est optimal car il multiplie les gains sans augmenter excessivement les frais de swap. Avec ${amount.toFixed(0)}€ investis, vous êtes exposé à ${exposedAmount.toFixed(0)}€ sur le marché, ce qui offre un bon équilibre risque/rendement.`;
		} else if (optimalLeverage <= 5) {
			return `Un levier de ${optimalLeverage}x maximise la rentabilité nette (${netReturn.toFixed(2)}% annuel) tout en restant dans une zone de risque modéré. Attention: les frais de swap augmentent avec le levier (calculés sur ${exposedAmount.toFixed(0)}€ exposés).`;
		} else {
			return `Un levier de ${optimalLeverage}x est proposé pour maximiser les gains potentiels, mais cela augmente significativement les risques et les frais de swap (calculés sur ${exposedAmount.toFixed(0)}€ exposés). Assurez-vous de bien comprendre les mécanismes et d'avoir un stop loss adapté.`;
		}
	}

	/**
	 * Génère la justification pour la fréquence de réinvestissement
	 */
	private static generateFrequencyJustification(
		frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
		returnRate: number
	): string {
		const labels: Record<string, string> = {
			daily: 'quotidien',
			weekly: 'hebdomadaire',
			monthly: 'mensuel',
			yearly: 'annuel'
		};

		// Calculer le nombre de transactions par an pour cette fréquence
		const transactionsPerYear: Record<'daily' | 'weekly' | 'monthly' | 'yearly', number> = {
			daily: 365,
			weekly: 52,
			monthly: 12,
			yearly: 1
		};

		const transactions = transactionsPerYear[frequency];

		// Explication détaillée selon la fréquence avec prise en compte des frais de sortie
		if (frequency === 'daily') {
			return `⚠️ ATTENTION: Une fréquence quotidienne (${transactions} transactions/an) génère ${transactions} frais de sortie par an (spread à chaque vente). Malgré cela, cette fréquence maximise la rentabilité nette à ${returnRate.toFixed(2)}% annuel. Cependant, les frais de transaction cumulés sont très élevés et peuvent réduire significativement vos gains. Une fréquence mensuelle ou hebdomadaire est généralement plus rentable en tenant compte de tous les frais.`;
		} else if (frequency === 'weekly') {
			return `Une fréquence hebdomadaire (${transactions} transactions/an) génère ${transactions} frais de sortie par an. Cette fréquence maximise la rentabilité nette à ${returnRate.toFixed(2)}% annuel en optimisant le compromis entre capitalisation des gains et minimisation des frais de transaction. Les frais de sortie sont modérés comparés à une fréquence quotidienne.`;
		} else if (frequency === 'monthly') {
			return `Une fréquence mensuelle (${transactions} transactions/an) génère ${transactions} frais de sortie par an. Cette fréquence maximise la rentabilité nette à ${returnRate.toFixed(2)}% annuel. C'est généralement le meilleur compromis entre capitalisation des gains et minimisation des frais de transaction, car les frais de sortie restent raisonnables tout en permettant une capitalisation régulière.`;
		} else {
			return `Une fréquence annuelle (${transactions} transaction/an) génère seulement ${transactions} frais de sortie par an. Cette fréquence maximise la rentabilité nette à ${returnRate.toFixed(2)}% annuel en minimisant les frais de transaction. Cependant, vous capitalisez moins souvent vos gains, ce qui peut réduire la croissance à long terme.`;
		}
	}

	/**
	 * Génère la justification pour le stop loss
	 */
	private static generateStopLossJustification(
		stopLoss: number,
		leverage: number
	): string {
		if (stopLoss === 5) {
			return `Un stop loss à 5% est recommandé car c'est le minimum sécuritaire. Avec un levier de ${leverage}x, cela limite la perte maximale à ${(stopLoss * leverage).toFixed(0)}% du montant investi, offrant une protection essentielle contre les mouvements défavorables du marché.`;
		} else if (stopLoss <= 7) {
			return `Un stop loss à ${stopLoss}% offre une protection serrée adaptée à un levier de ${leverage}x. Cela limite la perte maximale à ${(stopLoss * leverage).toFixed(0)}% du montant investi tout en laissant une marge de manœuvre pour les fluctuations normales du marché.`;
		} else {
			return `Un stop loss à ${stopLoss}% offre une protection modérée. Avec un levier de ${leverage}x, la perte maximale serait de ${(stopLoss * leverage).toFixed(0)}% du montant investi. Cette marge plus large réduit le risque de sortie prématurée lors de volatilité normale.`;
		}
	}
}

