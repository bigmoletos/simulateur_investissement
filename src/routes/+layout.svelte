<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { settings } from '../lib/stores/settings.js';
	import { theme } from '../lib/stores/theme.js';
	import { browser } from '$app/environment';
	// Déclarer les props pour éviter les warnings SvelteKit
	export let data: any = {};
	export let params: Record<string, string> = {};

	function getSystemTheme(): 'light' | 'dark' {
		if (!browser) return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function getEffectiveTheme(currentTheme: string): 'light' | 'dark' {
		if (!browser) return 'light';
		if (currentTheme === 'auto') {
			return getSystemTheme();
		}
		return currentTheme as 'light' | 'dark';
	}

	onMount(async () => {
		// Charger les paramètres utilisateur au démarrage
		await settings.load();
		// Initialiser le thème après le chargement des settings
		theme.init();

		// Enregistrer le service worker pour la PWA
		if (browser && 'serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.register('/service-worker.js', {
					scope: '/'
				});
				console.log('[PWA] Service Worker enregistré avec succès:', registration.scope);

				// Vérifier les mises à jour périodiquement
				registration.addEventListener('updatefound', () => {
					const newWorker = registration.installing;
					if (newWorker) {
						newWorker.addEventListener('statechange', () => {
							if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
								// Nouvelle version disponible
								console.log('[PWA] Nouvelle version disponible');
								// Optionnel : afficher une notification à l'utilisateur
								if (confirm('Une nouvelle version est disponible. Voulez-vous recharger la page ?')) {
									newWorker.postMessage({ type: 'SKIP_WAITING' });
									window.location.reload();
								}
							}
						});
					}
				});

				// Vérifier les mises à jour toutes les heures
				setInterval(() => {
					registration.update();
				}, 60 * 60 * 1000);
			} catch (error) {
				console.error('[PWA] Erreur lors de l\'enregistrement du Service Worker:', error);
			}
		}
	});
</script>

<div class="theme-toggle-container">
	<button
		class="theme-toggle"
		on:click={() => theme.toggle()}
		aria-label="Basculer entre mode clair et sombre"
		title="Basculer le thème"
	>
		{#if browser}
			{#key $theme}
				{#if getEffectiveTheme($theme) === 'dark'}
					<span class="theme-icon">☀️</span>
					<span class="theme-label">Mode clair</span>
				{:else}
					<span class="theme-icon">🌙</span>
					<span class="theme-label">Mode sombre</span>
				{/if}
			{/key}
		{:else}
			<span class="theme-icon">🌙</span>
			<span class="theme-label">Mode sombre</span>
		{/if}
	</button>
</div>

<slot />

