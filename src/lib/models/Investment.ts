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
import type { Investment as InvestmentType, ValidationResult } from '../types/index.js';
import { validateInvestment } from '../validators/schemas.js';

export class Investment implements InvestmentType {
	id: string;
	amount: number;
	assetType: 'action' | 'fonds' | 'etf';
	platform: 'xtb' | 'etoro';
	leverage: number;
	stopLoss: number;
	expectedReturn: number;
	reinvestFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
	monthlyCapitalAddition?: number;
	createdAt: Date;
	updatedAt: Date;
	name?: string;

	constructor(data: Partial<InvestmentType> = {}) {
		this.id = data.id || uuidv4();
		this.amount = data.amount || 0;
		this.assetType = data.assetType || 'action';
		this.platform = data.platform || 'xtb';
		this.leverage = data.leverage || 1;
		this.stopLoss = data.stopLoss || 5;
		this.expectedReturn = data.expectedReturn || 0;
		this.reinvestFrequency = data.reinvestFrequency || 'monthly';
		this.monthlyCapitalAddition = data.monthlyCapitalAddition || 0;
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
}

