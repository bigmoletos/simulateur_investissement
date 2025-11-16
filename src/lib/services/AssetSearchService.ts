/**
 * Service de recherche d'actifs (ETF, actions) avec autocomplétion
 *
 * Utilise des APIs gratuites pour rechercher des actifs financiers
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

import { logger } from '../utils/logger.js';

export interface AssetSearchResult {
	name: string;
	ticker: string;
	isin?: string;
	type: 'etf' | 'stock' | 'fund';
	exchange?: string;
	currency?: string;
}

/**
 * Service de recherche d'actifs avec autocomplétion
 */
export class AssetSearchService {
	/**
	 * Recherche des actifs correspondant à une requête
	 * Utilise plusieurs sources gratuites pour maximiser les résultats
	 *
	 * @param query Terme de recherche (nom, ticker, ISIN)
	 * @param limit Nombre maximum de résultats
	 */
	static async search(query: string, limit: number = 10): Promise<AssetSearchResult[]> {
		if (!query || query.trim().length < 2) {
			return [];
		}

		const searchTerm = query.trim().toUpperCase();
		const results: AssetSearchResult[] = [];

		try {
			// Recherche dans une base de données locale d'ETF populaires
			// Pour une vraie application, on utiliserait une API comme:
			// - justETF API (si disponible)
			// - Yahoo Finance API
			// - Alpha Vantage (gratuit avec clé API)

			const localResults = this.searchLocalDatabase(searchTerm, limit);
			results.push(...localResults);

			// Si on a moins de résultats que demandé, essayer une recherche externe
			if (results.length < limit) {
				// Pour l'instant, on utilise uniquement la base locale
				// Dans une vraie application, on ferait un appel API ici
			}

			logger.debug('Recherche d\'actifs', { query, resultsCount: results.length });

			return results.slice(0, limit);
		} catch (error) {
			logger.error('Erreur lors de la recherche d\'actifs', error);
			return [];
		}
	}

	/**
	 * Base de données locale d'ETF populaires
	 * Contient les ETF les plus courants avec leurs informations
	 */
	private static searchLocalDatabase(query: string, limit: number): AssetSearchResult[] {
		const database: AssetSearchResult[] = [
			{
				name: 'iShares USD Treasury Bond 0-1yr UCITS ETF (Acc)',
				ticker: 'IBC1',
				isin: 'IE00BGSF1X88',
				type: 'etf',
				exchange: 'LSE',
				currency: 'USD'
			},
			{
				name: 'iShares Core MSCI World UCITS ETF',
				ticker: 'IWDA',
				isin: 'IE00B4L5Y983',
				type: 'etf',
				exchange: 'LSE',
				currency: 'USD'
			},
			{
				name: 'iShares Core S&P 500 UCITS ETF',
				ticker: 'CSPX',
				isin: 'IE00B5BMR087',
				type: 'etf',
				exchange: 'LSE',
				currency: 'USD'
			},
			{
				name: 'iShares Core Euro Government Bond UCITS ETF',
				ticker: 'IEGA',
				isin: 'IE00B3F81R35',
				type: 'etf',
				exchange: 'XETR',
				currency: 'EUR'
			},
			{
				name: 'Vanguard FTSE All-World UCITS ETF',
				ticker: 'VWCE',
				isin: 'IE00BK5BQT80',
				type: 'etf',
				exchange: 'XETR',
				currency: 'EUR'
			},
			{
				name: 'Amundi MSCI World UCITS ETF',
				ticker: 'CW8',
				isin: 'LU1681043599',
				type: 'etf',
				exchange: 'EURONEXT',
				currency: 'EUR'
			},
			{
				name: 'Lyxor MSCI World UCITS ETF',
				ticker: 'EWLD',
				isin: 'FR0010315770',
				type: 'etf',
				exchange: 'EURONEXT',
				currency: 'EUR'
			}
		];

		// Recherche par nom, ticker ou ISIN
		const filtered = database.filter(asset => {
			const nameMatch = asset.name.toUpperCase().includes(query);
			const tickerMatch = asset.ticker.toUpperCase().includes(query);
			const isinMatch = asset.isin?.toUpperCase().includes(query);
			return nameMatch || tickerMatch || isinMatch;
		});

		return filtered.slice(0, limit);
	}

	/**
	 * Recherche un actif par son ISIN exact
	 */
	static async findByISIN(isin: string): Promise<AssetSearchResult | null> {
		const results = await this.search(isin, 1);
		return results.find(r => r.isin?.toUpperCase() === isin.toUpperCase()) || null;
	}

	/**
	 * Recherche un actif par son ticker exact
	 */
	static async findByTicker(ticker: string): Promise<AssetSearchResult | null> {
		const results = await this.search(ticker, 10);
		return results.find(r => r.ticker.toUpperCase() === ticker.toUpperCase()) || null;
	}
}

