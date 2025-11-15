/**
 * Moteur de simulation d'investissement
 *
 * Calcule la rentabilité nette selon différentes périodes en prenant en compte
 * tous les frais et impôts.
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

import { PlatformFees } from './PlatformFees.js';
import { TaxCalculator } from './TaxCalculator.js';

export class SimulationEngine {
  /**
   * Calcule la rentabilité pour une période donnée
   * @param {Object} investment - Objet Investment
   * @param {string} period - 'daily', 'weekly', 'monthly', 'yearly'
   * @param {number} annualIncome - Revenu annuel pour le calcul des impôts
   * @returns {Object} Résultats de la simulation
   */
  static simulate(investment, period = 'yearly', annualIncome = 0) {
    const validation = investment.validate();
    if (!validation.valid) {
      throw new Error(`Investissement invalide: ${validation.errors.join(', ')}`);
    }

    // Conversion de la période en nombre de jours
    const daysInPeriod = this.getDaysInPeriod(period);
    const daysInYear = 365;

    // Calcul du rendement pour la période
    const periodReturn = (investment.expectedReturn / 100) * (daysInPeriod / daysInYear);

    // Montant investi avec levier
    const leveragedAmount = investment.amount * investment.leverage;

    // Gain brut avant frais et impôts
    const grossGain = leveragedAmount * periodReturn;

    // Calcul des frais de transaction (entrée)
    const entryFees = PlatformFees.calculate(
      investment.amount,
      investment.assetType,
      investment.leverage
    );

    // Calcul des frais récurrents (swap overnight si levier > 1)
    const swapFees = this.calculateSwapFees(
      leveragedAmount,
      investment.leverage,
      daysInPeriod,
      investment.platform
    );

    // Gain après frais de transaction
    const gainAfterFees = grossGain - entryFees.total - swapFees;

    // Calcul des impôts sur le gain
    const taxes = TaxCalculator.calculate(gainAfterFees, annualIncome);

    // Gain net final
    const netGain = gainAfterFees - taxes.total;

    // Calcul du stop loss
    const stopLossAmount = leveragedAmount * (investment.stopLoss / 100);
    const potentialLoss = Math.min(stopLossAmount, leveragedAmount - investment.amount);

    // Nouveau capital après réinvestissement (si applicable)
    const newCapital = investment.amount + netGain;

    return {
      period,
      daysInPeriod,
      initialAmount: investment.amount,
      leveragedAmount,
      grossGain,
      fees: {
        entry: entryFees.total,
        swap: swapFees,
        total: entryFees.total + swapFees
      },
      taxes: {
        socialCharges: taxes.socialCharges,
        incomeTax: taxes.incomeTax,
        total: taxes.total
      },
      netGain,
      netReturn: (netGain / investment.amount) * 100,
      stopLoss: {
        percentage: investment.stopLoss,
        amount: stopLossAmount,
        potentialLoss
      },
      newCapital,
      reinvestment: this.shouldReinvest(investment, period) ? netGain : 0
    };
  }

  /**
   * Calcule les résultats pour toutes les périodes
   * @param {Object} investment - Objet Investment
   * @param {number} annualIncome - Revenu annuel
   * @returns {Object} Résultats pour toutes les périodes
   */
  static simulateAllPeriods(investment, annualIncome = 0) {
    const periods = ['daily', 'weekly', 'monthly', 'yearly'];
    const results = {};

    for (const period of periods) {
      results[period] = this.simulate(investment, period, annualIncome);
    }

    return results;
  }

  /**
   * Calcule les frais de swap overnight
   * @param {number} leveragedAmount - Montant avec levier
   * @param {number} leverage - Bras de levier
   * @param {number} days - Nombre de jours
   * @param {string} platform - Plateforme
   * @returns {number} Frais de swap
   */
  static calculateSwapFees(leveragedAmount, leverage, days, platform) {
    if (leverage <= 1) return 0;

    const fees = PlatformFees.calculate(leveragedAmount, 'action', leverage);
    const dailySwapRate = fees.swapRate || 0;

    return leveragedAmount * dailySwapRate * days;
  }

  /**
   * Convertit une période en nombre de jours
   * @param {string} period - 'daily', 'weekly', 'monthly', 'yearly'
   * @returns {number} Nombre de jours
   */
  static getDaysInPeriod(period) {
    const mapping = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365
    };
    return mapping[period] || 365;
  }

  /**
   * Détermine si on doit réinvestir selon la fréquence
   * @param {Object} investment - Objet Investment
   * @param {string} period - Période actuelle
   * @returns {boolean} True si réinvestissement nécessaire
   */
  static shouldReinvest(investment, period) {
    return investment.reinvestFrequency === period;
  }

  /**
   * Optimise les paramètres d'investissement
   * @param {Object} constraints - Contraintes (montant max, risque max, etc.)
   * @returns {Object} Paramètres optimaux suggérés
   */
  static optimize(constraints = {}) {
    // Algorithme d'optimisation simplifié
    // À améliorer avec des algorithmes plus sophistiqués

    const suggestions = {
      amount: constraints.maxAmount || 1000,
      leverage: constraints.maxRisk || 3,
      reinvestFrequency: 'monthly',
      stopLoss: 5
    };

    return suggestions;
  }
}

