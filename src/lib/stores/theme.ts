/**
 * Store Svelte pour la gestion du thème (mode sombre/clair)
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { settings } from './settings.js';

export type Theme = 'light' | 'dark' | 'auto';

function getSystemTheme(): 'light' | 'dark' {
	if (!browser) return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
	if (theme === 'auto') {
		return getSystemTheme();
	}
	return theme;
}

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>('auto');

	// Écouter les changements de préférence système
	if (browser) {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', () => {
			update((currentTheme) => {
				if (currentTheme === 'auto') {
					applyTheme(getEffectiveTheme('auto'));
				}
				return currentTheme;
			});
		});
	}

	function applyTheme(theme: 'light' | 'dark') {
		if (!browser) return;
		const root = document.documentElement;
		if (theme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	}

	return {
		subscribe,
		set: (theme: Theme) => {
			set(theme);
			applyTheme(getEffectiveTheme(theme));
			// Sauvegarder dans les paramètres utilisateur
			settings.update((s) => {
				const updatedSettings = { ...s, theme };
				settings.save(updatedSettings).catch(() => {
					// Ignorer les erreurs de sauvegarde
				});
				return updatedSettings;
			});
		},
		update,
		toggle: () => {
			update((currentTheme) => {
				// Si le thème est 'auto', basculer vers 'dark' ou 'light' selon le thème système actuel
				let newTheme: Theme;
				if (currentTheme === 'auto') {
					newTheme = getSystemTheme() === 'dark' ? 'light' : 'dark';
				} else {
					newTheme = currentTheme === 'dark' ? 'light' : 'dark';
				}
				set(newTheme);
				applyTheme(getEffectiveTheme(newTheme));
				// Sauvegarder dans les paramètres utilisateur
				settings.update((s) => {
					const updatedSettings = { ...s, theme: newTheme };
					settings.save(updatedSettings).catch(() => {
						// Ignorer les erreurs de sauvegarde
					});
					return updatedSettings;
				});
				return newTheme;
			});
		},
		init: () => {
			if (!browser) return;
			try {
				// Charger le thème depuis les paramètres utilisateur
				// Utiliser une subscription unique qui se désabonne automatiquement
				let unsubscribed = false;
				const unsubscribe = settings.subscribe((currentSettings) => {
					if (unsubscribed) return;
					const themeValue = currentSettings?.theme || 'auto';
					set(themeValue);
					applyTheme(getEffectiveTheme(themeValue));
					unsubscribed = true;
					unsubscribe();
				});
			} catch (error) {
				// En cas d'erreur, utiliser le thème par défaut
				console.warn('Erreur lors de l\'initialisation du thème:', error);
				set('auto');
				applyTheme(getEffectiveTheme('auto'));
			}
		}
	};
}

export const theme = createThemeStore();

