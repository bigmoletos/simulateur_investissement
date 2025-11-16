/**
 * Modèle de données pour un investissement
 *
 * Conformité Constitution: Principe I - Précision Financière
 * Validation stricte des données avant calcul
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

import { v4 as uuidv4 } from 'uuid';
import type { Investment as InvestmentType, ValidationResult, FrequencySelection, ReinvestFrequency } from '../types/index.js';
import { validateInvestment } from '../validators/schemas.js';

export class Investment implements InvestmentType {
	id: string;
	amount: number;
	assetType: 'action' | 'fonds' | 'etf';
	platform: 'xtb' | 'etoro';
	leverage: number;
	stopLoss: number;
	takeProfit?: number;
	expectedReturn: number;
	reinvestFrequency: ReinvestFrequency | FrequencySelection; // Fréquence(s) de réinvestissement (peut être un tableau ou 'none')
	sellFrequency?: ReinvestFrequency | FrequencySelection; // Fréquence(s) de sortie/réachat pour stabiliser les gains
	sellStrategy?: 'reinvest' | 'withdraw';
	capitalAdditionAmount?: number;
	capitalAdditionFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
	monthlyCapitalAddition?: number; // Rétrocompatibilité
	createdAt: Date;
	updatedAt: Date;
	name?: string;

	constructor(data: Partial<InvestmentType> = {}) {
		this.id = data.id || uuidv4();
		this.amount = data.amount || 0;
		this.assetType = data.assetType || 'action';
		this.platform = data.platform || 'etoro';
		this.leverage = data.leverage || 1;
		this.stopLoss = data.stopLoss || 5;
		this.takeProfit = data.takeProfit !== undefined ? data.takeProfit : 100; // Par défaut: 100%
		this.expectedReturn = data.expectedReturn || 0;
		// Gérer la rétrocompatibilité: convertir une seule fréquence en tableau si nécessaire
		const defaultReinvest = data.reinvestFrequency || 'monthly';
		this.reinvestFrequency = Array.isArray(defaultReinvest) || defaultReinvest === 'none'
			? defaultReinvest
			: defaultReinvest; // Conserver l'ancien format pour rétrocompatibilité
		this.sellFrequency = data.sellFrequency; // Par défaut: undefined (utilise reinvestFrequency)
		this.sellStrategy = data.sellStrategy || 'reinvest';
		this.capitalAdditionAmount = data.capitalAdditionAmount;
		this.capitalAdditionFrequency = data.capitalAdditionFrequency;
		this.monthlyCapitalAddition = data.monthlyCapitalAddition;
		this.createdAt = data.createdAt || new Date();
		this.updatedAt = data.updatedAt || new Date();
		this.name = data.name;
	}

	/**
	 * Valide les données de l'investissement
	 * @returns Résultat de validation
	 */
	validate(): ValidationResult {
		return validateInvestment(this);
	}

	/**
	 * Met à jour l'investissement
	 */
	update(data: Partial<InvestmentType>): void {
		Object.assign(this, data);
		this.updatedAt = new Date();
	}

	/**
	 * Clone l'investissement
	 */
	clone(): Investment {
		return new Investment({ ...this });
	}

	/**
	 * Convertit l'investissement en objet JSON pour sérialisation
	 */
	toJSON(): Partial<InvestmentType> {
		return {
			id: this.id,
			amount: this.amount,
			assetType: this.assetType,
			platform: this.platform,
			leverage: this.leverage,
			stopLoss: this.stopLoss,
			takeProfit: this.takeProfit,
			expectedReturn: this.expectedReturn,
			reinvestFrequency: this.reinvestFrequency,
			sellFrequency: this.sellFrequency,
			sellStrategy: this.sellStrategy,
			capitalAdditionAmount: this.capitalAdditionAmount,
			capitalAdditionFrequency: this.capitalAdditionFrequency,
			monthlyCapitalAddition: this.monthlyCapitalAddition,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			name: this.name
		};
	}
}

