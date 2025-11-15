/**
 * Service de calcul des impôts selon la réglementation française
 *
 * Sources:
 * - Prélèvements sociaux: 17.2% (2025)
 * - Impôt sur le revenu: selon tranche (0%, 11%, 30%, 41%, 45%)
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

export class TaxCalculator {
  // Prélèvements sociaux 2025
  static SOCIAL_CHARGES_RATE = 0.172; // 17.2%

  // Tranches d'imposition 2025 (approximatif)
  static TAX_BRACKETS = [
    { min: 0, max: 11294, rate: 0 },
    { min: 11294, max: 28797, rate: 0.11 },
    { min: 28797, max: 82341, rate: 0.30 },
    { min: 82341, max: 177106, rate: 0.41 },
    { min: 177106, max: Infinity, rate: 0.45 }
  ];

  /**
   * Calcule les impôts sur les plus-values
   * @param {number} gain - Gain réalisé
   * @param {number} annualIncome - Revenu annuel pour déterminer la tranche d'imposition
   * @returns {Object} { socialCharges: number, incomeTax: number, total: number }
   */
  static calculate(gain, annualIncome = 0) {
    // Prélèvements sociaux (toujours appliqués)
    const socialCharges = gain * this.SOCIAL_CHARGES_RATE;

    // Impôt sur le revenu selon la tranche
    const incomeTax = this.calculateIncomeTax(gain, annualIncome);

    return {
      socialCharges,
      incomeTax,
      total: socialCharges + incomeTax,
      netGain: gain - socialCharges - incomeTax
    };
  }

  /**
   * Calcule l'impôt sur le revenu selon la tranche
   * @param {number} gain - Gain réalisé
   * @param {number} annualIncome - Revenu annuel
   * @returns {number} Montant de l'impôt
   */
  static calculateIncomeTax(gain, annualIncome) {
    // Calcul simplifié: on applique le taux de la tranche correspondant au revenu
    const totalIncome = annualIncome + gain;
    let tax = 0;

    for (const bracket of this.TAX_BRACKETS) {
      if (totalIncome > bracket.min) {
        const taxableAmount = Math.min(totalIncome, bracket.max) - bracket.min;
        tax += taxableAmount * bracket.rate;
      }
      if (totalIncome <= bracket.max) break;
    }

    // On soustrait l'impôt déjà payé sur le revenu annuel
    let existingTax = 0;
    for (const bracket of this.TAX_BRACKETS) {
      if (annualIncome > bracket.min) {
        const taxableAmount = Math.min(annualIncome, bracket.max) - bracket.min;
        existingTax += taxableAmount * bracket.rate;
      }
      if (annualIncome <= bracket.max) break;
    }

    return Math.max(0, tax - existingTax);
  }

  /**
   * Calcule le gain net après impôts
   * @param {number} grossGain - Gain brut
   * @param {number} annualIncome - Revenu annuel
   * @returns {number} Gain net
   */
  static calculateNetGain(grossGain, annualIncome = 0) {
    const taxes = this.calculate(grossGain, annualIncome);
    return taxes.netGain;
  }
}

