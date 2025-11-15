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

		// Gain brut avant frais et impôts
		// Le levier multiplie uniquement le gain, pas le montant investi
		const grossGain = investment.amount * periodReturn * investment.leverage;

		// Calcul des frais de transaction (entrée)
		// Note: monthlyVolume = 0 par défaut (on ne suit pas le volume mensuel pour l'instant)
		const entryFees = PlatformFees.calculate(
			investment.platform,
			investment.amount,
			investment.assetType,
			investment.leverage,
			0 // monthlyVolume - à implémenter si nécessaire
		);

		// Calcul des frais récurrents (swap overnight si levier > 1)
		// Les frais de swap sont calculés sur le montant exposé au marché
		const swapFees = this.calculateSwapFees(
			investment.amount, // Montant investi réel
			investment.leverage,
			daysInPeriod,
			investment.platform,
			investment.assetType
		);

		// Calcul des frais de sortie si on vend pour réinvestir
		// Si la fréquence de réinvestissement correspond à la période, on vend et rachète
		const shouldSellAndReinvest = this.shouldReinvest(investment, period);
		let exitFees = 0;
		if (shouldSellAndReinvest) {
			// Frais de sortie = spread à la vente (même taux qu'à l'entrée)
			// Le montant vendu = montant investi initial + gain brut
			const sellAmount = investment.amount + grossGain;
			const exitFeeBreakdown = PlatformFees.calculate(
				investment.platform,
				sellAmount,
				investment.assetType,
				investment.leverage,
				0
			);
			exitFees = exitFeeBreakdown.spread || exitFeeBreakdown.entry;
			
			// Frais d'entrée supplémentaires pour le rachat après vente
			// Le nouveau capital = montant initial + gain net après frais de sortie
			const newCapitalAfterSale = investment.amount + grossGain - swapFees - exitFees;
			const reentryFees = PlatformFees.calculate(
				investment.platform,
				newCapitalAfterSale,
				investment.assetType,
				investment.leverage,
				0
			);
			// Ajouter les frais d'entrée du rachat aux frais d'entrée initiaux
			entryFees.entry += reentryFees.entry;
			entryFees.total += reentryFees.entry;
			entryFees.spread = (entryFees.spread || 0) + (reentryFees.spread || 0);
			entryFees.commission = (entryFees.commission || 0) + (reentryFees.commission || 0);
		}

		// Gain après frais de transaction (entrée, sortie si applicable, et swap)
		const gainAfterFees = grossGain - entryFees.total - exitFees - swapFees;

		// Calcul des impôts sur le gain
		const taxes = TaxCalculator.calculate(gainAfterFees, annualIncome);

		// Gain net final
		const netGain = gainAfterFees - taxes.total;

		// Calcul du stop loss
		// Le stop loss s'applique sur le montant investi, mais la perte est multipliée par le levier
		const stopLossPercentage = investment.stopLoss / 100;
		const stopLossAmount = investment.amount * stopLossPercentage; // Perte sur le montant investi
		const potentialLoss = stopLossAmount * investment.leverage; // Perte réelle avec levier

		// Capital mensuel supplémentaire (si applicable et période mensuelle ou plus)
		const monthlyAddition = investment.monthlyCapitalAddition || 0;
		const capitalAddition = period === 'monthly' || period === 'yearly'
			? monthlyAddition * (period === 'yearly' ? 12 : 1)
			: 0;

		// Nouveau capital après réinvestissement et ajout mensuel
		const newCapital = investment.amount + netGain + capitalAddition;

		// Réinvestissement selon la fréquence
		const reinvestment = this.shouldReinvest(investment, period) ? netGain : 0;

		const result: SimulationResult = {
			investmentId: investment.id,
			period,
			daysInPeriod,
			initialAmount: investment.amount,
			leveragedAmount,
			grossGain,
			fees: {
				entry: entryFees.total,
				exit: exitFees,
				swap: swapFees,
				total: entryFees.total + exitFees + swapFees
			},
			taxes,
			netGain,
			netReturn: investment.amount > 0 ? (netGain / investment.amount) * 100 : 0,
			newCapital,
			reinvestment,
			stopLoss: {
				percentage: investment.stopLoss,
				amount: stopLossAmount,
				potentialLoss
			},
			calculatedAt: new Date()
		};

		logger.info('Simulation calculée', { investmentId: investment.id, period, netGain, netReturn: result.netReturn });

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
	 * Détermine si on doit réinvestir selon la fréquence
	 */
	static shouldReinvest(investment: Investment, period: Period): boolean {
		return investment.reinvestFrequency === period;
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
		annualIncome: number = 30000
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
		const basePlatform = baseInvestment?.platform || 'xtb';
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
		let bestFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly';
		let bestFrequencyReturn = 0;
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
			// Simuler plusieurs périodes pour voir l'effet du réinvestissement
			const monthlyResult = this.simulate(testInvestment, 'monthly', annualIncome);
			const reinvestedAmount = testInvestment.amount + monthlyResult.netGain;
			const secondMonthInvestment = new Investment({ ...testInvestment, amount: reinvestedAmount });
			const secondMonthResult = this.simulate(secondMonthInvestment, 'monthly', annualIncome);
			const totalReturn = ((reinvestedAmount + secondMonthResult.netGain - testInvestment.amount) / testInvestment.amount) * 100;

			if (totalReturn > bestFrequencyReturn) {
				bestFrequencyReturn = totalReturn;
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

		if (frequency === 'daily') {
			return `Un réinvestissement quotidien maximise l'effet de la capitalisation composée, permettant une croissance exponentielle des gains. Cependant, cela nécessite une attention quotidienne et peut générer plus de frais de transaction si vous réinvestissez manuellement.`;
		} else if (frequency === 'weekly') {
			return `Un réinvestissement hebdomadaire offre un bon compromis entre capitalisation composée et praticité. Il permet de capturer les gains régulièrement tout en évitant une gestion trop fréquente.`;
		} else if (frequency === 'monthly') {
			return `Un réinvestissement mensuel est recommandé car il équilibre l'effet de capitalisation composée avec la simplicité de gestion. C'est la fréquence la plus pratique pour la plupart des investisseurs et permet de réinvestir les gains sans surcharge administrative.`;
		} else {
			return `Un réinvestissement annuel est proposé pour simplifier la gestion. Bien que moins optimal en termes de capitalisation composée, cela réduit la complexité et peut être plus adapté si vous préférez une approche "set and forget".`;
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

