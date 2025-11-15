/**
 * Service de calcul des frais selon la plateforme
 *
 * Sources:
 * - XTB: https://www.xtb.com/fr/frais-et-commissions
 * - eToro: https://www.etoro.com/fr/help/91/3600/commissions-et-frais
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

export class PlatformFees {
  /**
   * Calcule les frais de transaction pour XTB
   * @param {number} amount - Montant de la transaction
   * @param {string} assetType - Type d'actif
   * @param {number} leverage - Bras de levier
   * @returns {Object} { spread: number, commission: number, total: number }
   */
  static calculateXTB(amount, assetType, leverage = 1) {
    let spread = 0;
    let commission = 0;

    // Spread selon le type d'actif (exemples - à ajuster avec les valeurs réelles)
    const spreadRates = {
      action: 0.001, // 0.1% en moyenne
      fonds: 0.002, // 0.2%
      etf: 0.0005 // 0.05%
    };

    spread = amount * (spreadRates[assetType] || 0.001);

    // Commission XTB: généralement 0% sur actions/ETF pour les comptes standard
    // Mais peut varier selon le type de compte
    commission = 0;

    // Swap overnight pour positions avec levier (approximation)
    // Le swap dépend de nombreux facteurs, ici on utilise une estimation
    const swapRate = leverage > 1 ? 0.0001 * (leverage - 1) : 0; // 0.01% par niveau de levier au-delà de 1

    return {
      spread,
      commission,
      swapRate,
      total: spread + commission
    };
  }

  /**
   * Calcule les frais de transaction pour eToro
   * @param {number} amount - Montant de la transaction
   * @param {string} assetType - Type d'actif
   * @param {number} leverage - Bras de levier
   * @returns {Object} { spread: number, commission: number, withdrawal: number, total: number }
   */
  static calculateEToro(amount, assetType, leverage = 1) {
    let spread = 0;
    let commission = 0;
    let withdrawal = 0;

    // Spread eToro (exemples - à ajuster avec les valeurs réelles)
    const spreadRates = {
      action: 0.0015, // 0.15% en moyenne
      fonds: 0.002, // 0.2%
      etf: 0.001 // 0.1%
    };

    spread = amount * (spreadRates[assetType] || 0.0015);

    // Commission eToro: généralement 0% sur les actions/ETF
    commission = 0;

    // Frais de retrait: 5$ par retrait (approximation)
    withdrawal = 5;

    // Swap overnight pour positions avec levier
    const swapRate = leverage > 1 ? 0.00015 * (leverage - 1) : 0;

    return {
      spread,
      commission,
      withdrawal,
      swapRate,
      total: spread + commission
    };
  }

  /**
   * Calcule les frais selon la plateforme
   * @param {string} platform - 'xtb' ou 'etoro'
   * @param {number} amount - Montant de la transaction
   * @param {string} assetType - Type d'actif
   * @param {number} leverage - Bras de levier
   * @returns {Object} Détails des frais
   */
  static calculate(platform, amount, assetType, leverage = 1) {
    if (platform === 'xtb') {
      return this.calculateXTB(amount, assetType, leverage);
    } else if (platform === 'etoro') {
      return this.calculateEToro(amount, assetType, leverage);
    }
    throw new Error(`Plateforme non supportée: ${platform}`);
  }
}

