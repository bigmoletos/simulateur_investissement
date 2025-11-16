<script lang="ts">
	import SimulationSheet from '../lib/components/SimulationSheet.svelte';
</script>

<main>
	<header class="app-header">
		<h1>📊 Simulateur de Placement</h1>
		<p class="subtitle">Simulation précise d'investissement avec calculs de rentabilité nette</p>
	</header>

	<SimulationSheet />
</main>

<style>
	main {
		min-height: 100vh;
		background: var(--bg-secondary, #f5f5f5);
	}

	:global(:root.dark) main {
		background: var(--bg-secondary);
	}

	.app-header {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
		background-image:
			radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.08) 0%, transparent 50%),
			radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
		color: #f5f5f5;
		padding: 2rem;
		text-align: center;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		border-bottom: 1px solid rgba(255, 215, 0, 0.2);
	}

	.app-header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
		font-weight: 600;
	}

	.subtitle {
		margin: 0;
		opacity: 0.9;
		font-size: 1rem;
	}
</style>

