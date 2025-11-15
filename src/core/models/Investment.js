/**
 * Modèle de données pour un investissement
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

export class Investment {
  constructor(data = {}) {
    this.amount = data.amount || 0; // Montant investi initial
    this.assetType = data.assetType || 'action'; // 'action', 'fonds', 'etf'
    this.platform = data.platform || 'xtb'; // 'xtb', 'etoro'
    this.leverage = data.leverage || 1; // Bras de levier (1 à 10)
    this.stopLoss = data.stopLoss || 5; // Stop loss en % (minimum 5%)
    this.reinvestFrequency = data.reinvestFrequency || 'monthly'; // 'daily', 'weekly', 'monthly', 'yearly'
    this.expectedReturn = data.expectedReturn || 0; // Rendement attendu annuel en %
  }

  /**
   * Valide les données de l'investissement
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (this.amount <= 0) {
      errors.push('Le montant investi doit être supérieur à 0');
    }

    if (!['action', 'fonds', 'etf'].includes(this.assetType)) {
      errors.push('Type d\'actif invalide');
    }

    if (!['xtb', 'etoro'].includes(this.platform)) {
      errors.push('Plateforme invalide');
    }

    if (this.leverage < 1 || this.leverage > 10) {
      errors.push('Le bras de levier doit être entre 1 et 10');
    }

    if (this.stopLoss < 5) {
      errors.push('Le stop loss doit être au minimum de 5%');
    }

    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(this.reinvestFrequency)) {
      errors.push('Fréquence de réinvestissement invalide');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

