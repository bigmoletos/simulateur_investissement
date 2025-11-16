/**
 * Service de stockage IndexedDB pour le simulateur de placement
 *
 * Stocke les simulations, paramètres utilisateur et historique
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

import type { Investment, SimulationHistory, UserSettings } from '../types/index.js';

const DB_NAME = 'SimulateurPlacement';
const DB_VERSION = 1;

interface Database {
	investments: Investment[];
	simulationHistory: SimulationHistory[];
	userSettings: UserSettings;
}

/**
 * Ouvre la base de données IndexedDB
 */
function openDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			// Store pour les investissements
			if (!db.objectStoreNames.contains('investments')) {
				const investmentStore = db.createObjectStore('investments', { keyPath: 'id' });
				investmentStore.createIndex('platform', 'platform', { unique: false });
				investmentStore.createIndex('assetType', 'assetType', { unique: false });
				investmentStore.createIndex('createdAt', 'createdAt', { unique: false });
			}

			// Store pour l'historique des simulations
			if (!db.objectStoreNames.contains('simulationHistory')) {
				const historyStore = db.createObjectStore('simulationHistory', { keyPath: 'id' });
				historyStore.createIndex('savedAt', 'savedAt', { unique: false });
				historyStore.createIndex('investmentId', 'investment.id', { unique: false });
			}

			// Store pour les paramètres utilisateur (singleton)
			if (!db.objectStoreNames.contains('userSettings')) {
				db.createObjectStore('userSettings', { keyPath: 'id' });
			}
		};
	});
}

/**
 * Sauvegarde un investissement
 */
export async function saveInvestment(investment: Investment): Promise<void> {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['investments'], 'readwrite');
		const store = transaction.objectStore('investments');
		const request = store.put(investment);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
}

/**
 * Charge un investissement par ID
 */
export async function loadInvestment(id: string): Promise<Investment | null> {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['investments'], 'readonly');
		const store = transaction.objectStore('investments');
		const request = store.get(id);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result || null);
	});
}

/**
 * Liste tous les investissements
 */
export async function listInvestments(): Promise<Investment[]> {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['investments'], 'readonly');
		const store = transaction.objectStore('investments');
		const request = store.getAll();

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result || []);
	});
}

/**
 * Supprime un investissement
 */
export async function deleteInvestment(id: string): Promise<void> {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['investments'], 'readwrite');
		const store = transaction.objectStore('investments');
		const request = store.delete(id);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
}

/**
 * Sauvegarde une simulation dans l'historique
 */
export async function saveSimulationHistory(history: SimulationHistory): Promise<void> {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['simulationHistory'], 'readwrite');
		const store = transaction.objectStore('simulationHistory');
		const request = store.put(history);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
}

/**
 * Charge l'historique des simulations
 */
export async function loadSimulationHistory(): Promise<SimulationHistory[]> {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['simulationHistory'], 'readonly');
		const store = transaction.objectStore('simulationHistory');
		const index = store.index('savedAt');
		const request = index.getAll();

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			const results = request.result || [];
			// Trier par date décroissante (plus récent en premier)
			results.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
			resolve(results);
		};
	});
}

/**
 * Sauvegarde les paramètres utilisateur
 */
export async function saveUserSettings(settings: UserSettings): Promise<void> {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['userSettings'], 'readwrite');
		const store = transaction.objectStore('userSettings');
		// Utiliser un ID fixe pour le singleton
		const settingsWithId = { ...settings, id: 'user-settings' };
		const request = store.put(settingsWithId);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
}

/**
 * Charge les paramètres utilisateur
 */
export async function loadUserSettings(): Promise<UserSettings | null> {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['userSettings'], 'readonly');
		const store = transaction.objectStore('userSettings');
		const request = store.get('user-settings');

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			const result = request.result;
			if (result) {
				// Retirer l'ID ajouté pour le stockage
				const { id, ...settings } = result;
				resolve(settings as UserSettings);
			} else {
				resolve(null);
			}
		};
	});
}

