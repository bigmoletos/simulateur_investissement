<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { settings } from '../lib/stores/settings.js';

	onMount(() => {
		// Charger les paramètres utilisateur au démarrage
		settings.load();
	});
</script>

<slot />

