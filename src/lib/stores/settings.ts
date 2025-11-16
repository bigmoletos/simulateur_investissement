/**
 * Store Svelte pour les paramètres utilisateur
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

import { writable } from 'svelte/store';
import { loadUserSettings, saveUserSettings } from '../storage/db.js';
import type { UserSettings } from '../types/index.js';
import { logger } from '../utils/logger.js';

const defaultSettings: UserSettings = {
	annualIncome: 15000,
	defaultPlatform: 'etoro',
	defaultAssetType: 'action',
	defaultLeverage: 1,
	defaultStopLoss: 5,
	theme: 'auto',
	currency: 'EUR',
	updatedAt: new Date()
};

function createSettingsStore() {
	const { subscribe, set, update } = writable<UserSettings>(defaultSettings);

	return {
		subscribe,
		set,
		update,
		load: async () => {
			try {
				// Vérifier que nous sommes dans le navigateur avant d'accéder à IndexedDB
				if (typeof window === 'undefined' || !window.indexedDB) {
					logger.info('IndexedDB non disponible, utilisation des valeurs par défaut');
					return;
				}
				const settings = await loadUserSettings();
				if (settings) {
					set(settings);
					logger.info('Paramètres utilisateur chargés', { settings });
				} else {
					logger.info('Aucun paramètre utilisateur trouvé, utilisation des valeurs par défaut');
				}
			} catch (error) {
				logger.error('Erreur lors du chargement des paramètres', { error });
				// En cas d'erreur, utiliser les valeurs par défaut
			}
		},
		save: async (settings: UserSettings) => {
			try {
				// Vérifier que nous sommes dans le navigateur avant d'accéder à IndexedDB
				if (typeof window === 'undefined' || !window.indexedDB) {
					logger.warn('IndexedDB non disponible, impossible de sauvegarder les paramètres');
					set(settings); // Mettre à jour le store quand même
					return;
				}
				await saveUserSettings(settings);
				set(settings);
				logger.info('Paramètres utilisateur sauvegardés', { settings });
			} catch (error) {
				logger.error('Erreur lors de la sauvegarde des paramètres', { error });
				// Mettre à jour le store même en cas d'erreur de sauvegarde
				set(settings);
				throw error;
			}
		}
	};
}

export const settings = createSettingsStore();

