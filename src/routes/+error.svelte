<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	// Déclarer les props pour éviter les warnings SvelteKit
	export let error: any = null;
	export let event: any = null;
	export let params: Record<string, string> = {};

	let errorMessage = 'Une erreur est survenue';

	onMount(() => {
		// Récupérer le message d'erreur depuis l'erreur ou l'URL
		if (error?.message) {
			errorMessage = error.message;
		} else {
			const urlParams = new URLSearchParams(window.location.search);
			const message = urlParams.get('message');
			if (message) {
				errorMessage = decodeURIComponent(message);
			}
		}
	});
</script>

<div class="error-container">
	<h1>❌ Erreur</h1>
	<p class="error-message">{errorMessage}</p>
	<p class="error-help">
		Si le problème persiste, veuillez vérifier la console du navigateur pour plus de détails.
	</p>
	<a href="/" class="back-link">← Retour à l'accueil</a>
</div>

<style>
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		text-align: center;
	}

	.error-container h1 {
		font-size: 2rem;
		color: var(--text-primary, #333);
		margin-bottom: 1rem;
	}

	.error-message {
		font-size: 1.2rem;
		color: var(--text-secondary, #666);
		margin-bottom: 1rem;
		padding: 1rem;
		background: var(--bg-secondary, #f5f5f5);
		border-radius: 8px;
		border-left: 4px solid #ef4444;
	}

	.error-help {
		font-size: 0.9rem;
		color: var(--text-secondary, #999);
		margin-bottom: 2rem;
	}

	.back-link {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 600;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.back-link:hover {
		background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	:global(:root.dark) .error-container h1 {
		color: var(--text-primary);
	}

	:global(:root.dark) .error-message {
		background: var(--bg-secondary);
		color: var(--text-secondary);
	}

	:global(:root.dark) .error-help {
		color: var(--text-secondary);
	}
</style>

