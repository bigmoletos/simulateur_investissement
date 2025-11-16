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

